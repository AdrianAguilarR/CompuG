var gl;
function iniciarGL(canvas) {
	try {
		gl = canvas.getContext("webgl");
		gl.verAnchoVentana = canvas.width;
		gl.verAltoVentana = canvas.height;
	} catch (e) { }
	if (!gl) {
		alert("Perdone, no se pudo inicializar WebGL");
	}
}
function conseguirShader(gl, id) {
	var shaderScript = document.getElementById(id);
	if (!shaderScript) { return null; }
	var str = "";
	var k = shaderScript.firstChild;
	while (k) {
		if (k.nodeType == 3) {
			str += k.textContent;
		}
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
function iniciarShader() {
	var fragShader = conseguirShader(gl, "shader-fs");
	var vertShader = conseguirShader(gl, "shader-vs");
	progShader = gl.createProgram();
	gl.attachShader(progShader, vertShader);
	gl.attachShader(progShader, fragShader);
	gl.linkProgram(progShader);
	if (!gl.getProgramParameter(progShader, gl.LINK_STATUS)) {
		alert("Perdone, no pudo inicializarse el shaders");
	}
	gl.useProgram(progShader);
	progShader.vertPosAtributo = gl.getAttribLocation(progShader, "aVertPosicion");
	gl.enableVertexAttribArray(progShader.vertPosAtributo);
	progShader.textCoordAtributo = gl.getAttribLocation(progShader, "aTexturaCoord");
	gl.enableVertexAttribArray(progShader.textCoordAtributo);
	progShader.pMatrizUniform = gl.getUniformLocation(progShader, "uPMatriz");
	progShader.mvMatrizUniform = gl.getUniformLocation(progShader, "uMVMatriz");
	progShader.muestraUniform = gl.getUniformLocation(progShader, "uMuestra");
	progShader.colorUniform = gl.getUniformLocation(progShader, "uColor");
 }
function cargarManijaTextura(pTextura) {
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.bindTexture(gl.TEXTURE_2D, pTextura);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, pTextura.imagen);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.bindTexture(gl.TEXTURE_2D, null);
}
var aTextura;
function cargarManija(pDireccion){
	var textura = gl.createTexture();
	textura.imagen = new Image();
	textura.imagen.onload = function () {
		cargarManijaTextura(textura);
	};
	textura.imagen.src = pDireccion;
	return textura;
}
function iniciarTextura(pDireccion) {
	aTextura= cargarManija(pDireccion);
}
var mvMatriz = mat4.create();
var pMatriz = mat4.create();
function modificarMatrizUniforme() {
	gl.uniformMatrix4fv(progShader.pMatrizUniform, false, pMatriz);
	gl.uniformMatrix4fv(progShader.mvMatrizUniform, false, mvMatriz);
}
function sexRad(pAngulo) {
	return pAngulo * Math.PI / 180;
}
var keyPrecionado = {};
function keyDesactivo(event) {
	keyPrecionado[event.keyCode] = true;
}
function keyActivo(event) {
	keyPrecionado[event.keyCode] = false;
}
var zoom = -15;
var inclinacionX = 90;
var girarZ = 0;
function manejoKey() {
	if (keyPrecionado[33]) {
		zoom -= 0.1; // Page Up
	}
	if (keyPrecionado[34]) {
		zoom += 0.1; // Page Down
	}
	if (keyPrecionado[38]) {
		inclinacionX += 2; // Up cursor key
	}
	if (keyPrecionado[40]) {
		inclinacionX -= 2; // Down cursor key
	}
}
function puntosPoligono(pPuntos, pVertice){
    //... esta funcion trabaja tambien para 3D
    var pol = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pol);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pPuntos), gl.STATIC_DRAW);
    pol.itemTam = 3;
    //... si los puntos fuesen 3D habria que considerar aristas
    pol.numItems = pVertice;
    return pol;
}
function coordenadaTextura(pCoord, pNumT){
	var polT = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, polT);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pCoord), gl.STATIC_DRAW);
    polT.itemTam = 2;
    polT.numItems = pNumT;
	return polT;
}
var aPtoEstrella, aCoordTextura;
function iniciarBuffer() {
	aPtoEstrella= puntosPoligono([-1, -1, 0, 1, -1, 0, -1, 1, 0, 1, 1, 0], 4);
	aCoordTextura= coordenadaTextura([0, 0, 1, 0, 0, 1, 1, 1], 4);
}
function dibujarImagen(pTextura, pCoordTextura, pPtoEstrella) {
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, pTextura);
	gl.uniform1i(progShader.muestraUniform, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, pCoordTextura);
	gl.vertexAttribPointer(progShader.textCoordAtributo, pCoordTextura.itemTam, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, pPtoEstrella);
	gl.vertexAttribPointer(progShader.vertPosAtributo, pPtoEstrella.itemTam, gl.FLOAT, false, 0, 0);
	modificarMatrizUniforme();
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, pPtoEstrella.numItems);
}
function estrella(pX, pY, pZ, pDx, pDy, pVelocidadR) {
	this.aX = pX; this.aY = pY; this.aZ = pZ;
	this.aDx= pDx; this.aDy= pDy;
	this.aVelocidadR = pVelocidadR;
	// Modificar el color con valores en ejecucion
	this.colorAleatorio();
}
var mvMatrizPila = [];
function mvApilarMatriz() {
	var copiar = mat4.create();
	mat4.set(mvMatriz, copiar);
	mvMatrizPila.push(copiar);
}
function mvDesapilarMatriz() {
	if (mvMatrizPila.length == 0) {
		throw "Invalido desapilar!";
	}
	mvMatriz = mvMatrizPila.pop();
}
estrella.prototype.draw = function (pCentella) {
	mvApilarMatriz();
	//... Movemos la estrella a una posicion
	mat4.translate(mvMatriz, [this.aX, 0.0, 0.0]);
	mat4.translate(mvMatriz, [0.0, this.aY, 0.0]);
	if (pCentella) {
		// Draw a non-rotating star in the alternate "twinkling" color
		gl.uniform3f(progShader.colorUniform, this.aBrilloRojo, this.aBrilloVerde, this.aBrilloAzul);
		dibujarImagen(aTextura, aCoordTextura, aPtoEstrella);
	}
	// All estrellas girarZ around the Z axis at the same rate
	// Draw the star in its main color
	gl.uniform3f(progShader.colorUniform, this.aRojo, this.aVerde, this.aAzul);
	dibujarImagen(aTextura, aCoordTextura, aPtoEstrella);
	mvDesapilarMatriz();
};
estrella.prototype.controlDireccion = function (pLapsoTiempo, pI, pNum) {
	if(this.aX<6 && this.aX>-6 && this.aY<6 && this.aY>-6)
		for (var i= 0; i<pNum; i++){
			if(i!=pI){
				if(Math.pow(Math.pow(this.aX-estrellas[i].aX,2)+Math.pow(this.aY-estrellas[i].aY,2),0.5)<=0.5){
					this.aDx= (Math.random()*100)%3-1;
					this.aDy= (Math.random()*100)%3-1;
					estrellas[i].aDx= this.aDx*(-1);
					estrellas[i].aDy= this.aDy*(-1);
				}
			}
		}
	if(this.aX>6 || this.aX<-6){
		this.aDx= this.aDx*(-1);
		this.colorAleatorio();
	}
	if(this.aY>6 || this.aY<-6){
		this.aDy= this.aDy*(-1);
		this.colorAleatorio();
	}
	this.aX += this.aVelocidadR*this.aDx * pLapsoTiempo;
	this.aY += this.aVelocidadR*this.aDy * pLapsoTiempo;
};
estrella.prototype.colorAleatorio = function () {
	// Dar a la estrella un color aleatorio
	// Circunstacia...
	this.aRojo = Math.random();
	this.aVerde = Math.random();
	this.aAzul = Math.random();
	//... Requerimos tambien un color para el brillo de la estrella cuando esta en ejecucion
	this.aBrilloRojo = Math.random();
	this.aBrilloVerde = Math.random();
	this.aBrilloAzul = Math.random();
};
var estrellas = [];
function iniciarMundoObjeto() {
	estrellas.push(new estrella(-6, 6, 0, 1, -1, 0.001));
	estrellas.push(new estrella(6, 6, 0, -1, -1, 0.001));
	estrellas.push(new estrella(6, -6, 0, -1, 1, 0.002));
	estrellas.push(new estrella(-6, -6, 0, 1, 1, 0.001));
	estrellas.push(new estrella(0, 1, 0, 0, 1, 0.001));
	estrellas.push(new estrella(0, -1, 0, 0, -1, 0.001));
}
function dibujarEscena() {
	gl.viewport(0, 0, gl.verAnchoVentana, gl.verAltoVentana);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	mat4.perspective(45, gl.verAnchoVentana / gl.verAltoVentana, 0.1, 100.0, pMatriz);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
	gl.enable(gl.BLEND);
	mat4.identity(mvMatriz);
	mat4.translate(mvMatriz, [0.0, 0.0, zoom]);
	var centella = document.getElementById("centella").checked;
	for (var i in estrellas) {
		estrellas[i].draw(centella);
	}
}
var finTiempo = 0;
function animacion(pNum) {
	var tiempoActual = new Date().getTime();
	if (finTiempo != 0) {
		var lapso = tiempoActual - finTiempo;
		for (var i in estrellas)
			estrellas[i].controlDireccion(lapso, i, pNum);
	}
	finTiempo = tiempoActual;
}
function momento() {
	manejoKey();
	dibujarEscena();
	animacion(6);
	requestAnimFrame(momento);
}
function iniciarWebGL() {
	var canvas = document.getElementById("leccion06-brillo");
	iniciarGL(canvas);
	iniciarShader();
	iniciarBuffer();
	iniciarTextura("img/pelota1.gif");
	iniciarMundoObjeto();
	gl.clearColor(0.0, 0.0, 1.0, 1.0);
	//gl.enable(gl.DEPTH_TEST);
	document.onkeydown = keyDesactivo;
	document.onkeyup = keyActivo;
	momento();
}