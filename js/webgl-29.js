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
var lunaTextura, cajaTextura;
function iniciarTexturas() {
	lunaTextura = gl.createTexture();
    lunaTextura.imagen = new Image();
    lunaTextura.imagen.onload = function () {
		cargarManijaTextura(lunaTextura)
	}
	lunaTextura.imagen.src = "img/moon.gif";
	cajaTextura = gl.createTexture();
    cajaTextura.imagen = new Image();
    cajaTextura.imagen.onload = function () {
		cargarManijaTextura(cajaTextura)
	}
	cajaTextura.imagen.src = "img/crate.gif";
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
function puntosPoligono(pVertices, pTamanio, pNumero){
	var poligono = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, poligono);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pVertices), gl.STATIC_DRAW);
	poligono.tamanioItem = pTamanio;
	poligono.numeroItem = pNumero;
	return poligono;
}
function normalPoligono(pNormal, pTamanio, pNumero){
	var normal= gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, normal);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pNormal), gl.STATIC_DRAW);
	normal.tamanioItem = pTamanio;
	normal.numeroItem = pNumero;
	return normal;
}
function texturaPoligono(pTextura, pTamanio, pNumero){
	var textura = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, textura);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pTextura), gl.STATIC_DRAW);
	textura.tamanioItem = pTamanio;
	textura.numeroItem = pNumero;
	return textura;
}
function indexPoligono(pIndex, pTamanio, pNumero){
	var index = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(pIndex), gl.STATIC_DRAW);
	index.tamanioItem = pTamanio;
	index.numeroItem = pNumero;
	return index;
}
var cuboVertPosicionMemoria, cuboVertNormalMemoria, cuboVertTexturaCoordMemoria, cuboVertIndexMemoria;
var lunaVertPosicionMemoria, lunaVertNormalMemoria, lunaVertTexturaCoordMemoria, lunaVertIndexMemoria;
function iniciarMemoria() {
	//... caso del cubo
    cuboVertPosicionMemoria= puntosPoligono([-1.0, -1.0,  1.0, 1.0, -1.0,  1.0, 1.0,  1.0,  1.0, -1.0,  1.0,  1.0, // Front face
		-1.0, -1.0, -1.0, -1.0,  1.0, -1.0, 1.0,  1.0, -1.0, 1.0, -1.0, -1.0, // Back face
		-1.0,  1.0, -1.0, -1.0,  1.0,  1.0, 1.0,  1.0,  1.0, 1.0,  1.0, -1.0, // Top face
		-1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0,  1.0, -1.0, -1.0,  1.0, // Bottom face
		1.0, -1.0, -1.0, 1.0,  1.0, -1.0, 1.0,  1.0,  1.0, 1.0, -1.0,  1.0, // Right face
		-1.0, -1.0, -1.0, -1.0, -1.0,  1.0, -1.0,  1.0,  1.0, -1.0,  1.0, -1.0], 3, 24);
	cuboVertNormalMemoria= normalPoligono([0.0,  0.0,  1.0, 0.0,  0.0,  1.0, 0.0,  0.0,  1.0, 0.0,  0.0,  1.0, // Front face
		0.0,  0.0, -1.0, 0.0,  0.0, -1.0, 0.0,  0.0, -1.0, 0.0,  0.0, -1.0, // Back face
		0.0,  1.0,  0.0, 0.0,  1.0,  0.0, 0.0,  1.0,  0.0, 0.0,  1.0,  0.0, // Top face
		0.0, -1.0,  0.0, 0.0, -1.0,  0.0, 0.0, -1.0,  0.0, 0.0, -1.0,  0.0, // Bottom face
		1.0,  0.0,  0.0, 1.0,  0.0,  0.0, 1.0,  0.0,  0.0, 1.0,  0.0,  0.0, // Right face
		-1.0,  0.0,  0.0, -1.0,  0.0,  0.0, -1.0,  0.0,  0.0, -1.0,  0.0,  0.0], 3, 24);
	cuboVertTexturaCoordMemoria= texturaPoligono([0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, // Front face
		1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0, // Back face
		0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, // Top face
		1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, // Bottom face
		1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0, // Right face
		0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0],2, 24);
	cuboVertIndexMemoria= indexPoligono([0, 1, 2,  0, 2, 3,    // Front face
		4, 5, 6,  4, 6, 7,    // Back face
		8, 9, 10,  8, 10, 11,  // Top face
		12, 13, 14,  12, 14, 15, // Bottom face
		16, 17, 18,  16, 18, 19, // Right face
		20, 21, 22,  20, 22, 23], 1, 36);
		
	//... caso de la esfera
	var bandaLatitud = 30;
	var bandaLongitud = 30;
	var radio = 2;
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
var anguloLuna = 180;
var cuboAngulo = 0;
function dibujarEscena() {
	gl.viewport(0, 0, gl.puertoVistaAncho, gl.puertoVistaAlto);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	mat4.perspective(45, gl.puertoVistaAncho / gl.puertoVistaAlto, 0.1, 100.0, pMatriz);
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
	mat4.translate(mvMatriz, [0, 0, -20]);
	
	mvApilaMatriz();
	mat4.rotate(mvMatriz, gradoRadian(anguloLuna), [0, 1, 0]);
    mat4.translate(mvMatriz, [5, 0, 0]);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, lunaTextura);
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

    mvApilaMatriz();
    mat4.rotate(mvMatriz, gradoRadian(cuboAngulo), [0, 1, 0]);
    mat4.translate(mvMatriz, [5, 0, 0]);
    gl.bindBuffer(gl.ARRAY_BUFFER, cuboVertPosicionMemoria);
    gl.vertexAttribPointer(progShader.atribPosVertice, cuboVertPosicionMemoria.tamanioItem, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, cuboVertNormalMemoria);
    gl.vertexAttribPointer(progShader.vertNormalAtributo, cuboVertNormalMemoria.tamanioItem, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, cuboVertTexturaCoordMemoria);
    gl.vertexAttribPointer(progShader.texturaCoordAtributo, cuboVertTexturaCoordMemoria.tamanioItem, gl.FLOAT, false, 0, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, cajaTextura);
    gl.uniform1i(progShader.pruebaUniforme, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cuboVertIndexMemoria);
    modificarMatrizUniforme();
    gl.drawElements(gl.TRIANGLES, cuboVertIndexMemoria.numeroItem, gl.UNSIGNED_SHORT, 0);
    mvDesapilaMatriz();
}
var ultimoTiempo = 0;
function animacion() {
	var tiempoActual = new Date().getTime();
    if (ultimoTiempo != 0) {
		var transcurrido = tiempoActual - ultimoTiempo;
		anguloLuna += 0.05 * transcurrido;
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
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
	momento();
}