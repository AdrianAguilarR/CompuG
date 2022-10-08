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

var aTextura = new Array(30);
var cantidad =30;
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
// cubo centro 
var cub1, cub1T, cub1I, cub2, cub3,  cub4, cub5, cub6, cub7 ;
var cub8, cub8T, cub8I,cub9,cub10, cub11,cub12,cub13,cub14,cub15, cub16, cub17, cub18, cub18, cub19, cub20, cub21,  cub22,  cub23,  cub24,  cub25, cub26, cub27, cub28, cub29,  cub30,  cub31; 
var cub32, cub32T, cub32I;
var cub33, cub33T, cub33I;
var cub34, cub34T, cub34I;
var cub35,cub36,cub37,cub38,cub39, cub40, cub41,cub42,cub43, cub44,cub45,cub46,cub47,cub48,cub49,cub50,cub51,cub52, cub53,cub54,cub55;
function iniciarBuffers() {
	//... puntos del cubo centro
    cub1= puntosPoligono([-1.0, -1.0,  1.0, 1.0, -1.0,  1.0, 1.0,     1.0,  1.0, -1.0,  1.0,  1.0, // cara frente
        -1.0, -1.0, -1.0,    -1.0,  1.0, -1.0,    1.0,  1.0, -1.0,    1.0, -1.0, -1.0, // cara atras
        -1.0,  1.0, -1.0,    -1.0,  1.0,  1.0,    1.0,  1.0,  1.0,    1.0,  1.0, -1.0, // cara superior
        -1.0, -1.0, -1.0,     1.0, -1.0, -1.0,    1.0, -1.0,  1.0,   -1.0, -1.0,  1.0, // cara inferior
         1.0, -1.0, -1.0,     1.0,  1.0, -1.0,    1.0,  1.0,  1.0,    1.0, -1.0,  1.0, // cara derecha
        -1.0, -1.0, -1.0,    -1.0, -1.0,  1.0,   -1.0,  1.0,  1.0,   -1.0,  1.0, -1.0], 24);
	cub1T= coordenadaTextura([0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, // cara frente
	1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0, // cara atras
	0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, // cara superior
	1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, // cara inferior
	1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0, // cara derecha
	0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0], 24);
	cub1I= indexPoligono([0, 1, 2,     0, 2, 3, // frente
	4, 5, 6,     4, 6, 7,    // cara atras
    8, 9, 10,    8, 10, 11,  // cara superior
    12, 13, 14,  12, 14, 15, // cara inferior
    16, 17, 18,  16, 18, 19, // cara derecha
    20, 21, 22,  20, 22, 23], 36);

	// cubo lado derecho centros
	cub2= puntosPoligono([1.0, -1.0,  1.0,   3.0, -1.0,  1.0,   3.0,  1.0,  1.0,   1.0,  1.0,  1.0, // cara frente
        1.0, -1.0, -1.0,   1.0,  1.0, -1.0,   3.0,  1.0, -1.0,    3.0, -1.0, -1.0, // cara atras
        1.0,  1.0, -1.0,   1.0,  1.0,  1.0,   3.0,  1.0,  1.0,    3.0,  1.0, -1.0, // cara superior
        1.0, -1.0, -1.0,    3.0, -1.0, -1.0,   3.0, -1.0,  1.0,   1.0, -1.0,  1.0, // cara inferior
        3.0, -1.0, -1.0,    3.0,  1.0, -1.0,   3.0,  1.0,  1.0,    3.0, -1.0,  1.0, // cara derecha
        1.0, -1.0, -1.0,    1.0, -1.0,  1.0,   1.0,  1.0,  1.0,  1.0,  1.0, -1.0], 24);

	//... puntos del cubo centro Izquierdo
    cub3= puntosPoligono([-1.0, -1.0,  1.0,  -3.0, -1.0,  1.0,  -3.0,  1.0,  1.0, -1.0,  1.0,  1.0, // cara frente
        -1.0, -1.0, -1.0,  -1.0,  1.0, -1.0,    -3.0,  1.0, -1.0,    -3.0, -1.0, -1.0, // cara atras
        -1.0,  1.0, -1.0,  -1.0,  1.0,  1.0,    -3.0,  1.0,  1.0,    -3.0,  1.0, -1.0, // cara superior
        -1.0, -1.0, -1.0,   -3.0, -1.0, -1.0,    -3.0, -1.0,  1.0,    -1.0, -1.0,  1.0, // cara inferior
         -3.0, -1.0, -1.0,   -3.0,  1.0, -1.0,    -3.0,  1.0,  1.0,    -3.0, -1.0,  1.0, // cara derecha
        -1.0, -1.0, -1.0,  -1.0, -1.0,  1.0,    -1.0,  1.0,  1.0,    -1.0,  1.0, -1.0], 24);
	
		//... puntos del cubo centro lado superior
	cub4= puntosPoligono([-1.0, 1.0,  1.0,   1.0, 1.0,  1.0,    1.0,3.0,  1.0,    -1.0,  3.0,  1.0, // cara frente
        -1.0,  1.0, -1.0,    -1.0,  3.0, -1.0,    1.0,  3.0, -1.0,    1.0,  1.0, -1.0, // cara atras
        -1.0,  3.0, -1.0,    -1.0,  3.0,  1.0,    1.0,  3.0,  1.0,    1.0,  3.0, -1.0, // cara superior
        -1.0,  1.0, -1.0,     1.0,  1.0, -1.0,    1.0,  1.0,  1.0,   -1.0,  1.0,  1.0, // cara inferior
         1.0,  1.0, -1.0,     1.0,  3.0, -1.0,    1.0,  3.0,  1.0,    1.0,  1.0,  1.0, // cara derecha
        -1.0,  1.0, -1.0,    -1.0,  1.0,  1.0,   -1.0,  3.0,  1.0,   -1.0,  3.0, -1.0], 24);
	
		//... puntos del cubo centro inferior
	cub5= puntosPoligono([-1.0, -1.0,  1.0,    1.0, -1.0,  1.0,     1.0,-3.0,  1.0,    -1.0,  -3.0,  1.0, // cara frente
        -1.0, -1.0, -1.0,    -1.0,  -3.0, -1.0,    1.0,  -3.0, -1.0,    1.0, -1.0, -1.0, // cara atras
        -1.0, -3.0, -1.0,    -1.0,  -3.0,  1.0,    1.0,  -3.0,  1.0,    1.0, -3.0, -1.0, // cara superior
        -1.0, -1.0, -1.0,     1.0,  -1.0, -1.0,    1.0,  -1.0,  1.0,   -1.0, -1.0,  1.0, // cara inferior
         1.0, -1.0, -1.0,     1.0,  -3.0, -1.0,    1.0,  -3.0,  1.0,    1.0, -1.0,  1.0, // cara derecha
        -1.0, -1.0, -1.0,    -1.0,  -1.0,  1.0,   -1.0,  -3.0,  1.0,   -1.0, -3.0, -1.0], 24);
	//... puntos del cubo centro delante
	
	cub6= puntosPoligono([-1.0, -1.0,  3.0,    1.0, -1.0,  3.0,    1.0, 1.0,  3.0,    -1.0,  1.0,  3.0, // cara frente
	-1.0, -1.0,  1.0,    -1.0,  1.0,  1.0,    1.0,  1.0,  1.0,    1.0, -1.0,  1.0, // cara atras
	-1.0,  1.0,  1.0,    -1.0,  1.0,  3.0,    1.0,  1.0,  3.0,    1.0,  1.0,  1.0, // cara superior
	-1.0, -1.0,  1.0,     1.0, -1.0,  1.0,    1.0, -1.0,  3.0,   -1.0, -1.0,  3.0, // cara inferior
	 1.0, -1.0,  1.0,     1.0,  1.0,  1.0,    1.0,  1.0,  3.0,    1.0, -1.0,  3.0, // cara derecha
	-1.0, -1.0,  1.0,    -1.0, -1.0,  3.0,   -1.0,  1.0,  3.0,   -1.0,  1.0,  1.0], 24);

	//... puntos del cubo centro atras	
		cub7= puntosPoligono([-1.0, -1.0, -3.0, 1.0, -1.0, -3.0,    1.0,1.0, -3.0,    -1.0,  1.0,  -3.0, // cara frente
		-1.0, -1.0, -1.0,    -1.0,  1.0, -1.0,    1.0,  1.0, -1.0,    1.0, -1.0, -1.0, // cara atras
		-1.0,  1.0, -1.0,    -1.0,  1.0, -3.0,    1.0,  1.0, -3.0,    1.0,  1.0, -1.0, // cara superior
		-1.0, -1.0, -1.0,     1.0, -1.0, -1.0,    1.0, -1.0, -3.0,   -1.0, -1.0, -3.0, // cara inferior
		 1.0, -1.0, -1.0,     1.0,  1.0, -1.0,    1.0,  1.0, -3.0,    1.0, -1.0, -3.0, // cara derecha
		-1.0, -1.0, -1.0,    -1.0, -1.0, -3.0,   -1.0,  1.0, -3.0,   -1.0,  1.0, -1.0], 24);
	// cubo lado derecho superior
	cub8= puntosPoligono([1.0, 1.0,  1.0,   3.0, 1.0,  1.0,    3.0,  3.0,  1.0,    1.0,  3.0,  1.0, // cara frente
				1.0,  1.0, -1.0,   1.0,  3.0, -1.0,   3.0,  3.0, -1.0,    3.0,  1.0, -1.0, // cara atras
				1.0,  3.0, -1.0,   1.0,  3.0,  1.0,   3.0,  3.0,  1.0,    3.0,  3.0, -1.0, // cara superior
				1.0,  1.0, -1.0,    3.0, 1.0, -1.0,   3.0, 1.0,  1.0,   1.0,  1.0,  1.0, // cara inferior
				1.0,  1.0, -1.0,    1.0, 1.0,  1.0,   1.0, 3.0,  1.0,   1.0,  3.0, -1.0], 20); //cara Izquierda
	cub9= puntosPoligono([3.0, 1.0, -1.0,    3.0,  3.0, -1.0,   3.0,  3.0,  1.0,    3.0, 1.0,  1.0], 4); // cara derecha
	cub8T= coordenadaTextura([0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, // cara frente
				1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0, // cara atras
				0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, // cara superior
				1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, // cara inferior
				0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0], 20); // cara Izquierda
	cub9T= coordenadaTextura([	1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0], 4); // cara derecha
			
	cub8I= indexPoligono([0, 1, 2,     0, 2, 3, // frente
				4, 5, 6,     4, 6, 7,    // cara atras
				8, 9, 10,    8, 10, 11,  // cara superior
				12, 13, 14,  12, 14, 15, // cara inferior
				16, 17, 18,  16, 18, 19, // cara derecha
				], 30);
	cub9I= indexPoligono([0, 1, 2,     0, 2, 3], 6); // frente

	// cubo lado derecho superior
	cub10= puntosPoligono([1.0, -1.0,  1.0,   3.0, -1.0,  1.0,   3.0, -3.0,  1.0,   1.0, -3.0,  1.0, // cara frente
	1.0, -1.0, -1.0,    1.0, -3.0, -1.0,   3.0, -3.0, -1.0,    3.0, -1.0, -1.0, // cara atras
	1.0, -3.0, -1.0,    1.0, -3.0,  1.0,   3.0, -3.0,  1.0,    3.0, -3.0, -1.0, // cara superior
	1.0, -1.0, -1.0,    3.0, -1.0, -1.0,   3.0, -1.0,  1.0,    1.0, -1.0,  1.0, // cara inferior
	1.0, -1.0, -1.0,    1.0, -1.0,  1.0,   1.0, -3.0,  1.0,    1.0, -3.0, -1.0], 20); //cara Izquierda
	cub11= puntosPoligono([3.0, -1.0, -1.0,    3.0, -3.0, -1.0,   3.0, -3.0,  1.0,    3.0, -1.0,  1.0], 4); // cara derecha
	
	//... puntos del cubo  Izquierdo superior 
    cub12= puntosPoligono([-1.0, 1.0,  1.0,  -3.0, 1.0,  1.0,    -3.0,  3.0,  1.0,    -1.0,  3.0,  1.0, // cara frente
        -1.0, 1.0, -1.0,  -1.0,  3.0, -1.0,    -3.0,  3.0, -1.0,    -3.0, 1.0, -1.0, // cara atras
        -1.0,  3.0, -1.0,  -1.0,  3.0,  1.0,    -3.0,  3.0,  1.0,    -3.0,  3.0, -1.0, // cara superior
        -1.0, 1.0, -1.0,   -3.0, 1.0, -1.0,   -3.0, 1.0,  1.0,    -1.0, 1.0,  1.0, // cara inferior
		-1.0, 1.0, -1.0,  -1.0, 1.0,  1.0,    -1.0,  3.0,  1.0,    -1.0,  3.0, -1.0], 20); // cara derecha
	cub13= puntosPoligono([-3.0, 1.0, -1.0,    -3.0,  3.0, -1.0,    -3.0,  3.0,  1.0,    -3.0, 1.0,  1.0], 4); // cara izquierdo
	
	//... puntos del cubo  Izquierdo inferior
	cub14= puntosPoligono([-1.0, -1.0,  1.0,  -3.0, -1.0,  1.0,  -3.0,  -3.0,  1.0,   -1.0,  -3.0,  1.0, // cara frente
        -1.0, -1.0, -1.0,  -1.0,  -3.0, -1.0,    -3.0,  -3.0, -1.0,    -3.0, -1.0, -1.0, // cara atras
        -1.0,  -3.0, -1.0,  -1.0,  -3.0,  1.0,    -3.0,  -3.0,  1.0,    -3.0,  -3.0, -1.0, // cara superior
        -1.0, -1.0, -1.0,   -3.0, -1.0, -1.0,    -3.0, -1.0,  1.0,    -1.0, -1.0,  1.0, // cara inferior
		-1.0, -1.0, -1.0,  -1.0, -1.0,  1.0,    -1.0,  -3.0,  1.0,    -1.0,  -3.0, -1.0], 20); // cara derecha
	cub15= puntosPoligono([-3.0, -1.0, -1.0,   -3.0,  -3.0, -1.0,    -3.0,  -3.0,  1.0,    -3.0, -1.0,  1.0], 4); // cara izquierdo
	
		//... puntos del cubo centro delante superior
	
		cub16= puntosPoligono([-1.0, -1.0,  3.0,    1.0, -1.0,  3.0,    1.0, 1.0,  3.0,    -1.0,  1.0,  3.0], 4); // cara frente
		cub17= puntosPoligono([-1.0, -1.0,  1.0,    -1.0,  1.0,  1.0,    1.0,  1.0,  1.0,    1.0, -1.0,  1.0, // cara atras
		-1.0,  1.0,  1.0,    -1.0,  1.0,  3.0,    1.0,  1.0,  3.0,    1.0,  1.0,  1.0, // cara superior
		-1.0, -1.0,  1.0,     1.0, -1.0,  1.0,    1.0, -1.0,  3.0,   -1.0, -1.0,  3.0, // cara inferior
		 1.0, -1.0,  1.0,     1.0,  1.0,  1.0,    1.0,  1.0,  3.0,    1.0, -1.0,  3.0, // cara derecha
		-1.0, -1.0,  1.0,    -1.0, -1.0,  3.0,   -1.0,  1.0,  3.0,   -1.0,  1.0,  1.0], 20);
		cub16T= coordenadaTextura([0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0], 4);// cara frente
		cub17T= coordenadaTextura([1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0, // cara atras
		0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, // cara superior
		1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, // cara inferior
		1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0, // cara derecha
		0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0], 20);
		cub16I= indexPoligono([0, 1, 2,     0, 2, 3], 6);
		cub17I= indexPoligono([0, 1, 2,     0, 2, 3, // frente
		4, 5, 6,     4, 6, 7,    // cara atras
		8, 9, 10,    8, 10, 11,  // cara superior
		12, 13, 14,  12, 14, 15, // cara inferior
		16, 17, 18,  16, 18, 19, // cara derecha
		], 30);

	   //... puntos del cubo centro delante superior
	
		cub16= puntosPoligono([-1.0,  1.0,  3.0,    1.0,  1.0,  3.0,    1.0, 3.0,  3.0,    -1.0,  3.0,  3.0], 4); // cara frente
		cub17= puntosPoligono([-1.0, 1.0,  1.0,    -1.0,  3.0,  1.0,    1.0,  3.0,  1.0,    1.0, 1.0,  1.0, // cara atras
		-1.0,  3.0,  1.0,    -1.0,  3.0,  3.0,    1.0,  3.0,  3.0,    1.0,  3.0,  1.0, // cara superior
		-1.0,  1.0,  1.0,     1.0,  1.0,  1.0,    1.0,  1.0,  3.0,   -1.0,  1.0,  3.0, // cara inferior
		 1.0,  1.0,  1.0,     1.0,  3.0,  1.0,    1.0,  3.0,  3.0,    1.0,  1.0,  3.0, // cara derecha
		-1.0,  1.0,  1.0,    -1.0,  1.0,  3.0,   -1.0,  3.0,  3.0,   -1.0,  3.0,  1.0], 20);
		//... puntos del cubo centro delante superior
		cub18= puntosPoligono([-1.0, -1.0,  3.0,    1.0, -1.0,  3.0,    1.0,-3.0,  3.0,    -1.0, -3.0,  3.0], 4); // cara frente
		cub19= puntosPoligono([-1.0, -1.0,  1.0,    -1.0, -3.0,  1.0,    1.0, -3.0,  1.0,    1.0, -1.0,  1.0, // cara atras
		-1.0, -3.0,  1.0,    -1.0, -3.0,  3.0,    1.0, -3.0,  3.0,    1.0, -3.0,  1.0, // cara superior
		-1.0, -1.0,  1.0,     1.0, -1.0,  1.0,    1.0, -1.0,  3.0,   -1.0, -1.0,  3.0, // cara inferior
		 1.0, -1.0,  1.0,     1.0, -3.0,  1.0,    1.0, -3.0,  3.0,    1.0, -1.0,  3.0, // cara derecha
		-1.0, -1.0,  1.0,    -1.0, -1.0,  3.0,   -1.0, -3.0,  3.0,   -1.0, -3.0,  1.0], 20);
		//... puntos del cubo centro atras	superior
		cub20= puntosPoligono([-1.0,  1.0, -1.0,    -1.0,  3.0, -1.0,    1.0,  3.0, -1.0,    1.0,  1.0, -1.0, // cara frente
		-1.0,  3.0, -1.0,    -1.0,  3.0, -3.0,    1.0,  3.0, -3.0,    1.0,  3.0, -1.0, // cara superior
		-1.0,  1.0, -1.0,     1.0,  1.0, -1.0,    1.0,  1.0, -3.0,   -1.0,  1.0, -3.0, // cara inferior
		 1.0,  1.0, -1.0,     1.0,  3.0, -1.0,    1.0,  3.0, -3.0,    1.0,  1.0, -3.0, // cara derecha
		-1.0,  1.0, -1.0,    -1.0,  1.0, -3.0,   -1.0,  3.0, -3.0,   -1.0,  3.0, -1.0], 20);
		cub21= puntosPoligono([-1.0,  1.0, -3.0, 1.0,  1.0, -3.0,    1.0,3.0, -3.0,    -1.0,  3.0,  -3.0], 4); // cara atras

		//... puntos del cubo centro atras	inferior
		cub22= puntosPoligono([-1.0, -1.0, -1.0,    -1.0, -3.0, -1.0,    1.0, -3.0, -1.0,    1.0, -1.0, -1.0, // cara frente
		-1.0, -3.0, -1.0,    -1.0, -3.0, -3.0,    1.0, -3.0, -3.0,    1.0, -3.0, -1.0, // cara superior
		-1.0, -1.0, -1.0,     1.0, -1.0, -1.0,    1.0, -1.0, -3.0,   -1.0, -1.0, -3.0, // cara inferior
		 1.0, -1.0, -1.0,     1.0, -3.0, -1.0,    1.0, -3.0, -3.0,    1.0, -1.0, -3.0, // cara derecha
		-1.0, -1.0, -1.0,    -1.0, -1.0, -3.0,   -1.0, -3.0, -3.0,   -1.0, -3.0, -1.0], 20);
		cub23= puntosPoligono([-1.0, -1.0, -3.0, 1.0, -1.0, -3.0,    1.0,-3.0, -3.0,    -1.0, -3.0,  -3.0], 4); // cara atras

	//... puntos del cubo centro medio derecho
	
	cub24= puntosPoligono([ 1.0, -1.0,  3.0,    3.0, -1.0,  3.0,    3.0, 1.0,  3.0,     1.0,  1.0,  3.0, // cara frente
	 1.0, -1.0,  1.0,     1.0,  1.0,  1.0,    3.0,  1.0,  1.0,    3.0, -1.0,  1.0, // cara atras
	 1.0,  1.0,  1.0,     1.0,  1.0,  3.0,    3.0,  1.0,  3.0,    3.0,  1.0,  1.0, // cara superior
	 1.0, -1.0,  1.0,     3.0, -1.0,  1.0,    3.0, -1.0,  3.0,    1.0, -1.0,  3.0, // cara inferior
	 1.0, -1.0,  1.0,     1.0, -1.0,  3.0,    1.0,  1.0,  3.0,    1.0,  1.0,  1.0], 20);
	cub25= puntosPoligono([3.0, -1.0,  1.0,     3.0,  1.0,  1.0,    3.0,  1.0,  3.0,    3.0, -1.0,  3.0], 4); // cara derecha
		//... puntos del cubo centro medio izquierdo  
	
		cub26= puntosPoligono([-1.0, -1.0,  3.0,    -3.0, -1.0,  3.0,    -3.0, 1.0,  3.0,    -1.0,  1.0,  3.0, // cara frente
		-1.0, -1.0,  1.0,    -1.0,  1.0,  1.0,    -3.0,  1.0,  1.0,    -3.0, -1.0,  1.0, // cara atras
		-1.0,  1.0,  1.0,    -1.0,  1.0,  3.0,    -3.0,  1.0,  3.0,    -3.0,  1.0,  1.0, // cara superior
		-1.0, -1.0,  1.0,     -3.0, -1.0,  1.0,    -3.0, -1.0,  3.0,   -1.0, -1.0,  3.0, // cara inferior
		-1.0, -1.0,  1.0,    -1.0, -1.0,  3.0,   -1.0,  1.0,  3.0,   -1.0,  1.0,  1.0], 20);
		cub27= puntosPoligono([-3.0, -1.0,  1.0,     -3.0,  1.0,  1.0,    -3.0,  1.0,  3.0,    -3.0, -1.0,  3.0], 4); // cara derecha
	
	//... puntos del cubo centro atras  derecho 
	cub28= puntosPoligono([1.0, -1.0, -3.0,  3.0, -1.0, -3.0,    3.0,1.0, -3.0,    1.0,  1.0,  -3.0, // cara frente
	1.0, -1.0, -1.0,    1.0,  1.0, -1.0,    3.0,  1.0, -1.0,    3.0, -1.0, -1.0, // cara atras
	1.0,  1.0, -1.0,    1.0,  1.0, -3.0,    3.0,  1.0, -3.0,    3.0,  1.0, -1.0, // cara superior
	1.0, -1.0, -1.0,     3.0, -1.0, -1.0,    3.0, -1.0, -3.0,   1.0, -1.0, -3.0, // cara inferior
	1.0, -1.0, -1.0,    1.0, -1.0, -3.0,   1.0,  1.0, -3.0,   1.0,  1.0, -1.0], 20);
	cub29= puntosPoligono([3.0, -1.0, -1.0,   3.0,  1.0, -1.0,    3.0,  1.0, -3.0,    3.0, -1.0, -3.0], 4); // cara derecha
	
		//... puntos del cubo centro atras  izquierdo
		cub30= puntosPoligono([-1.0, -1.0, -3.0,  -3.0, -1.0, -3.0,    -3.0,1.0, -3.0,    -1.0,  1.0,  -3.0, // cara frente
		-1.0, -1.0, -1.0,    -1.0,  1.0, -1.0,    -3.0,  1.0, -1.0,    -3.0, -1.0, -1.0, // cara atras
		-1.0,  1.0, -1.0,    -1.0,  1.0, -3.0,    -3.0,  1.0, -3.0,    -3.0,  1.0, -1.0, // cara superior
		-1.0, -1.0, -1.0,     -3.0, -1.0, -1.0,    -3.0, -1.0, -3.0,   -1.0, -1.0, -3.0, // cara inferior
		-1.0, -1.0, -1.0,    -1.0, -1.0, -3.0,   -1.0,  1.0, -3.0,   -1.0,  1.0, -1.0], 20);
		cub31= puntosPoligono([-3.0, -1.0, -1.0,   -3.0,  1.0, -1.0,    -3.0,  1.0, -3.0,    -3.0, -1.0, -3.0], 4); // cara derecha
		

	//... puntos del cubo esquina frente derecha
	
	cub32= puntosPoligono([ 1.0,  1.0,  3.0,    3.0,  1.0,  3.0,    3.0, 3.0,  3.0,     1.0,  3.0,  3.0], 4); // cara frente
	cub33= puntosPoligono([ 1.0, 1.0,  1.0,     1.0,  3.0,  1.0,    3.0,  3.0,  1.0,    3.0, 1.0,  1.0, // cara atras
	 1.0,  3.0,  1.0,     1.0,  3.0,  3.0,    3.0,  3.0,  3.0,    3.0,  3.0,  1.0, // cara superior
	 1.0,  3.0,  1.0,     3.0,  1.0,  1.0,    3.0,  1.0,  3.0,    1.0,  1.0,  3.0, // cara inferior
	 1.0,  3.0,  1.0,     1.0,  1.0,  3.0,    1.0,  3.0,  3.0,    1.0,  3.0,  1.0], 16);
	cub34= puntosPoligono([3.0,  1.0,  1.0,     3.0,  3.0,  1.0,    3.0,  3.0,  3.0,    3.0,  1.0,  3.0], 4); // cara derecha
	cub32T= coordenadaTextura([0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0], 4);// cara frente
	cub33T= coordenadaTextura([1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0, // cara atras
	0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, // cara superior
	1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, // cara inferior
	0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0], 16);
	cub34T= coordenadaTextura([1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0], 4); // cara derecha
	cub32I= indexPoligono([0, 1, 2,     0, 2, 3], 6);
	cub34I= indexPoligono([0, 1, 2,     0, 2, 3], 6);
	cub33I= indexPoligono([0, 1, 2,     0, 2, 3, // frente
	4, 5, 6,     4, 6, 7,    // cara atras
	8, 9, 10,    8, 10, 11,  // cara superior
	12, 13, 14,  12, 14, 15 // cara inferior
	], 24);

		//... puntos del cubo esquina frente izquierda
	
		cub35= puntosPoligono([-1.0,  1.0,  3.0,   -3.0,  1.0,  3.0,   -3.0, 3.0,  3.0,    -1.0,  3.0,  3.0], 4); // cara frente
		cub36= puntosPoligono([-1.0, 1.0,  1.0,    -1.0,  3.0,  1.0,   -3.0,  3.0,  1.0,   -3.0, 1.0,  1.0, // cara atras
		-1.0,  3.0,  1.0,    -1.0,  3.0,  3.0,   -3.0,  3.0,  3.0,   -3.0,  3.0,  1.0, // cara superior
		-1.0,  1.0,  1.0,    -3.0,  1.0,  1.0,   -3.0,  1.0,  3.0,   -1.0,  1.0,  3.0, // cara inferior
		-1.0,  1.0,  1.0,    -1.0,  1.0,  3.0,   -1.0,  3.0,  3.0,   -1.0,  3.0,  1.0], 16);
		cub37= puntosPoligono([-3.0,  1.0,  1.0,    -3.0,  3.0,  1.0,   -3.0,  3.0,  3.0,   -3.0,  1.0,  3.0], 4); // cara derecha
	
	//... puntos del cubo frente arista derecho
	cub38= puntosPoligono([ 1.0, -1.0,  3.0,    3.0, -1.0,  3.0,    3.0,-3.0,  3.0,     1.0, -3.0,  3.0], 4); // cara frente
	cub39= puntosPoligono([ 1.0, -1.0,  1.0,     1.0, -3.0,  1.0,    3.0, -3.0,  1.0,    3.0, -1.0,  1.0, // cara atras
	 1.0, -3.0,  1.0,     1.0, -3.0,  3.0,    3.0, -3.0,  3.0,    3.0, -3.0,  1.0, // cara superior
	 1.0, -1.0,  1.0,     3.0, -1.0,  1.0,    3.0, -1.0,  3.0,    1.0, -1.0,  3.0, // cara inferior	 
	 1.0, -1.0,  1.0,     1.0, -1.0,  3.0,    1.0, -3.0,  3.0,    1.0, -3.0,  1.0], 16);
	cub40= puntosPoligono([3.0, -1.0,  1.0,     3.0, -3.0,  1.0,    3.0, -3.0,  3.0,    3.0, -1.0,  3.0], 5); // cara derecha
	
	//... puntos del cubo frente arista izquierdo
	cub41= puntosPoligono([-1.0, -1.0,  3.0,    -3.0, -1.0,  3.0,    -3.0,-3.0,  3.0,    -1.0, -3.0,  3.0], 4); // cara frente
	cub42= puntosPoligono([-1.0, -1.0,  1.0,    -1.0, -3.0,  1.0,    -3.0, -3.0,  1.0,    -3.0, -1.0,  1.0, // cara atras
	-1.0, -3.0,  1.0,    -1.0, -3.0,  3.0,    -3.0, -3.0,  3.0,    -3.0, -3.0,  1.0, // cara superior
	-1.0, -1.0,  1.0,     -3.0, -1.0,  1.0,    -3.0, -1.0,  3.0,   -1.0, -1.0,  3.0, // cara inferior	 
	-1.0, -1.0,  1.0,    -1.0, -1.0,  3.0,   -1.0, -3.0,  3.0,   -1.0, -3.0,  1.0], 16);
	cub43= puntosPoligono([-3.0, -1.0,  1.0,     -3.0, -3.0,  1.0,    -3.0, -3.0,  3.0,    -3.0, -1.0,  3.0], 5); // cara derecha
	
	//... puntos del cubo atras	arista derecha
	cub44= puntosPoligono([ 1.0,  1.0, -1.0,     1.0,  3.0, -1.0,    3.0,  3.0, -1.0,    3.0,  1.0, -1.0, // cara frente
	 1.0,  3.0, -1.0,     1.0,  3.0, -3.0,    3.0,  3.0, -3.0,    3.0,  3.0, -1.0, // cara superior
	 1.0,  1.0, -1.0,     3.0,  1.0, -1.0,    3.0,  1.0, -3.0,    1.0,  1.0, -3.0, // cara inferior
	 1.0,  1.0, -1.0,     1.0,  1.0, -3.0,    1.0,  3.0, -3.0,    1.0,  3.0, -1.0], 16);
	cub45= puntosPoligono([ 1.0,  1.0, -3.0, 3.0,  1.0, -3.0,    3.0,3.0, -3.0,     1.0,  3.0,  -3.0], 4); // cara atras
	cub46= puntosPoligono([3.0,  1.0, -1.0,     3.0,  3.0, -1.0,    3.0,  3.0, -3.0,    3.0,  1.0, -3.0], 4); // cara derecha

	//... puntos del cubo atras	arista izquierda
	cub47= puntosPoligono([-1.0,  1.0, -1.0,    -1.0,  3.0, -1.0,    -3.0,  3.0, -1.0,    -3.0,  1.0, -1.0, // cara frente
	-1.0,  3.0, -1.0,    -1.0,  3.0, -3.0,    -3.0,  3.0, -3.0,    -3.0,  3.0, -1.0, // cara superior
	-1.0,  1.0, -1.0,     -3.0,  1.0, -1.0,    -3.0,  1.0, -3.0,   -1.0,  1.0, -3.0, // cara inferior
	-1.0,  1.0, -1.0,    -1.0,  1.0, -3.0,   -1.0,  3.0, -3.0,   -1.0,  3.0, -1.0], 16);
	cub48= puntosPoligono([-1.0,  1.0, -3.0, -3.0,  1.0, -3.0,    -3.0,3.0, -3.0,    -1.0,  3.0,  -3.0], 4); // cara atras
	cub49= puntosPoligono([-3.0,  1.0, -1.0,     -3.0,  3.0, -1.0,    -3.0,  3.0, -3.0,    -3.0,  1.0, -3.0], 4); // cara derecha

	//... puntos del cubo centro atras	arista derecha
	cub50= puntosPoligono([ 1.0, -1.0, -1.0,     1.0, -3.0, -1.0,    3.0, -3.0, -1.0,    3.0, -1.0, -1.0, // cara frente
	 1.0, -3.0, -1.0,     1.0, -3.0, -3.0,    3.0, -3.0, -3.0,    3.0, -3.0, -1.0, // cara superior
	 1.0, -1.0, -1.0,     3.0, -1.0, -1.0,    3.0, -1.0, -3.0,    1.0, -1.0, -3.0, // cara inferior	 
	 1.0, -1.0, -1.0,     1.0, -1.0, -3.0,    1.0, -3.0, -3.0,    1.0, -3.0, -1.0], 20);
	cub51= puntosPoligono([ 1.0, -1.0, -3.0, 3.0, -1.0, -3.0,    3.0,-3.0, -3.0,     1.0, -3.0,  -3.0], 4); // cara atras
	cub52= puntosPoligono([3.0, -1.0, -1.0,     3.0, -3.0, -1.0,    3.0, -3.0, -3.0,    3.0, -1.0, -3.0], 4); // cara derecha

	//... puntos del cubo centro atras	arista derecha

	cub53= puntosPoligono([-1.0, -1.0, -1.0,    -1.0, -3.0, -1.0,    -3.0, -3.0, -1.0,    -3.0, -1.0, -1.0, // cara frente
	-1.0, -3.0, -1.0,    -1.0, -3.0, -3.0,    -3.0, -3.0, -3.0,    -3.0, -3.0, -1.0, // cara superior
	-1.0, -1.0, -1.0,     -3.0, -1.0, -1.0,    -3.0, -1.0, -3.0,   -1.0, -1.0, -3.0, // cara inferior
	-1.0, -1.0, -1.0,    -1.0, -1.0, -3.0,   -1.0, -3.0, -3.0,   -1.0, -3.0, -1.0, // cara derecha
	], 16);
	cub54= puntosPoligono([-1.0, -1.0, -3.0, -3.0, -1.0, -3.0,    -3.0,-3.0, -3.0,    -1.0, -3.0,  -3.0], 4); // cara atras
	cub55= puntosPoligono([ -3.0, -1.0, -1.0,     -3.0, -3.0, -1.0,    -3.0, -3.0, -3.0,    -3.0, -1.0, -3.0], 4);

	
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
var  velX= 0, velY= 0, coordZ= 0, enbudo= 0;
function dibujarEscena() {
	gl.viewport(0, 0, gl.puertoVistaAncho, gl.puertoVistaAlto);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    mat4.perspective(45, gl.puertoVistaAncho / gl.puertoVistaAlto, 0.1, 100.0, pMatriz);

	//centros
	poligono3D(cub1, cub1I, cub1T, aTextura[3],  [0.0, 0.0, -12.0], xRot, [1, 0, 0], yRot, [0,1, 0], zRot, [0, 0, 1], [1, 1, 1]);
	poligono3D(cub2, cub1I, cub1T, aTextura[19], [0.0, 0.0, -12.0], xRot, [1, 0, 0], yRot, [0,1, 0], zRot, [0, 0, 1], [1, 1, 1]);
	poligono3D(cub3, cub1I, cub1T, aTextura[24], [0.0, 0.0, -12.0], xRot, [1, 0, 0], yRot, [0,1, 0], zRot, [0, 0, 1], [1, 1, 1]);
	poligono3D(cub4, cub1I, cub1T, aTextura[21], [0.0, 0.0, -12.0], xRot, [1, 0, 0], yRot, [0,1, 0], zRot, [0, 0, 1], [1, 1, 1]);
	poligono3D(cub5, cub1I, cub1T, aTextura[22], [0.0, 0.0, -12.0], xRot, [1, 0, 0], yRot, [0,1, 0], zRot, [0, 0, 1], [1, 1, 1]);
	poligono3D(cub6, cub1I, cub1T, aTextura[20], [0.0, 0.0, -12.0], xRot, [1, 0, 0], yRot, [0,1, 0], zRot, [0, 0, 1], [1, 1, 1]);
	poligono3D(cub7, cub1I, cub1T, aTextura[23], [0.0, 0.0, -12.0], xRot, [1, 0, 0], yRot, [0,1, 0], zRot, [0, 0, 1], [1, 1, 1]);
	
	// centros superior y inferior
	poligono3D(cub8, cub8I, cub8T, aTextura[21],  [0.0, 0.0, -12.0], xRot, [1, 0, 0], yRot, [0,1, 0], zRot, [0, 0, 1], [1, 1, 1]);
	poligono3D(cub9, cub8I, cub8T, aTextura[19],  [0.0, 0.0, -12.0], xRot, [1, 0, 0], yRot, [0,1, 0], zRot, [0, 0, 1], [1, 1, 1]);
	poligono3D(cub10, cub8I, cub8T, aTextura[22],  [0.0, 0.0, -12.0], xRot, [1, 0, 0], yRot, [0,1, 0], zRot, [0, 0, 1], [1, 1, 1]);
	poligono3D(cub11, cub8I, cub8T, aTextura[19],  [0.0, 0.0, -12.0], xRot, [1, 0, 0], yRot, [0,1, 0], zRot, [0, 0, 1], [1, 1, 1]);
	poligono3D(cub12,cub8I, cub8T, aTextura[21],  [0.0, 0.0, -12.0], xRot, [1, 0, 0], yRot, [0,1, 0], zRot, [0, 0, 1], [1, 1, 1]);
	poligono3D(cub13, cub8I, cub8T, aTextura[24],  [0.0, 0.0, -12.0], xRot, [1, 0, 0], yRot, [0,1, 0], zRot, [0, 0, 1], [1, 1, 1]);
	poligono3D(cub14, cub8I, cub8T, aTextura[22],  [0.0, 0.0, -12.0], xRot, [1, 0, 0], yRot, [0,1, 0], zRot, [0, 0, 1], [1, 1, 1]);
	poligono3D(cub15, cub8I, cub8T, aTextura[24],  [0.0, 0.0, -12.0], xRot, [1, 0, 0], yRot, [0,1, 0], zRot, [0, 0, 1], [1, 1, 1]);
	// 
	poligono3D(cub16, cub8I, cub8T, aTextura[20],  [0.0, 0.0, -12.0], xRot, [1, 0, 0], yRot, [0,1, 0], zRot, [0, 0, 1], [1, 1, 1]);
	poligono3D(cub17, cub8I, cub8T, aTextura[21],  [0.0, 0.0, -12.0], xRot, [1, 0, 0], yRot, [0,1, 0], zRot, [0, 0, 1], [1, 1, 1]);

	poligono3D(cub18, cub8I, cub8T, aTextura[20],  [0.0, 0.0, -12.0], xRot, [1, 0, 0], yRot, [0,1, 0], zRot, [0, 0, 1], [1, 1, 1]);
	poligono3D(cub19, cub8I, cub8T, aTextura[22],  [0.0, 0.0, -12.0], xRot, [1, 0, 0], yRot, [0,1, 0], zRot, [0, 0, 1], [1, 1, 1]);

	poligono3D(cub20, cub8I, cub8T, aTextura[21],  [0.0, 0.0, -12.0], xRot, [1, 0, 0], yRot, [0,1, 0], zRot, [0, 0, 1], [1, 1, 1]);
	poligono3D(cub21, cub8I, cub8T, aTextura[23],  [0.0, 0.0, -12.0], xRot, [1, 0, 0], yRot, [0,1, 0], zRot, [0, 0, 1], [1, 1, 1]);
	
	poligono3D(cub22, cub8I, cub8T, aTextura[22],  [0.0, 0.0, -12.0], xRot, [1, 0, 0], yRot, [0,1, 0], zRot, [0, 0, 1], [1, 1, 1]);
	poligono3D(cub23, cub8I, cub8T, aTextura[23],  [0.0, 0.0, -12.0], xRot, [1, 0, 0], yRot, [0,1, 0], zRot, [0, 0, 1], [1, 1, 1]);
	
	//centros medios delante derecho y izquierdo del cubo 
	poligono3D(cub24,  cub8I, cub8T, aTextura[20],  [0.0, 0.0, -12.0], xRot, [1, 0, 0], yRot, [0,1, 0], zRot, [0, 0, 1], [1, 1, 1]);
	poligono3D(cub25,  cub8I, cub8T, aTextura[19],  [0.0, 0.0, -12.0], xRot, [1, 0, 0], yRot, [0,1, 0], zRot, [0, 0, 1], [1, 1, 1]);
	poligono3D(cub26,  cub8I, cub8T, aTextura[20],  [0.0, 0.0, -12.0], xRot, [1, 0, 0], yRot, [0,1, 0], zRot, [0, 0, 1], [1, 1, 1]);
	poligono3D(cub27,  cub8I, cub8T, aTextura[24],  [0.0, 0.0, -12.0], xRot, [1, 0, 0], yRot, [0,1, 0], zRot, [0, 0, 1], [1, 1, 1]);
    // centros medios atras derecho y izquierdo del cubo 
	poligono3D(cub28,  cub8I, cub8T, aTextura[23],  [0.0, 0.0, -12.0], xRot, [1, 0, 0], yRot, [0,1, 0], zRot, [0, 0, 1], [1, 1, 1]);
	poligono3D(cub29,  cub8I, cub8T, aTextura[19],  [0.0, 0.0, -12.0], xRot, [1, 0, 0], yRot, [0,1, 0], zRot, [0, 0, 1], [1, 1, 1]);
	poligono3D(cub30,  cub8I, cub8T, aTextura[23],  [0.0, 0.0, -12.0], xRot, [1, 0, 0], yRot, [0,1, 0], zRot, [0, 0, 1], [1, 1, 1]);
	poligono3D(cub31,  cub8I, cub8T, aTextura[24],  [0.0, 0.0, -12.0], xRot, [1, 0, 0], yRot, [0,1, 0], zRot, [0, 0, 1], [1, 1, 1]);
	// puntos de aristas de
	poligono3D(cub32, cub32I, cub32T, aTextura[20],  [0.0, 0.0, -12.0], xRot, [1, 0, 0], yRot, [0,1, 0], zRot, [0, 0, 1], [1, 1, 1]);
	poligono3D(cub33, cub33I, cub33T, aTextura[21],  [0.0, 0.0, -12.0], xRot, [1, 0, 0], yRot, [0,1, 0], zRot, [0, 0, 1], [1, 1, 1]);
	poligono3D(cub34, cub34I, cub34T, aTextura[19],  [0.0, 0.0, -12.0], xRot, [1, 0, 0], yRot, [0,1, 0], zRot, [0, 0, 1], [1, 1, 1]);
	
	poligono3D(cub35, cub32I, cub32T, aTextura[20],  [0.0, 0.0, -12.0], xRot, [1, 0, 0], yRot, [0,1, 0], zRot, [0, 0, 1], [1, 1, 1]);
	poligono3D(cub36, cub33I, cub33T, aTextura[21],  [0.0, 0.0, -12.0], xRot, [1, 0, 0], yRot, [0,1, 0], zRot, [0, 0, 1], [1, 1, 1]);
	poligono3D(cub37, cub34I, cub34T, aTextura[24],  [0.0, 0.0, -12.0], xRot, [1, 0, 0], yRot, [0,1, 0], zRot, [0, 0, 1], [1, 1, 1]);
	
	poligono3D(cub38, cub32I, cub32T, aTextura[20],  [0.0, 0.0, -12.0], xRot, [1, 0, 0], yRot, [0,1, 0], zRot, [0, 0, 1], [1, 1, 1]);
	poligono3D(cub39, cub33I, cub33T, aTextura[22],  [0.0, 0.0, -12.0], xRot, [1, 0, 0], yRot, [0,1, 0], zRot, [0, 0, 1], [1, 1, 1]);
	poligono3D(cub40, cub34I, cub34T, aTextura[19],  [0.0, 0.0, -12.0], xRot, [1, 0, 0], yRot, [0,1, 0], zRot, [0, 0, 1], [1, 1, 1]);

	poligono3D(cub41, cub32I, cub32T, aTextura[20],  [0.0, 0.0, -12.0], xRot, [1, 0, 0], yRot, [0,1, 0], zRot, [0, 0, 1], [1, 1, 1]);
	poligono3D(cub42, cub33I, cub33T, aTextura[22],  [0.0, 0.0, -12.0], xRot, [1, 0, 0], yRot, [0,1, 0], zRot, [0, 0, 1], [1, 1, 1]);
	poligono3D(cub43, cub34I, cub34T, aTextura[24],  [0.0, 0.0, -12.0], xRot, [1, 0, 0], yRot, [0,1, 0], zRot, [0, 0, 1], [1, 1, 1]);

	poligono3D(cub44, cub33I, cub33T, aTextura[21],  [0.0, 0.0, -12.0], xRot, [1, 0, 0], yRot, [0,1, 0], zRot, [0, 0, 1], [1, 1, 1]);
	poligono3D(cub45, cub32I, cub32T, aTextura[23],  [0.0, 0.0, -12.0], xRot, [1, 0, 0], yRot, [0,1, 0], zRot, [0, 0, 1], [1, 1, 1]);
	poligono3D(cub46, cub34I, cub34T, aTextura[19],  [0.0, 0.0, -12.0], xRot, [1, 0, 0], yRot, [0,1, 0], zRot, [0, 0, 1], [1, 1, 1]);

	poligono3D(cub47, cub33I, cub33T, aTextura[21],  [0.0, 0.0, -12.0], xRot, [1, 0, 0], yRot, [0,1, 0], zRot, [0, 0, 1], [1, 1, 1]);
	poligono3D(cub48, cub32I, cub32T, aTextura[23],  [0.0, 0.0, -12.0], xRot, [1, 0, 0], yRot, [0,1, 0], zRot, [0, 0, 1], [1, 1, 1]);
	poligono3D(cub49, cub34I, cub34T, aTextura[24],  [0.0, 0.0, -12.0], xRot, [1, 0, 0], yRot, [0,1, 0], zRot, [0, 0, 1], [1, 1, 1]);

	poligono3D(cub50, cub33I, cub33T, aTextura[22],  [0.0, 0.0, -12.0], xRot, [1, 0, 0], yRot, [0,1, 0], zRot, [0, 0, 1], [1, 1, 1]);
	poligono3D(cub51, cub32I, cub32T, aTextura[23],  [0.0, 0.0, -12.0], xRot, [1, 0, 0], yRot, [0,1, 0], zRot, [0, 0, 1], [1, 1, 1]);
	poligono3D(cub52, cub34I, cub34T, aTextura[19],  [0.0, 0.0, -12.0], xRot, [1, 0, 0], yRot, [0,1, 0], zRot, [0, 0, 1], [1, 1, 1]);

	poligono3D(cub53, cub33I, cub33T, aTextura[22],  [0.0, 0.0, -12.0], xRot, [1, 0, 0], yRot, [0,1, 0], zRot, [0, 0, 1], [1, 1, 1]);
	poligono3D(cub54, cub32I, cub32T, aTextura[23],  [0.0, 0.0, -12.0], xRot, [1, 0, 0], yRot, [0,1, 0], zRot, [0, 0, 1], [1, 1, 1]);
	poligono3D(cub55, cub34I, cub34T, aTextura[24],  [0.0, 0.0, -12.0], xRot, [1, 0, 0], yRot, [0,1, 0], zRot, [0, 0, 1], [1, 1, 1]);





   
	
}

var keyPrecionado = {};
function manejoKeyIzquierda(evento) {
    keyPrecionado[evento.keyCode] = true;
}
function manejoKeyDerecha(evento) {
    keyPrecionado[evento.keyCode] = false;
}
function manejoKeyArriba(evento) {
    keyPrecionado[evento.keyCode] = true;
}
function manejoKeyAbajo(evento) {
    keyPrecionado[evento.keyCode] = false;
}

function manejoKeys() {
	
		if (keyPrecionado[33]) {
			zRot+= 1; // 
			if(zRot>=360)
			zRot=0;
		}
		if (keyPrecionado[34]) {
			zRot-= 1; //  
			if(zRot<=0)
			zRot=360;
		}
		if (keyPrecionado[37]) {
			yRot-= 1; // 
			if(yRot<=0)
			yRot=360;
		}
		if (keyPrecionado[39]) {
			yRot+= 1; //  
			if(yRot>=360)
			yRot=0;
		}
		if (keyPrecionado[38]) {
			xRot-= 1; //
			if(xRot<=0)
			xRot=360;
		}
		if (keyPrecionado[40]) {
			xRot+= 1; //  
			if(xRot>=360)
			xRot=0;
		}
	
	
	if (keyPrecionado[33]) {
			velz-=0; // Left cursor key
	}
	if (keyPrecionado[34]) {
			velz+= 0; // Right cursor key
	}	
    if (keyPrecionado[37]) {
        velY-=0; // Left cursor key
    }
    if (keyPrecionado[39]) {
        velY+= 0; // Right cursor key
    }
    if (keyPrecionado[38]) {
        velX-= 0; // Up cursor key
    }
    if (keyPrecionado[40]) {
        velX+= 0; // Down cursor key
    }
}
var ultimoTiempo = 0;
function animacion() {
	var tiempoActual = new Date().getTime();
    if (ultimoTiempo != 0) {
		var periodo = tiempoActual - ultimoTiempo;
		xRot += (velX * periodo) / 1000.0;
		yRot += (velY * periodo) / 1000.0;
		zRot += (velz * periodo) / 1000.0;
		
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
    gl.clearColor(0.0, 1.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
	    //... Para detectar las pulsaciones (presiona tecla y suelta)
		document.onkeydown = manejoKeyAbajo;
		document.onkeyup = manejoKeyArriba;
		document.onkeydown = manejoKeyIzquierda;
		document.onkeyup = manejoKeyDerecha;
    momento();
}



