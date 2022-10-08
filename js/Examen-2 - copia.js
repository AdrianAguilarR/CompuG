var gl;
function iniciarGL(canvas) {
	try {
		gl = canvas.getContext("webgl");
        gl.puertoVistaAncho = canvas.width;
        gl.puertoVistaAlto = canvas.height;
	} catch (e) { }
	if (!gl) { alert("Perdone, no se pudo inicializar WebGL"); }
}
function conseguirShader(gl, id) {
	var shaderScript = document.getElementById(id);
	if (!shaderScript) { return null; }
	var str = "";
	var k = shaderScript.firstChild;
	while (k) {
		if (k.nodeType == 3) { str += k.textContent; }
		k = k.nextSibling;
	}
	var shader;
	if (shaderScript.type == "x-shader/x-fragment") {
		shader = gl.createShader(gl.FRAGMENT_SHADER);
	} else if (shaderScript.type == "x-shader/x-vertex") {
		shader = gl.createShader(gl.VERTEX_SHADER);
	} else { return null; }
	gl.shaderSource(shader, str);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert(gl.getShaderInfoLog(shader));
		return null;
	}
	return shader;
}
var progShader;
function iniciarShaders() {
	var fragShader = conseguirShader(gl, "shader-fs");
	var vertShader = conseguirShader(gl, "shader-vs");
	progShader = gl.createProgram();
	gl.attachShader(progShader, vertShader);
	gl.attachShader(progShader, fragShader);
	gl.linkProgram(progShader);
	if (!gl.getProgramParameter(progShader, gl.LINK_STATUS)) {
		alert("Perdone, no pudo inicializarse el Shaders");
	}
	gl.useProgram(progShader);
	progShader.atribPosVertice = gl.getAttribLocation(progShader, "aVerticePosicion");
	gl.enableVertexAttribArray(progShader.atribPosVertice);
	progShader.texturaCoordAtributo = gl.getAttribLocation(progShader, "aTexturaCoord");
	gl.enableVertexAttribArray(progShader.texturaCoordAtributo);
	progShader.vertNormalAtributo = gl.getAttribLocation(progShader, "aVerticeNormal");
	gl.enableVertexAttribArray(progShader.vertNormalAtributo);
	progShader.pMatrizUniforme = gl.getUniformLocation(progShader, "uPMatriz");
	progShader.mvMatrizUniforme = gl.getUniformLocation(progShader, "uMVMatriz");
	progShader.nMatrizUniforme = gl.getUniformLocation(progShader, "uNMatriz");
	progShader.pruebaUniforme = gl.getUniformLocation(progShader, "uMuestra");
	progShader.usoLuzUniforme = gl.getUniformLocation(progShader, "uUsarLuz");
	progShader.ambienteColorUniforme = gl.getUniformLocation(progShader, "uAmbienteColor");
	progShader.localizacionPuntoLuzUniforme = gl.getUniformLocation(progShader, "uPuntoLocalizacionLuz");
	progShader.puntoLuzColorUniforme = gl.getUniformLocation(progShader, "uPuntoLuzColor");
}
function cargarManijaTextura(pTexture) {
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.bindTexture(gl.TEXTURE_2D, pTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, pTexture.imagen);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);
}
var texturaPlaneta = Array();
function iniciarTexturas() {
	for (let i = 0; i < 10; i++) {
		texturaPlaneta[i] = gl.createTexture();
		texturaPlaneta[i].imagen = new Image();
		texturaPlaneta[i].imagen.onload = function () {
			cargarManijaTextura(texturaPlaneta[i])
		}
		texturaPlaneta[i].imagen.src = "img/planeta"+i+".gif";
	}
	
}

var mvMatriz = mat4.create();
var mvMatrizPila = [];
var pMatriz = mat4.create();
function mvApilaMatriz() {
	var copia = mat4.create();
	mat4.set(mvMatriz, copia);
	mvMatrizPila.push(copia);
}
function mvDesapilaMatriz() {
	if (mvMatrizPila.length == 0) {
		throw "Inavalido desapilar matriz!";
	}
	mvMatriz = mvMatrizPila.pop();
}
function modificarMatrizUniforme() {
	gl.uniformMatrix4fv(progShader.pMatrizUniforme, false, pMatriz);
	gl.uniformMatrix4fv(progShader.mvMatrizUniforme, false, mvMatriz);
	var normalMatriz = mat3.create();
	mat4.toInverseMat3(mvMatriz, normalMatriz);
	mat3.transpose(normalMatriz);
	gl.uniformMatrix3fv(progShader.nMatrizUniforme, false, normalMatriz);
}
function gradoRadian(angulo) {
	return angulo * Math.PI / 180;
}


function RadioPlaneta(pRadio) {
	//... caso de la esfera
	var bandaLatitud = 30;
	var bandaLongitud = 30;
	var radio = pRadio;
	var vertPosicionDato = [];
	var normalDato = [];
	var texturaCoordDato = [];
	for (var ultimoNumero=0; ultimoNumero <= bandaLatitud; ultimoNumero++) {
		var theta = ultimoNumero * Math.PI / bandaLatitud;
		var senoTheta = Math.sin(theta);
		var cosenoTheta = Math.cos(theta);
		for (var numeroLargo=0; numeroLargo <= bandaLongitud; numeroLargo++) {
			var phi = numeroLargo * 2 * Math.PI / bandaLongitud;
			var senoPhi = Math.sin(phi);
			var cosenoPhi = Math.cos(phi);
			var x = cosenoPhi * senoTheta;
            var y = cosenoTheta;
            var z = senoPhi * senoTheta;
            var u = 1 - (numeroLargo / bandaLongitud);
            var v = 1 - (ultimoNumero / bandaLatitud);
			normalDato.push(x);
            normalDato.push(y);
            normalDato.push(z);
            texturaCoordDato.push(u);
            texturaCoordDato.push(v);
            vertPosicionDato.push(radio * x);
            vertPosicionDato.push(radio * y);
            vertPosicionDato.push(radio * z);
		}
	}
	var datoIndex = [];
	for (var ultimoNumero=0; ultimoNumero < bandaLatitud; ultimoNumero++) {
		for (var numeroLargo=0; numeroLargo < bandaLongitud; numeroLargo++) {
			var primero = (ultimoNumero * (bandaLongitud + 1)) + numeroLargo;
            var segundo = primero + bandaLongitud + 1;
            datoIndex.push(primero);
            datoIndex.push(segundo);
            datoIndex.push(primero + 1);
            datoIndex.push(segundo);
			datoIndex.push(segundo + 1);
            datoIndex.push(primero + 1);
		}
	}
	lunaVertNormalMemoria = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, lunaVertNormalMemoria);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalDato), gl.STATIC_DRAW);
    lunaVertNormalMemoria.tamanioItem = 3;
    lunaVertNormalMemoria.numeroItem = normalDato.length / 3;
	lunaVertTexturaCoordMemoria = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, lunaVertTexturaCoordMemoria);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texturaCoordDato), gl.STATIC_DRAW);
    lunaVertTexturaCoordMemoria.tamanioItem = 2;
    lunaVertTexturaCoordMemoria.numeroItem = texturaCoordDato.length / 2;
	
	lunaVertPosicionMemoria = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, lunaVertPosicionMemoria);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPosicionDato), gl.STATIC_DRAW);
    lunaVertPosicionMemoria.tamanioItem = 3;
    lunaVertPosicionMemoria.numeroItem = vertPosicionDato.length / 3;
	
	lunaVertIndexMemoria = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, lunaVertIndexMemoria);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(datoIndex), gl.STREAM_DRAW);
    lunaVertIndexMemoria.tamanioItem = 1;
    lunaVertIndexMemoria.numeroItem = datoIndex.length;
}
//var cuboVertPosicionMemoria, cuboVertNormalMemoria, cuboVertTexturaCoordMemoria, cuboVertIndexMemoria;
var lunaVertPosicionMemoria, lunaVertNormalMemoria, lunaVertTexturaCoordMemoria, lunaVertIndexMemoria;
function iniciarMemoria() {
	RadioPlaneta(1);
}
function dibujarPlaneta(ptraslate,ptex,pAngulo,pEscala){
    var lighting = document.getElementById("lighting").checked;
    gl.uniform1i(progShader.usoLuzUniforme, lighting);
    if (lighting) {
		gl.uniform3f(progShader.ambienteColorUniforme,
			parseFloat(document.getElementById("ambienteR").value),
			parseFloat(document.getElementById("ambienteG").value),
			parseFloat(document.getElementById("ambienteB").value));
		gl.uniform3f(progShader.localizacionPuntoLuzUniforme,
            parseFloat(document.getElementById("posicionLuzX").value),
            parseFloat(document.getElementById("posicionLuzY").value),
            parseFloat(document.getElementById("posicionLuzZ").value));
		gl.uniform3f(progShader.puntoLuzColorUniforme,
			parseFloat(document.getElementById("puntoR").value),
            parseFloat(document.getElementById("puntoG").value),
            parseFloat(document.getElementById("puntoB").value));
	}
	mat4.identity(mvMatriz);
	mat4.translate(mvMatriz, [0, 0, -60]);
	
	mvApilaMatriz();
	mat4.rotate(mvMatriz, gradoRadian(pAngulo), [0, 1, 0]);
    mat4.translate(mvMatriz, ptraslate);
	mat4.scale(mvMatriz, pEscala);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, ptex);
    gl.uniform1i(progShader.pruebaUniforme, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, lunaVertPosicionMemoria);
    gl.vertexAttribPointer(progShader.atribPosVertice, lunaVertPosicionMemoria.tamanioItem, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, lunaVertTexturaCoordMemoria);
    gl.vertexAttribPointer(progShader.texturaCoordAtributo, lunaVertTexturaCoordMemoria.tamanioItem, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, lunaVertNormalMemoria);
    gl.vertexAttribPointer(progShader.vertNormalAtributo, lunaVertNormalMemoria.tamanioItem, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, lunaVertIndexMemoria);
    modificarMatrizUniforme();
    gl.drawElements(gl.TRIANGLES, lunaVertIndexMemoria.numeroItem, gl.UNSIGNED_SHORT, 0);
    mvDesapilaMatriz();

    return lunaVertIndexMemoria;
} 
var anguloLuna = 180;
var anguloSol = 180,escalaSol = 3.00; 
var anguloMercurio = 180,escalaMercurio = 0.38;
var anguloVenus = 180,escalaVenus = 0.815 ; 
var anguloTierra = 180,escalaTierra = 1; 
var anguloMarte = 180, escalaMarte = 2; 
var anguloJupiter = 180, escalaJupiter = 3.9 ; 
var anguloSaturno = 180, escalaSaturno = 3;   
var anguloUrano = 180, escalaUrano = 2.5; 
var anguloNeptuno = 180, escalaNeptuno = 2.5; 

var cuboAngulo = 0;
function dibujarEscena() {
	gl.viewport(0, 0, gl.puertoVistaAncho, gl.puertoVistaAlto);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	mat4.perspective(45, gl.puertoVistaAncho / gl.puertoVistaAlto, 0.1, 100.0, pMatriz);

	Sol = dibujarPlaneta([0, 0, 0],texturaPlaneta[0],anguloSol,[escalaSol,escalaSol,escalaSol]);
	Mercurio = dibujarPlaneta([4, 0, 0],texturaPlaneta[1],anguloMercurio,[escalaMercurio,escalaMercurio,escalaMercurio]);
	Venus = dibujarPlaneta([6, 0, 0],texturaPlaneta[2],anguloVenus,[escalaVenus,escalaVenus,escalaVenus]);
	Tierra = dibujarPlaneta([8, 0, 0],texturaPlaneta[3],anguloTierra,[escalaTierra,escalaTierra,escalaTierra]);
    Marte = dibujarPlaneta([12, 0, 0],texturaPlaneta[4],anguloMarte,[escalaMarte,escalaMarte,escalaMarte]);
	Jupiter = dibujarPlaneta([18, 0, 0],texturaPlaneta[5],anguloJupiter,[escalaJupiter,escalaJupiter,escalaJupiter]);
	Saturno = dibujarPlaneta([26, 0, 0],texturaPlaneta[6],anguloSaturno,[escalaSaturno,escalaSaturno,escalaSaturno]);
	Urano = dibujarPlaneta([32, 0, 0],texturaPlaneta[7],anguloUrano,[escalaUrano,escalaUrano,escalaUrano]);
	Neptuno = dibujarPlaneta([38, 0, 0],texturaPlaneta[8],anguloNeptuno,[escalaNeptuno,escalaNeptuno,escalaNeptuno]);


}
var ultimoTiempo = 0;
function animacion() {
	var tiempoActual = new Date().getTime();
    if (ultimoTiempo != 0) {
		var transcurrido = tiempoActual - ultimoTiempo;
		anguloLuna += 0.05 * transcurrido;
		anguloSol += (0.0 / 1) * transcurrido;
		anguloMercurio += (0.5 / 3.38) * transcurrido;
		anguloVenus += (0.5 / 8.65)* transcurrido;
		anguloTierra += (0.5 / 14.03) * transcurrido;
		anguloMarte += (1 / 26.42) * transcurrido;
		anguloJupiter += (2 / 132.84) * transcurrido;
		anguloSaturno += (2/ 413.57)* transcurrido;
		anguloUrano += (3 / 1179.38) * transcurrido;
		anguloNeptuno += (3 / 2313.76) * transcurrido;
		
		cuboAngulo += 0.05 * transcurrido;
	}
	ultimoTiempo = tiempoActual;
}
function momento() {
	requestAnimFrame(momento);
	dibujarEscena();
	animacion();
}
function ejecutarWebGL() {
	var canvas = document.getElementById("leccio08-esfera");
    iniciarGL(canvas);
    iniciarShaders();
    iniciarMemoria();
    iniciarTexturas();
	gl.clearColor(0.0, 0.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
	momento();
}