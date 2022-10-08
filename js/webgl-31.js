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
var lunaTextura, mercurioTextura, venusTextura, tierraTextura, marteTextura;
function iniciarTexturas() {
	lunaTextura = gl.createTexture();
    lunaTextura.imagen = new Image();
    lunaTextura.imagen.onload = function () {
		cargarManijaTextura(lunaTextura)
	}
	lunaTextura.imagen.src = "img/sol.gif";
	mercurioTextura = gl.createTexture();
    mercurioTextura.imagen = new Image();
    mercurioTextura.imagen.onload = function () {
		cargarManijaTextura(mercurioTextura)
	}
	mercurioTextura.imagen.src = "img/mercurio.gif";
	venusTextura = gl.createTexture();
    venusTextura.imagen = new Image();
    venusTextura.imagen.onload = function () {
		cargarManijaTextura(venusTextura)
	}
	venusTextura.imagen.src = "img/venus.gif";
	tierraTextura = gl.createTexture();
    tierraTextura.imagen = new Image();
    tierraTextura.imagen.onload = function () {
		cargarManijaTextura(tierraTextura)
	}
	tierraTextura.imagen.src = "img/tierra.gif";
	marteTextura = gl.createTexture();
    marteTextura.imagen = new Image();
    marteTextura.imagen.onload = function () {
		cargarManijaTextura(marteTextura)
	}
	marteTextura.imagen.src = "img/marte.gif";
	jupiterTextura = gl.createTexture();
    jupiterTextura.imagen = new Image();
    jupiterTextura.imagen.onload = function () {
		cargarManijaTextura(jupiterTextura)
	}
	jupiterTextura.imagen.src = "img/jupiter.gif";
	saturnoTextura = gl.createTexture();
    saturnoTextura.imagen = new Image();
    saturnoTextura.imagen.onload = function () {
		cargarManijaTextura(saturnoTextura)
	}
	saturnoTextura.imagen.src = "img/saturno.gif";
	uranoTextura = gl.createTexture();
    uranoTextura.imagen = new Image();
    uranoTextura.imagen.onload = function () {
		cargarManijaTextura(uranoTextura)
	}
	uranoTextura.imagen.src = "img/urano.gif";
	neptunoTextura = gl.createTexture();
    neptunoTextura.imagen = new Image();
    neptunoTextura.imagen.onload = function () {
		cargarManijaTextura(neptunoTextura)
	}
	neptunoTextura.imagen.src = "img/neptuno.gif";
	plutonTextura = gl.createTexture();
    plutonTextura.imagen = new Image();
    plutonTextura.imagen.onload = function () {
		cargarManijaTextura(plutonTextura)
	}
	plutonTextura.imagen.src = "img/pluton.gif";
	
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
var mercurioVertPosicionMemoria, mercurioVertNormalMemoria, mercurioVertTexturaCoordMemoria, mercurioVertIndexMemoria;
var venusVertPosicionMemoria, venusVertNormalMemoria, venusVertTexturaCoordMemoria, venusVertIndexMemoria;
var tierraVertPosicionMemoria, tierraVertNormalMemoria, tierraVertTexturaCoordMemoria, tierraVertIndexMemoria;
var marteVertPosicionMemoria, marteVertNormalMemoria, marteVertTexturaCoordMemoria, marteVertIndexMemoria;
var jupiterVertPosicionMemoria, jupiterVertNormalMemoria, jupiterVertTexturaCoordMemoria, jupiterVertIndexMemoria;
var saturnoVertPosicionMemoria, saturnoVertNormalMemoria, saturnoVertTexturaCoordMemoria, saturnoVertIndexMemoria;
var uranoVertPosicionMemoria, uranoVertNormalMemoria, uranoVertTexturaCoordMemoria, uranoVertIndexMemoria;
var neptunoVertPosicionMemoria, neptunoVertNormalMemoria, neptunoVertTexturaCoordMemoria, neptunoVertIndexMemoria;
var plutonVertPosicionMemoria, plutonVertNormalMemoria, plutonVertTexturaCoordMemoria, plutonVertIndexMemoria;
var lunaVertPosicionMemoria, lunaVertNormalMemoria, lunaVertTexturaCoordMemoria, lunaVertIndexMemoria;
function iniciarMemoria() {
	//... caso del cubo
    
		// dibujo del sol
	//... caso de la esfera
	var bandaLatitud = 30;
	var bandaLongitud = 30;
	var radio = 3;
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
	// mercurio
	var bandaLatitud = 30;
	var bandaLongitud = 30;
	var radio = 1;
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
	mercurioVertNormalMemoria = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, mercurioVertNormalMemoria);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalDato), gl.STATIC_DRAW);
    mercurioVertNormalMemoria.tamanioItem = 3;
    mercurioVertNormalMemoria.numeroItem = normalDato.length / 3;
	mercurioVertTexturaCoordMemoria = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, mercurioVertTexturaCoordMemoria);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texturaCoordDato), gl.STATIC_DRAW);
    mercurioVertTexturaCoordMemoria.tamanioItem = 2;
    mercurioVertTexturaCoordMemoria.numeroItem = texturaCoordDato.length / 2;
	
	mercurioVertPosicionMemoria = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, mercurioVertPosicionMemoria);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPosicionDato), gl.STATIC_DRAW);
    mercurioVertPosicionMemoria.tamanioItem = 3;
    mercurioVertPosicionMemoria.numeroItem = vertPosicionDato.length / 3;
	
	mercurioVertIndexMemoria = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mercurioVertIndexMemoria);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(datoIndex), gl.STREAM_DRAW);
    mercurioVertIndexMemoria.tamanioItem = 1;
    mercurioVertIndexMemoria.numeroItem = datoIndex.length;
	// venus
	var bandaLatitud = 30;
	var bandaLongitud = 30;
	var radio = 1.5;
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
	venusVertNormalMemoria = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, venusVertNormalMemoria);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalDato), gl.STATIC_DRAW);
    venusVertNormalMemoria.tamanioItem = 3;
    venusVertNormalMemoria.numeroItem = normalDato.length / 3;
	venusVertTexturaCoordMemoria = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, venusVertTexturaCoordMemoria);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texturaCoordDato), gl.STATIC_DRAW);
	venusVertTexturaCoordMemoria.tamanioItem = 2;
    venusVertTexturaCoordMemoria.numeroItem = texturaCoordDato.length / 2;
	
	venusVertPosicionMemoria = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, venusVertPosicionMemoria);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPosicionDato), gl.STATIC_DRAW);
    venusVertPosicionMemoria.tamanioItem = 3;
    venusVertPosicionMemoria.numeroItem = vertPosicionDato.length / 3;
	
	venusVertIndexMemoria = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, venusVertIndexMemoria);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(datoIndex), gl.STREAM_DRAW);
    venusVertIndexMemoria.tamanioItem = 1;
    venusVertIndexMemoria.numeroItem = datoIndex.length;
	// tierra
	var bandaLatitud = 30;
	var bandaLongitud = 30;
	var radio = 1.5;
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
	tierraVertNormalMemoria = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tierraVertNormalMemoria);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalDato), gl.STATIC_DRAW);
    tierraVertNormalMemoria.tamanioItem = 3;
    tierraVertNormalMemoria.numeroItem = normalDato.length / 3;
	tierraVertTexturaCoordMemoria = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tierraVertTexturaCoordMemoria);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texturaCoordDato), gl.STATIC_DRAW);
    tierraVertTexturaCoordMemoria.tamanioItem = 2;
    tierraVertTexturaCoordMemoria.numeroItem = texturaCoordDato.length / 2;
	
	tierraVertPosicionMemoria = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tierraVertPosicionMemoria);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPosicionDato), gl.STATIC_DRAW);
    tierraVertPosicionMemoria.tamanioItem = 3;
    tierraVertPosicionMemoria.numeroItem = vertPosicionDato.length / 3;
	
	tierraVertIndexMemoria = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, tierraVertIndexMemoria);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(datoIndex), gl.STREAM_DRAW);
    tierraVertIndexMemoria.tamanioItem = 1;
    tierraVertIndexMemoria.numeroItem = datoIndex.length;
	// marte
	var bandaLatitud = 30;
	var bandaLongitud = 30;
	var radio = 1.3;
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
	marteVertNormalMemoria = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, marteVertNormalMemoria);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalDato), gl.STATIC_DRAW);
    marteVertNormalMemoria.tamanioItem = 3;
    marteVertNormalMemoria.numeroItem = normalDato.length / 3;
	marteVertTexturaCoordMemoria = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, marteVertTexturaCoordMemoria);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texturaCoordDato), gl.STATIC_DRAW);
    marteVertTexturaCoordMemoria.tamanioItem = 2;
    marteVertTexturaCoordMemoria.numeroItem = texturaCoordDato.length / 2;
	
	marteVertPosicionMemoria = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, marteVertPosicionMemoria);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPosicionDato), gl.STATIC_DRAW);
    marteVertPosicionMemoria.tamanioItem = 3;
    marteVertPosicionMemoria.numeroItem = vertPosicionDato.length / 3;
	
	marteVertIndexMemoria = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, marteVertIndexMemoria);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(datoIndex), gl.STREAM_DRAW);
    marteVertIndexMemoria.tamanioItem = 1;
    marteVertIndexMemoria.numeroItem = datoIndex.length;
	// jupiter
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
	jupiterVertNormalMemoria = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, jupiterVertNormalMemoria);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalDato), gl.STATIC_DRAW);
    jupiterVertNormalMemoria.tamanioItem = 3;
    jupiterVertNormalMemoria.numeroItem = normalDato.length / 3;
	jupiterVertTexturaCoordMemoria = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, jupiterVertTexturaCoordMemoria);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texturaCoordDato), gl.STATIC_DRAW);
    jupiterVertTexturaCoordMemoria.tamanioItem = 2;
    jupiterVertTexturaCoordMemoria.numeroItem = texturaCoordDato.length / 2;
	
	jupiterVertPosicionMemoria = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, jupiterVertPosicionMemoria);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPosicionDato), gl.STATIC_DRAW);
	jupiterVertPosicionMemoria.tamanioItem = 3;
    jupiterVertPosicionMemoria.numeroItem = vertPosicionDato.length / 3;
	
	jupiterVertIndexMemoria = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, jupiterVertIndexMemoria);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(datoIndex), gl.STREAM_DRAW);
    jupiterVertIndexMemoria.tamanioItem = 1;
    jupiterVertIndexMemoria.numeroItem = datoIndex.length;
	// saturno
	var bandaLatitud = 30;
	var bandaLongitud = 30;
	var radio = 1.8;
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
	saturnoVertNormalMemoria = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, saturnoVertNormalMemoria);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalDato), gl.STATIC_DRAW);
    saturnoVertNormalMemoria.tamanioItem = 3;
    saturnoVertNormalMemoria.numeroItem = normalDato.length / 3;
	saturnoVertTexturaCoordMemoria = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, saturnoVertTexturaCoordMemoria);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texturaCoordDato), gl.STATIC_DRAW);
    saturnoVertTexturaCoordMemoria.tamanioItem = 2;
    saturnoVertTexturaCoordMemoria.numeroItem = texturaCoordDato.length / 2;
	
	saturnoVertPosicionMemoria = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, saturnoVertPosicionMemoria);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPosicionDato), gl.STATIC_DRAW);
	saturnoVertPosicionMemoria.tamanioItem = 3;
    saturnoVertPosicionMemoria.numeroItem = vertPosicionDato.length / 3;
	
	saturnoVertIndexMemoria = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, saturnoVertIndexMemoria);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(datoIndex), gl.STREAM_DRAW);
	saturnoVertIndexMemoria.tamanioItem = 1;
    saturnoVertIndexMemoria.numeroItem = datoIndex.length;
	// urano
	var bandaLatitud = 30;
	var bandaLongitud = 30;
	var radio = 1.3;
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
	uranoVertNormalMemoria = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uranoVertNormalMemoria);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalDato), gl.STATIC_DRAW);
    uranoVertNormalMemoria.tamanioItem = 3;
	uranoVertNormalMemoria.numeroItem = normalDato.length / 3;
	uranoVertTexturaCoordMemoria = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uranoVertTexturaCoordMemoria);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texturaCoordDato), gl.STATIC_DRAW);
    uranoVertTexturaCoordMemoria.tamanioItem = 2;
    uranoVertTexturaCoordMemoria.numeroItem = texturaCoordDato.length / 2;
	
	uranoVertPosicionMemoria = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uranoVertPosicionMemoria);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPosicionDato), gl.STATIC_DRAW);
	uranoVertPosicionMemoria.tamanioItem = 3;
    uranoVertPosicionMemoria.numeroItem = vertPosicionDato.length / 3;
	
	uranoVertIndexMemoria = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, uranoVertIndexMemoria);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(datoIndex), gl.STREAM_DRAW);
	uranoVertIndexMemoria.tamanioItem = 1;
    uranoVertIndexMemoria.numeroItem = datoIndex.length;
	// neptuno
	var bandaLatitud = 30;
	var bandaLongitud = 30;
	var radio = 1.2;
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
	uranoVertNormalMemoria = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uranoVertNormalMemoria);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalDato), gl.STATIC_DRAW);
    uranoVertNormalMemoria.tamanioItem = 3;
	uranoVertNormalMemoria.numeroItem = normalDato.length / 3;
	uranoVertTexturaCoordMemoria = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uranoVertTexturaCoordMemoria);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texturaCoordDato), gl.STATIC_DRAW);
    uranoVertTexturaCoordMemoria.tamanioItem = 2;
    uranoVertTexturaCoordMemoria.numeroItem = texturaCoordDato.length / 2;
	
	uranoVertPosicionMemoria = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uranoVertPosicionMemoria);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPosicionDato), gl.STATIC_DRAW);
	uranoVertPosicionMemoria.tamanioItem = 3;
    uranoVertPosicionMemoria.numeroItem = vertPosicionDato.length / 3;
	
	uranoVertIndexMemoria = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, uranoVertIndexMemoria);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(datoIndex), gl.STREAM_DRAW);
	uranoVertIndexMemoria.tamanioItem = 1;
    uranoVertIndexMemoria.numeroItem = datoIndex.length;
	// neptuno
	var bandaLatitud = 30;
	var bandaLongitud = 30;
	var radio = 1.2;
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
	neptunoVertNormalMemoria = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,neptunoVertNormalMemoria);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalDato), gl.STATIC_DRAW);
    neptunoVertNormalMemoria.tamanioItem = 3;
	neptunoVertNormalMemoria.numeroItem = normalDato.length / 3;
	neptunoVertTexturaCoordMemoria = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,neptunoVertTexturaCoordMemoria);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texturaCoordDato), gl.STATIC_DRAW);
    neptunoVertTexturaCoordMemoria.tamanioItem = 2;
    neptunoVertTexturaCoordMemoria.numeroItem = texturaCoordDato.length / 2;
	
	neptunoVertPosicionMemoria = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, neptunoVertPosicionMemoria);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPosicionDato), gl.STATIC_DRAW);
	neptunoVertPosicionMemoria.tamanioItem = 3;
    neptunoVertPosicionMemoria.numeroItem = vertPosicionDato.length / 3;
	
	neptunoVertIndexMemoria = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, neptunoVertIndexMemoria);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(datoIndex), gl.STREAM_DRAW);
	neptunoVertIndexMemoria.tamanioItem = 1;
	neptunoVertIndexMemoria.numeroItem = datoIndex.length;
	//pluton
	var bandaLatitud = 30;
	var bandaLongitud = 30;
	var radio = 0.7;
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
	plutonVertNormalMemoria = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,plutonVertNormalMemoria);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalDato), gl.STATIC_DRAW);
    plutonVertNormalMemoria.tamanioItem = 3;
	plutonVertNormalMemoria.numeroItem = normalDato.length / 3;
	plutonVertTexturaCoordMemoria = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,plutonVertTexturaCoordMemoria);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texturaCoordDato), gl.STATIC_DRAW);
    plutonVertTexturaCoordMemoria.tamanioItem = 2;
    plutonVertTexturaCoordMemoria.numeroItem = texturaCoordDato.length / 2;
	
	plutonVertPosicionMemoria = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, plutonVertPosicionMemoria);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPosicionDato), gl.STATIC_DRAW);
	plutonVertPosicionMemoria.tamanioItem = 3;
    plutonVertPosicionMemoria.numeroItem = vertPosicionDato.length / 3;
	
	plutonVertIndexMemoria = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, plutonVertIndexMemoria);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(datoIndex), gl.STREAM_DRAW);
	plutonVertIndexMemoria.tamanioItem = 1;
	plutonVertIndexMemoria.numeroItem = datoIndex.length;
}
var anguloLuna = 180;
var anguloVenus =0;
var mercurioAngulo = 0;
var anguloTierra=0;
var anguloMarte=0;
var anguloJupiter=0;
var anguloSaturno=0;
var anguloUrano=0;
var anguloNeptuno=0;
var anguloPluton=0;

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
	mat4.translate(mvMatriz, [0, 0, -70]);
	
	mvApilaMatriz();
	mat4.rotate(mvMatriz, gradoRadian(anguloLuna), [0, 0, 0]);
    mat4.translate(mvMatriz, [0, 0, 0]);
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
    mat4.rotate(mvMatriz, gradoRadian(mercurioAngulo), [0, 1, 0]);
    mat4.translate(mvMatriz, [5, 0, 0]);
    gl.bindBuffer(gl.ARRAY_BUFFER, mercurioVertPosicionMemoria);
    gl.vertexAttribPointer(progShader.atribPosVertice, mercurioVertPosicionMemoria.tamanioItem, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, mercurioVertNormalMemoria);
    gl.vertexAttribPointer(progShader.vertNormalAtributo, mercurioVertNormalMemoria.tamanioItem, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, mercurioVertTexturaCoordMemoria);
    gl.vertexAttribPointer(progShader.texturaCoordAtributo, mercurioVertTexturaCoordMemoria.tamanioItem, gl.FLOAT, false, 0, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, mercurioTextura);
    gl.uniform1i(progShader.pruebaUniforme, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mercurioVertIndexMemoria);
    modificarMatrizUniforme();
    gl.drawElements(gl.TRIANGLES, mercurioVertIndexMemoria.numeroItem, gl.UNSIGNED_SHORT, 0);
    mvDesapilaMatriz();
	//
	mvApilaMatriz();
    mat4.rotate(mvMatriz, gradoRadian(anguloVenus), [0, 1, 0]);
    mat4.translate(mvMatriz, [9, 0, 4]);
    gl.bindBuffer(gl.ARRAY_BUFFER, venusVertPosicionMemoria);
    gl.vertexAttribPointer(progShader.atribPosVertice, venusVertPosicionMemoria.tamanioItem, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, venusVertNormalMemoria);
    gl.vertexAttribPointer(progShader.vertNormalAtributo, venusVertNormalMemoria.tamanioItem, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, venusVertTexturaCoordMemoria);
    gl.vertexAttribPointer(progShader.texturaCoordAtributo, venusVertTexturaCoordMemoria.tamanioItem, gl.FLOAT, false, 0, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, venusTextura);
    gl.uniform1i(progShader.pruebaUniforme, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, venusVertIndexMemoria);
    modificarMatrizUniforme();
    gl.drawElements(gl.TRIANGLES, venusVertIndexMemoria.numeroItem, gl.UNSIGNED_SHORT, 0);
    mvDesapilaMatriz();
	// tierra
	mvApilaMatriz();
	mat4.rotate(mvMatriz, gradoRadian(anguloTierra), [0, 1, 0]);
    mat4.translate(mvMatriz, [14, 0, 8]);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tierraTextura);
    gl.uniform1i(progShader.pruebaUniforme, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, tierraVertPosicionMemoria);
    gl.vertexAttribPointer(progShader.atribPosVertice, tierraVertPosicionMemoria.tamanioItem, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, tierraVertTexturaCoordMemoria);
    gl.vertexAttribPointer(progShader.texturaCoordAtributo, tierraVertTexturaCoordMemoria.tamanioItem, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, tierraVertNormalMemoria);
    gl.vertexAttribPointer(progShader.vertNormalAtributo, tierraVertNormalMemoria.tamanioItem, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, tierraVertIndexMemoria);
    modificarMatrizUniforme();
    gl.drawElements(gl.TRIANGLES, tierraVertIndexMemoria.numeroItem, gl.UNSIGNED_SHORT, 0);
    mvDesapilaMatriz();
	// MARTE
	mvApilaMatriz();
	mat4.rotate(mvMatriz, gradoRadian(anguloMarte), [0, 1, 0]);
    mat4.translate(mvMatriz, [18, 0, 12]);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, marteTextura);
    gl.uniform1i(progShader.pruebaUniforme, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, marteVertPosicionMemoria);
    gl.vertexAttribPointer(progShader.atribPosVertice, marteVertPosicionMemoria.tamanioItem, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, marteVertTexturaCoordMemoria);
    gl.vertexAttribPointer(progShader.texturaCoordAtributo, marteVertTexturaCoordMemoria.tamanioItem, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, marteVertNormalMemoria);
    gl.vertexAttribPointer(progShader.vertNormalAtributo, marteVertNormalMemoria.tamanioItem, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, marteVertIndexMemoria);
    modificarMatrizUniforme();
    gl.drawElements(gl.TRIANGLES, marteVertIndexMemoria.numeroItem, gl.UNSIGNED_SHORT, 0);
    mvDesapilaMatriz();
	// jupiter
	mvApilaMatriz();
	mat4.rotate(mvMatriz, gradoRadian(anguloJupiter), [0, 1, 0]);
    mat4.translate(mvMatriz, [22, 0, 16]);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, jupiterTextura);
    gl.uniform1i(progShader.pruebaUniforme, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, jupiterVertPosicionMemoria);
    gl.vertexAttribPointer(progShader.atribPosVertice, jupiterVertPosicionMemoria.tamanioItem, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, jupiterVertTexturaCoordMemoria);
    gl.vertexAttribPointer(progShader.texturaCoordAtributo, jupiterVertTexturaCoordMemoria.tamanioItem, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, jupiterVertNormalMemoria);
    gl.vertexAttribPointer(progShader.vertNormalAtributo, jupiterVertNormalMemoria.tamanioItem, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, jupiterVertIndexMemoria);
    modificarMatrizUniforme();
    gl.drawElements(gl.TRIANGLES, jupiterVertIndexMemoria.numeroItem, gl.UNSIGNED_SHORT, 0);
    mvDesapilaMatriz();
	// saturno
	mvApilaMatriz();
	mat4.rotate(mvMatriz, gradoRadian(anguloSaturno), [0, 1, 0]);
    mat4.translate(mvMatriz, [26, 0, 20]);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, saturnoTextura);
    gl.uniform1i(progShader.pruebaUniforme, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, saturnoVertPosicionMemoria);
    gl.vertexAttribPointer(progShader.atribPosVertice, saturnoVertPosicionMemoria.tamanioItem, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, saturnoVertTexturaCoordMemoria);
    gl.vertexAttribPointer(progShader.texturaCoordAtributo, saturnoVertTexturaCoordMemoria.tamanioItem, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, saturnoVertNormalMemoria);
    gl.vertexAttribPointer(progShader.vertNormalAtributo, saturnoVertNormalMemoria.tamanioItem, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, saturnoVertIndexMemoria);
    modificarMatrizUniforme();
    gl.drawElements(gl.TRIANGLES, saturnoVertIndexMemoria.numeroItem, gl.UNSIGNED_SHORT, 0);
    mvDesapilaMatriz();
	// urano
	mvApilaMatriz();
	mat4.rotate(mvMatriz, gradoRadian(anguloUrano), [0, 1, 0]);
    mat4.translate(mvMatriz, [30, 0, 24]);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, uranoTextura);
    gl.uniform1i(progShader.pruebaUniforme, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, uranoVertPosicionMemoria);
    gl.vertexAttribPointer(progShader.atribPosVertice, uranoVertPosicionMemoria.tamanioItem, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, uranoVertTexturaCoordMemoria);
    gl.vertexAttribPointer(progShader.texturaCoordAtributo, uranoVertTexturaCoordMemoria.tamanioItem, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, uranoVertNormalMemoria);
    gl.vertexAttribPointer(progShader.vertNormalAtributo, uranoVertNormalMemoria.tamanioItem, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, uranoVertIndexMemoria);
    modificarMatrizUniforme();
    gl.drawElements(gl.TRIANGLES, uranoVertIndexMemoria.numeroItem, gl.UNSIGNED_SHORT, 0);
    mvDesapilaMatriz();

	// neptuno
	mvApilaMatriz();
	mat4.rotate(mvMatriz, gradoRadian(anguloNeptuno), [0, 1, 0]);
    mat4.translate(mvMatriz, [34, 0, 28]);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, neptunoTextura);
    gl.uniform1i(progShader.pruebaUniforme, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER,neptunoVertPosicionMemoria);
    gl.vertexAttribPointer(progShader.atribPosVertice, neptunoVertPosicionMemoria.tamanioItem, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, neptunoVertTexturaCoordMemoria);
    gl.vertexAttribPointer(progShader.texturaCoordAtributo, neptunoVertTexturaCoordMemoria.tamanioItem, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, neptunoVertNormalMemoria);
    gl.vertexAttribPointer(progShader.vertNormalAtributo, neptunoVertNormalMemoria.tamanioItem, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, neptunoVertIndexMemoria);
    modificarMatrizUniforme();
    gl.drawElements(gl.TRIANGLES, neptunoVertIndexMemoria.numeroItem, gl.UNSIGNED_SHORT, 0);
    mvDesapilaMatriz();
	// pluton
	mvApilaMatriz();
	mat4.rotate(mvMatriz, gradoRadian(anguloPluton), [0, 1, 0]);
    mat4.translate(mvMatriz, [38, 0, 32]);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, plutonTextura);
    gl.uniform1i(progShader.pruebaUniforme, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER,plutonVertPosicionMemoria);
    gl.vertexAttribPointer(progShader.atribPosVertice, plutonVertPosicionMemoria.tamanioItem, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, plutonVertTexturaCoordMemoria);
    gl.vertexAttribPointer(progShader.texturaCoordAtributo, plutonVertTexturaCoordMemoria.tamanioItem, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, plutonVertNormalMemoria);
    gl.vertexAttribPointer(progShader.vertNormalAtributo, plutonVertNormalMemoria.tamanioItem, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, plutonVertIndexMemoria);
    modificarMatrizUniforme();
    gl.drawElements(gl.TRIANGLES, plutonVertIndexMemoria.numeroItem, gl.UNSIGNED_SHORT, 0);
    mvDesapilaMatriz();

}
var ultimoTiempo = 0;
function animacion() {
	var tiempoActual = new Date().getTime();
    if (ultimoTiempo != 0) {
		var transcurrido = tiempoActual - ultimoTiempo;
		anguloLuna += 0.0 * transcurrido;
		mercurioAngulo +=(0.5 / 3.38) * transcurrido;
		anguloVenus += (0.5 / 8.65) * transcurrido;
		anguloTierra += (0.5 / 14.03) * transcurrido;
		anguloMarte += (1 / 26.42) * transcurrido;
		anguloJupiter += (2 / 132.84) *transcurrido;
		anguloSaturno +(2/ 413.57)  *transcurrido;
		anguloUrano += (3 / 1179.38)* transcurrido;
		anguloNeptuno +=(3 / 2313.76) * transcurrido;
		anguloPluton +=(4 / 2313.76) * transcurrido;
	}
	ultimoTiempo = tiempoActual;
}
/*var ultimoTiempo = 0;
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
		
		
	}
	ultimoTiempo = tiempoActual;
}*/
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