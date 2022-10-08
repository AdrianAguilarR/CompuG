var gl;
function iniciarGL(canvas) {
	try {
		gl = canvas.getContext("webgl");
		gl.puertoVistaAncho = canvas.width;
		gl.puertoVistaAlto = canvas.height;
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
function iniciarShaders() {
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
	progShader.atribPosVertice = gl.getAttribLocation(progShader, "aPosVertice");
	gl.enableVertexAttribArray(progShader.atribPosVertice);
	//... nuevo
	progShader.texturaCoordAtributo = gl.getAttribLocation(progShader, "aTexturaCoord");
	gl.enableVertexAttribArray(progShader.texturaCoordAtributo);
	//... nuevo
	progShader.pMatrizUniform = gl.getUniformLocation(progShader, "uPMatriz");
	progShader.mvMatrizUniform = gl.getUniformLocation(progShader, "umvMatriz");
	progShader.muestraUniform = gl.getUniformLocation(progShader, "uMuestra");
}
function cargarManijaTextura(pTextura) {
	gl.bindTexture(gl.TEXTURE_2D, pTextura);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, pTextura.image);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.bindTexture(gl.TEXTURE_2D, null);
}
var aTextura;
function iniciarTextura() {
	aTextura = gl.createTexture();
	aTextura.image = new Image();
    aTextura.image.onload = function () {
		cargarManijaTextura(aTextura);
    };
	aTextura.image.src = "img/nene.gif";
}
var mvMatriz = mat4.create();
var pMatriz = mat4.create();
function modificarMatrizUniforme() {
	gl.uniformMatrix4fv(progShader.pMatrizUniform, false, pMatriz);
    gl.uniformMatrix4fv(progShader.mvMatrizUniform, false, mvMatriz);
}
function sexagRad(angulo) {
	return angulo * Math.PI / 180;
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
function indexPoligono(pIndex, pNumI){
    var polI = gl.createBuffer(); //... nuevo
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, polI);
    //... triangulamos cada cara del poligono
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(pIndex), gl.STATIC_DRAW);
    polI.itemTam = 1;
    polI.numItems = pNumI;
    return polI;
}
function coordenadaTextura(pCoord, pNumC){
	var polC = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, polC);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pCoord), gl.STATIC_DRAW);
    polC.itemTam = 2;
    polC.numItems = pNumC;
	return polC;
}
var cub1, cub1T, cub1I, lad1, lad1T, lad1I;
function iniciarBuffers() {
	//... puntos del cubo
    cub1= puntosPoligono([-1.0, -1.0,  1.0, 1.0, -1.0,  1.0, 1.0,  1.0,  1.0, -1.0,  1.0,  1.0, // cara frente
        -1.0, -1.0, -1.0, -1.0,  1.0, -1.0, 1.0,  1.0, -1.0, 1.0, -1.0, -1.0, // cara atras
        -1.0,  1.0, -1.0, -1.0,  1.0,  1.0, 1.0,  1.0,  1.0, 1.0,  1.0, -1.0, // cara superior
        -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0,  1.0, -1.0, -1.0,  1.0, // cara inferior
        1.0, -1.0, -1.0, 1.0,  1.0, -1.0, 1.0,  1.0,  1.0, 1.0, -1.0,  1.0, // cara derecha
        -1.0, -1.0, -1.0, -1.0, -1.0,  1.0, -1.0,  1.0,  1.0, -1.0,  1.0, -1.0], 24);
	lad1= puntosPoligono([1, 1, 0, -1, 1, 0, -1, -1, 0, 1, -1, 0], 4);
	cub1T= coordenadaTextura([0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, // cara frente
	1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0, // cara atras
	0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, // cara superior
	1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, // cara inferior
	1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0, // cara derecha
	0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0], 24);
	lad1T= coordenadaTextura([0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0], 4);
	cub1I= indexPoligono([0, 1, 2,     0, 2, 3, // frente
	4, 5, 6,     4, 6, 7,    // cara atras
    8, 9, 10,    8, 10, 11,  // cara superior
    12, 13, 14,  12, 14, 15, // cara inferior
    16, 17, 18,  16, 18, 19, // cara derecha
    20, 21, 22,  20, 22, 23], 36);
	lad1I= indexPoligono([0, 1, 2,     0, 2, 3], 6);
}
function poligono3D(pPol, pPolI, pPolT, pText, pTras, pAng1, pEje1, pAng2, pEje2, pAng3, pEje3, pEsc){
	mat4.identity(mvMatriz);
	mat4.translate(mvMatriz, pTras);
	mat4.rotate(mvMatriz, sexagRad(pAng1), pEje1);
    mat4.rotate(mvMatriz, sexagRad(pAng2), pEje2);
    mat4.rotate(mvMatriz, sexagRad(pAng3), pEje3);
	mat4.scale(mvMatriz, pEsc);
	//... puntos
    gl.bindBuffer(gl.ARRAY_BUFFER, pPol);
    gl.vertexAttribPointer(progShader.atribPosVertice, pPol.itemTam, gl.FLOAT, false, 0, 0);
    //... textura
    gl.bindBuffer(gl.ARRAY_BUFFER, pPolT);
    gl.vertexAttribPointer(progShader.texturaCoordAtributo, pPolT.itemTam, gl.FLOAT, false, 0, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, pText);
    gl.uniform1i(progShader.muestraUniform, 0);
    //... index
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, pPolI);
    modificarMatrizUniforme();
    gl.drawElements(gl.TRIANGLES, pPolI.numItems, gl.UNSIGNED_SHORT, 0);
}
var xRot = 0, yRot = 0, zRot = 0;
function dibujarEscena() {
	gl.viewport(0, 0, gl.puertoVistaAncho, gl.puertoVistaAlto);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    mat4.perspective(45, gl.puertoVistaAncho / gl.puertoVistaAlto, 0.1, 100.0, pMatriz);
	poligono3D(cub1, cub1I, cub1T, aTextura, [-2.0, 0.0, -10.0], xRot, [1, 0, 0], yRot, [0,1, 0], zRot, [0, 0, 1], [1, 1, 1]);
	poligono3D(lad1, lad1I, lad1T, aTextura, [2.0, 0.0, -10.0], xRot, [1, 0, 0], yRot, [0, 1, 0], zRot, [0, 0, 1], [1, 1, 1]);
}
var ultimoTiempo = 0;
function animacion() {
	var tiempoActual = new Date().getTime();
    if (ultimoTiempo != 0) {
		var periodo = tiempoActual - ultimoTiempo;
		xRot += (90 * periodo) / 1000.0;
		yRot += (90 * periodo) / 1000.0;
		zRot += (90 * periodo) / 1000.0;
	}
    if(xRot>360)
		xRot = 0;
	if(yRot>360)
		yRot = 0;
	if(zRot>360)
		zRot = 0;
	ultimoTiempo = tiempoActual;
}
function momento() {
	requestAnimFrame(momento);
    dibujarEscena();
    animacion();
}
function iniciarWebGL() {
	var canvas = document.getElementById("leccion04-textura");
    iniciarGL(canvas);
    iniciarShaders();
    iniciarBuffers();
    //... nuevo
    iniciarTextura();
    gl.clearColor(0.0, 0.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    momento();
}
/*
L1
Comando: ID
Precise punto:  X = -1.0000     Y = 1.0000     Z = 0.0000
Comando: ID
Precise punto:  X = 1.0000     Y = 1.0000     Z = 0.0000
Comando: ID
Precise punto:  X = 0.0000     Y = 0.0000     Z = 2.0000
L2
Precise punto:  X = 1.0000     Y = 1.0000     Z = 0.0000
Comando: ID
Precise punto:  X = 1.0000     Y = -1.0000     Z = 0.0000
Comando: ID
Precise punto:  X = 0.0000     Y = 0.0000     Z = 2.0000

L3
Precise punto:  X = 1.0000     Y = -1.0000     Z = 0.0000
Comando: ID
Precise punto:  X = -1.0000     Y = -1.0000     Z = 0.0000
Comando: ID
Precise punto:  X = 0.0000     Y = 0.0000     Z = 2.0000
L4
Precise punto:  X = -1.0000     Y = -1.0000     Z = 0.0000
Comando: ID
Precise punto:  X = -1.0000     Y = 1.0000     Z = 0.0000
Comando: ID
Precise punto:  X = 0.0000     Y = 0.0000     Z = 2.0000

*/
