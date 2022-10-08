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
/*var aTextura;
function iniciarTextura() {
	aTextura = gl.createTexture();
	aTextura.image = new Image();
    aTextura.image.onload = function () {
		cargarManijaTextura(aTextura);
    };
	aTextura.image.src = "img/face1.gif";
}*/

var aTextura = new Array(20);
var cantidad =20;
function iniciarTextura() {
    for (let i = 1; i <= cantidad; i++) {
        aTextura[i] = gl.createTexture();
        aTextura[i].image = new Image();
        aTextura[i].image.onload = function () {
            cargarManijaTextura(aTextura[i]);
        }
    }
    for (let j = 1; j <= cantidad; j++) {
        aTextura[j].image.src = "img/nene"+j+".gif";
    }
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
// techo del auto
var techo1, techo1T, techo1I;
var techo2, techo2T, techo2I;
var techo3, techo3T, techo3I;
var techo4, techo4T, techo4I;
var techo5, techo5T, techo5I;
var techo6, techo6T, techo6I;
// cuello
var cub1, cub1T, cub1I;
// cuerpo de Mario bross
var Cuerpcara1, Cuerpcara1T, Cuerpcara1I;
var Cuerpcara2, Cuerpcara2T, Cuerpcara2I;
var Cuerpcara3, Cuerpcara3T, Cuerpcara3I;
var Cuerpcara4, Cuerpcara4T, Cuerpcara4I;
var Cuerpcara5, Cuerpcara5T, Cuerpcara5I;
var Cuerpcara6, Cuerpcara6T, Cuerpcara6I;



function iniciarBuffers() {
		//... puntos del  techo del auto
		techo1= puntosPoligono([ -4, -2,  4,   2, -2,  4,   2,  2,  2,   -4,  2,  2], 4); // cara frentes
		techo2= puntosPoligono([ -4, -2, -4,  -4,  2, -2,   2,  2, -2,    2, -2, -4], 4); // cara atras
		techo3= puntosPoligono([ -4,  2, -2,  -4,  2, 2,   2,  2,  2,    2,  2, -2], 4);  // cara superior
		techo4= puntosPoligono([ -4, -2, -4,   2, -2, -4,   2, -2,  4,   -4, -2,  4], 4); // cara inferior
		techo5= puntosPoligono([  2, -2, -4,   2,  2, -2,   2,  2,  2,    2, -2,  4], 4); // cara derecha
		techo6= puntosPoligono([ -4, -2,  4,   -4, -2, -4,  -4, 2, -2,    -4, 2,  2], 4);  // cara inquierda
		techo1T= coordenadaTextura([0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0], 4); // cara frente
		techo2T= coordenadaTextura([1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0], 4); // cara atras
		techo3T= coordenadaTextura([0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0], 4); // cara superior
		techo4T= coordenadaTextura([1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0], 4); // cara inferior
		techo5T= coordenadaTextura([1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0], 4); // cara derecha
		techo6T= coordenadaTextura([0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0], 4); // cara inquierda
		techo1I= indexPoligono([0, 1, 2,      0, 2, 3], 6); // frente
		techo2I= indexPoligono([0, 1, 2,      0, 2, 3], 6);    // cara atras
		techo3I= indexPoligono([0, 1, 2,     0, 2, 3], 6);  // cara superior
		techo4I= indexPoligono([0, 1, 2,      0, 2, 3], 6); // cara inferior
		techo5I= indexPoligono([0, 1, 2,      0, 2, 3], 6); // cara derecha
		techo6I= indexPoligono([0, 1, 2,      0, 2, 3], 6); // cara izquierda
    // puntos para el llanta 
    cub1= puntosPoligono([-1.0, -1.0, 1.0,     1.0, -1.0, 1.0,      1.0, 1.0, 1.0,     -1.0, 1.0, 1.0, // cara frente
        -1.0, -1.0, -1.0,       1.0, -1.0, -1.0,    1.0, 1.0, -1.0,    -1.0, 1.0, -1.0, // cara atras
        -1.0, 1.0, 1.0,         1.0, 1.0, 1.0,      1.0, 1.0, -1.0,    -1.0 , 1.0, -1.0, // cara superior
        -1.0, -1.0, 1.0,        1.0, -1.0, 1.0,     1.0, -1.0, -1.0,   -1.0 , -1.0, -1.0, // cara inferior
        1.0, -1.0, 1.0,         1.0, -1.0, -1.0,    1.0, 1.0, -1.0,     1.0, 1.0, 1.0, // cara derecha
        -1.0, -1.0, 1.0,       -1.0, -1.0, -1.0,   -1.0, 1.0, -1.0,     -1.0, 1.0, 1.0], 24);
	cub1T= coordenadaTextura([0, 0, 1, 0, 1, 1, 0, 1, // cara frente
		0, 0, 1, 0, 1, 1, 0, 1, // cara atras
		0, 0, 1, 0, 1, 1, 0, 1, // cara superior
		0, 0, 1, 0, 1, 1, 0, 1, // cara inferior
		0, 0, 1, 0, 1, 1, 0, 1, // cara derecha
		0, 0, 1, 0, 1, 1, 0, 1], 24);
	cub1I= indexPoligono([0, 1, 2,     0, 2, 3, // frente
		4, 5, 6,     4, 6, 7,    // cara atras
		8, 9, 10,    8, 10, 11,  // cara superior
		12, 13, 14,  12, 14, 15, // cara inferior
		16, 17, 18,  16, 18, 19, // cara derecha
		20, 21, 22,  20, 22, 23], 36);
		//... puntos del  cuerpo del auto
		Cuerpcara1= puntosPoligono([ -4, -2,  6,   2, -2,  6,   2,  2,  6,   -4,  2,  6], 4); // cara frentes
		Cuerpcara2= puntosPoligono([ -4, -2, -6,  -4,  2, -6,   2,  2, -6,    2, -2, -6], 4); // cara atras
		Cuerpcara3= puntosPoligono([ -4,  2, -6,  -4,  2,  6,   2,  2,  6,    2,  2, -6], 4);  // cara superior
		Cuerpcara4= puntosPoligono([ -4, -2, -6,   2, -2, -6,   2, -2,  6,   -4, -2,  6], 4); // cara inferior
		Cuerpcara5= puntosPoligono([  2, -2, -6,   2,  2, -6,   2,  2,  6,    2, -2,  6], 4); // cara derecha
		Cuerpcara6= puntosPoligono([ -4, -2,  6,   -4, -2, -6,  -4, 2, -6,    -4, 2,  6], 4);  // cara inquierda
		Cuerpcara1T= coordenadaTextura([0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0], 4); // cara frente
		Cuerpcara2T= coordenadaTextura([1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0], 4); // cara atras
		Cuerpcara3T= coordenadaTextura([0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0], 4); // cara superior
		Cuerpcara4T= coordenadaTextura([1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0], 4); // cara inferior
		Cuerpcara5T= coordenadaTextura([1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0], 4); // cara derecha
		Cuerpcara6T= coordenadaTextura([0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0], 4); // cara inquierda
		Cuerpcara1I= indexPoligono([0, 1, 2,      0, 2, 3], 6); // frente
		Cuerpcara2I= indexPoligono([0, 1, 2,      0, 2, 3], 6);    // cara atras
		Cuerpcara3I= indexPoligono([0, 1, 2,     0, 2, 3], 6);  // cara superior
		Cuerpcara4I= indexPoligono([0, 1, 2,      0, 2, 3], 6); // cara inferior
		Cuerpcara5I= indexPoligono([0, 1, 2,      0, 2, 3], 6); // cara derecha
		Cuerpcara6I= indexPoligono([0, 1, 2,      0, 2, 3], 6); // cara izquierda
	
	
		
	

	
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
var xRot1 = 0, yRot1 = 0, zRot1 = 0, xRot1_A = 0, yRot1_A = 0, zRot1_A = 0;
var xRot2 = 0, yRot2 = 0, zRot2 = 0;
var  velX= 0, velY= 0, coordZ= -20, enbudo= 0;
function dibujarEscena() {
	gl.viewport(0, 0, gl.puertoVistaAncho, gl.puertoVistaAlto);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    mat4.perspective(45, gl.puertoVistaAncho / gl.puertoVistaAlto, 0.1, 100.0, pMatriz);

	poligono3D(techo1, techo1I, techo1T, aTextura[12], [-1.0, 3.5, coordZ], xRot, [1, 0, 0], yRot, [0,1, 0], zRot, [0, 0, 1], [1, 1, 1]);
	poligono3D(techo2, techo2I, techo2T, aTextura[11], [-1.0, 3.5, coordZ], xRot, [1, 0, 0], yRot, [0,1, 0], zRot, [0, 0, 1], [1, 1, 1]);
	poligono3D(techo3, techo3I, techo3T, aTextura[11], [-1.0, 3.5, coordZ], xRot, [1, 0, 0], yRot, [0,1, 0], zRot, [0, 0, 1], [1, 1, 1]);
	poligono3D(techo4, techo4I, techo4T, aTextura[11], [-1.0, 3.5, coordZ], xRot, [1, 0, 0], yRot, [0,1, 0], zRot, [0, 0, 1], [1, 1, 1]);
	poligono3D(techo5, techo5I, techo5T, aTextura[11], [-1.0, 3.5, coordZ], xRot, [1, 0, 0], yRot, [0,1, 0], zRot, [0, 0, 1], [1, 1, 1]);
	poligono3D(techo6, techo6I, techo6T, aTextura[11], [-1.0, 3.5, coordZ], xRot, [1, 0, 0], yRot, [0,1, 0], zRot, [0, 0, 1], [1, 1, 1]);

	// cuerpo de mario broos
	poligono3D(Cuerpcara1, Cuerpcara1I, Cuerpcara1T, aTextura[12], [-1.0, 0.0, coordZ], xRot, [1, 0, 0], yRot, [0,1, 0], zRot, [0, 0, 1], [1, 1, 1]);
	poligono3D(Cuerpcara2, Cuerpcara2I, Cuerpcara2T, aTextura[13], [-1.0, 0.0, coordZ], xRot, [1, 0, 0], yRot, [0,1, 0], zRot, [0, 0, 1], [1, 1, 1]);
	poligono3D(Cuerpcara3, Cuerpcara3I, Cuerpcara3T, aTextura[14], [-1.0, 0.0, coordZ], xRot, [1, 0, 0], yRot, [0,1, 0], zRot, [0, 0, 1], [1, 1, 1]);
	poligono3D(Cuerpcara4, Cuerpcara4I, Cuerpcara4T, aTextura[11], [-1.0, 0.0, coordZ], xRot, [1, 0, 0], yRot, [0,1, 0], zRot, [0, 0, 1], [1, 1, 1]);
	poligono3D(Cuerpcara5, Cuerpcara5I, Cuerpcara5T, aTextura[11], [-1.0, 0.0, coordZ], xRot, [1, 0, 0], yRot, [0,1, 0], zRot, [0, 0, 1], [1, 1, 1]);
	poligono3D(Cuerpcara6, Cuerpcara6I, Cuerpcara6T, aTextura[11], [-1.0, 0.0, coordZ], xRot, [1, 0, 0], yRot, [0,1, 0], zRot, [0, 0, 1], [1, 1, 1]);

		// llanta
		poligono3D(cub1, cub1I, cub1T, aTextura[11], [-1.0, 0.0, coordZ], xRot, [1, 0, 0], yRot, [0, 1, 0], zRot, [0, 0, 1], [1, 1, 1]);
	
}




function manejoKeyIzquierda(evento) {
    keyPrecionado[evento.keyCode] = true;
}
function manejoKeyDerecha(evento) {
    keyPrecionado[evento.keyCode] = false;
}

var keyPrecionado = {};
function manejoKeyAbajo(evento) {
	
    keyPrecionado[evento.keyCode] = true;
    if (String.fromCharCode(evento.keyCode) == "F") {
        enbudo += 1;
        if (enbudo == 3) {
            enbudo = 0;
        }
    }
}
function manejoKeyArriba(evento) {
	
	keyPrecionado[evento.keyCode] = false;
}

var  velXCuerpo= 0, velYCuerpo= 0, velZCuerpo;
function manejoKeys() {
	
	if (keyPrecionado[33]) {
        coordZ-= 0.1; // Page Up
    }
    if (keyPrecionado[34]) {
        coordZ+= 0.1; // Page Down
    }
	// cabeza
    if (keyPrecionado[37]) {
        velY-= 1; // Left cursor key
    }else if (keyPrecionado[39]) {
        velY+= 1; // Right cursor key
    }else{
		velY = 0;
	}
    if (keyPrecionado[38]) {
        velX-= 1; // Up cursor key
    }else if (keyPrecionado[40]) {
        velX+= 1; // Down cursor key
    }else{
		velX = 0;
	}
	if (keyPrecionado[49]) {
        velZ-= 1; // Up cursor key
    }else if (keyPrecionado[50]) {
        velZ+= 1; // Down cursor key
    }else{
		velZ = 0;
	}
	//cuerpo
	if (keyPrecionado[65]) {
        velYCuerpo-= 1; // Left cursor key
    }else if (keyPrecionado[68]) {
        velYCuerpo+= 1; // Right cursor key
    }else{
		velYCuerpo = 0;
	}
    if (keyPrecionado[87]) {
        velXCuerpo-= 1; // Up cursor key
    }else if (keyPrecionado[83]) {
        velXCuerpo+= 1; // Down cursor key
    }else{
		velXCuerpo = 0;
	}
	if (keyPrecionado[51]) {
        velZCuerpo-= 1; // Up cursor key
    }else if (keyPrecionado[52]) {
        velZCuerpo+= 1; // Down cursor key
    }else{
		velZCuerpo = 0;
	}
}
var aux_xRot1 =0 , signo = 1 ;
var ultimoTiempo = 0;
function animacion() {
	var tiempoActual = new Date().getTime();
    if (ultimoTiempo != 0) {
		var periodo = tiempoActual - ultimoTiempo;
		xRot += (velX * periodo) / 1000.0;
		yRot += ( velY* periodo) / 1000.0;
		zRot += (velZ * periodo) / 1000.0;
		xRot1 += (velXCuerpo * periodo) / 1000.0;
		yRot1 += ( velYCuerpo* periodo) / 1000.0;
		zRot1 += (velZCuerpo * periodo) / 1000.0;
		if (aux_xRot1 == 1) {
			xRot1 += signo*(250 * periodo) / 1000.0;
			xRot1_A -= signo*(250 * periodo) / 1000.0;
		}else{
			
		}
	}
	
    if(xRot>25)
		xRot = 25;
	if(xRot<-25)
		xRot = -25;
	if(zRot>10)
		zRot = 10;
	if(zRot<-10)
		zRot = -10;
	if(yRot>60){
		yRot1 = 90;
		yRot1_A = 90;
		yRot2 = 90;
	}
	if (yRot>150) {
		yRot1 = 180;	
		yRot1_A = 180;
		yRot2 = 180;	
	}
	if (yRot>240) {
		yRot1 = 270;	
		yRot1_A = 270;
		yRot2 = 270;	
	}
	if (yRot>330) {
		yRot1= 360;
		yRot1_A = 360;	
		yRot2 = 0;
	}
	if (yRot>360) {
		yRot = 0;	
	}

	if(yRot<-60){
		yRot1 = 270;
		yRot1_A = 270;
		yRot2 = 270;
	}
	if (yRot<-150) {
		yRot1 = 180;	
		yRot1_A = 180;	
		yRot2 = 180;	
	}
	if (yRot<-240) {
		yRot1 = 90;
		yRot1_A = 90;	
		yRot2 = 90;	
	}
	if (yRot<-330) {
		yRot1 = 360;	
		yRot1_A = 360;	
		yRot2 = 360;
	}
	if (yRot<-360) {
		yRot = 0;	
	}
	if(xRot1>= 60 || xRot1<= -60){
        signo= signo*(-1);
    }
	if (keyPrecionado[34]  || keyPrecionado[33] ) {
		aux_xRot1 =1;
	}else{
		aux_xRot1 =0;
	}
	
	ultimoTiempo = tiempoActual;
}

function momento() {
	requestAnimFrame(momento);
	manejoKeys();
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
	    //... Para detectar las pulsaciones (presiona tecla y suelta)
		document.onkeydown = manejoKeyAbajo;
		document.onkeyup = manejoKeyArriba;
		//document.onkeydown = manejoKeyIzquierda;
		//document.onkeyup = manejoKeyDerecha;
    momento();
}