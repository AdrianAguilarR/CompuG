/* global mat4 */

var gl;
function iniciarGL(canvas) {
    try {
        gl = canvas.getContext("webgl");
        gl.puertoVistaAncho = canvas.width;
        gl.puertoVistaAlto = canvas.height;
    } catch (e) { }
    if (!gl) {
        alert("No puede iniciarse webGL en este navegador");
    }
}
function conseguirShader(gl, id) {
    var shaderScript = document.getElementById(id);
    if (!shaderScript) {
        return null;
    }
    var str = "";
    var k = shaderScript.firstChild;
    while (k) {
        if (k.nodeType == 3)
            str += k.textContent;
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
var programaShader;
function iniciarShaders() {
    var fragmentoShader = conseguirShader(gl, "shader-fs");
    var verticeShader = conseguirShader(gl, "shader-vs");
    programaShader = gl.createProgram();
    gl.attachShader(programaShader, verticeShader);
    gl.attachShader(programaShader, fragmentoShader);
    gl.linkProgram(programaShader);
    if (!gl.getProgramParameter(programaShader, gl.LINK_STATUS)) {
        alert("No pueden iniciarse los shaders");
    }
    gl.useProgram(programaShader);
    programaShader.atribPosVertice = gl.getAttribLocation(programaShader, "aPosVertice");
    gl.enableVertexAttribArray(programaShader.atribPosVertice);
    //... Definimos Shaders para el color
    programaShader.vertColorAtributo = gl.getAttribLocation(programaShader, "aVerticeColor");
    gl.enableVertexAttribArray(programaShader.vertColorAtributo);
    ///... Fin de Shaders para el color
    programaShader.pMatrizUniforme = gl.getUniformLocation(programaShader, "uPMatriz");
    programaShader.mvMatrizUniforme = gl.getUniformLocation(programaShader, "umvMatriz");
}
//... se modifica puntos poligono por tratarse de 3D
function puntosPiramide(pPuntos, pVertice){
    // esta funcion trabaja tambien para 3D
    var pol = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pol);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pPuntos), gl.STATIC_DRAW);
    pol.itemTam = 3;
    pol.numItems = pVertice;
    return pol;
}
function colorPiramide(pColor, pVertice){
    var polC = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, polC);
    color= [];
        for(var i= 0; i<pVertice; i++){
              color= color.concat(pColor); 
        }
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(color), gl.STATIC_DRAW);
    polC.itemTam = 4;
    polC.numItems = pVertice;
    return polC;
}
function colorPiramide3D(pColor, pVertice, pArista){
    var polC = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, polC);
   var color= [];
   for(var i=0 in pColor){
       var c= pColor[i];
        for(var j= 0; j<pVertice; j++){
              color= color.concat(c); 
        }
   }   
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(color), gl.STATIC_DRAW);
    polC.itemTam = 4;
    polC.numItems = pArista;
    return polC;
}
function indexPiramide(pIndex, pNumI){
    var polI = gl.createBuffer(); //... nuevo
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, polI);
    // Triangulamos cada cara del poligono
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(pIndex), gl.STATIC_DRAW);
    polI.itemTam = 1;
    polI.numItems = pNumI;
    return polI;
}
var pir1, pir1C,pir2, pir2C;
var pira1,pira1C,pira1I; //... nuevo
function iniciarBuffers() {
    //... puntos del cara superior del piramide
    pir1=puntosPiramide([-1.4071,0.1417,-0.5000,  0.1417,1.4071,-0.5000,   -0.1417,-1.4071,-0.5000,   1.4071,-0.1417,-0.5000],4); //cara superior
    pir2=puntosPiramide([-0.7035,0.0709,0.5000,   0.0709,0.7035, 0.5000,   -0.0709,-0.7035, 0.5000,   0.7035,-0.0709,0.5000],4);  // cara inferior
    
    //... lados del Piramide para el 3D
    pira1=puntosPiramide([
   -1.4071,0.1417,-0.5000,   0.1417,1.4071,-0.5000,   0.0709,0.7035, 0.5000,    -0.7035,0.0709,0.5000,//cara1
    0.1417,1.4071,-0.5000,   1.4071,-0.1417,-0.5000,  0.7035,-0.0709,0.5000,     0.0709,0.7035, 0.5000,// cara 2
    1.4071,-0.1417,-0.5000, -0.1417,-1.4071,-0.5000, -0.0709,-0.7035, 0.5000,    0.7035,-0.0709,0.5000, // cara 3 
   -0.1417,-1.4071,-0.5000, -1.4071,0.1417,-0.5000,  -0.7035,0.0709,0.5000,     -0.0709,-0.7035, 0.5000, // cara 4  
    ],20);
         
    // Color del Piramide
    pir1C=colorPiramide([1.0, 0.0, 0.0, 1.0],4);
    pir2C=colorPiramide([0.0, 1.0, 0.0, 1.0],4);
    //... Color lados del Piramide
    pira1C=colorPiramide3D([[0.0, 0.0, 1.0, 1.0], //carar 1
        [1.0, 1.0, 0.0, 1.0], //cara 2 
        [1.0, 0.0, 1.0, 1.0], //cara 3
        [0.0, 1.0, 1.0, 1.0], //cara 4
       
    ],4,16);
    pira1I= indexPiramide([
        0, 1, 2,     0, 2, 3,    // cara 1
        4, 5, 6,     4, 6, 7,    // cara 2
        8, 9, 10,    8, 10, 11,  // cara 3
        12, 13, 14,  12, 14, 15, // cara 4
       
    ], 24);
}
var mvMatriz = mat4.create();
var pMatriz = mat4.create();
function modificarMatrizUniforme() {
    gl.uniformMatrix4fv(programaShader.pMatrizUniforme, false, pMatriz);
    gl.uniformMatrix4fv(programaShader.mvMatrizUniforme, false, mvMatriz);
}

function piramide(pPiramide, pPoligonoC, pTraslacion, pAngulo, pEjeRotacion, pEscala){
    mat4.identity(mvMatriz);
    mat4.translate(mvMatriz, pTraslacion);
    mat4.rotate(mvMatriz, pAngulo, pEjeRotacion);
    mat4.scale(mvMatriz, pEscala);
    gl.bindBuffer(gl.ARRAY_BUFFER, pPiramide);
    gl.vertexAttribPointer(programaShader.atribPosVertice, pPiramide.itemTam, gl.FLOAT, false, 0, 0);
    //... Aplicando color
    gl.bindBuffer(gl.ARRAY_BUFFER, pPoligonoC);
    gl.vertexAttribPointer(programaShader.vertColorAtributo, pPoligonoC.itemTam, gl.FLOAT, false, 0, 0);
    //... Fin aplicando color
    modificarMatrizUniforme();
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, pPiramide.numItems);
}
function piramide3D(pPiramide, pPiramideC, pPiramideI, pTraslacion, pAngulo, pEjeRotacion, pEscala){
    mat4.identity(mvMatriz);
    mat4.translate(mvMatriz, pTraslacion);
    mat4.rotate(mvMatriz, pAngulo, pEjeRotacion);
    mat4.scale(mvMatriz, pEscala);
    gl.bindBuffer(gl.ARRAY_BUFFER, pPiramide);
    gl.vertexAttribPointer(programaShader.atribPosVertice, pPiramide.itemTam, gl.FLOAT, false, 0, 0);
    //... Aplicando color
    gl.bindBuffer(gl.ARRAY_BUFFER, pPiramideC);
    gl.vertexAttribPointer(programaShader.vertColorAtributo, pPiramideC.itemTam, gl.FLOAT, false, 0, 0);
   // Fin Aplicacion color
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, pPiramideI);
    modificarMatrizUniforme();
    //... cambiado
    gl.drawElements(gl.TRIANGLES, pPiramideI.numItems, gl.UNSIGNED_SHORT, 0); //... nuevo
}
var rotar= 0;
function dibujarEscena() {
    gl.viewport(0, 0, gl.puertoVistaAncho, gl.puertoVistaAlto);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    mat4.perspective(45, gl.puertoVistaAncho / gl.puertoVistaAlto, 0.1, 100.0, pMatriz);
    //... dibujando Piramide
   piramide(pir1, pir1C, [0.0, 0.0, -7.0], rotar*Math.PI/180, [1, 1, 0], [1.0, 1.0, 1.0]);
   piramide(pir2, pir2C, [0.0, 0.0, -7.0], rotar*Math.PI/180, [1, 1, 0], [1.0, 1.0, 1.0]);
   piramide3D(pira1, pira1C,pira1I, [0.0, 0.0, -7.0], rotar*Math.PI/180, [1, 1, 0], [1.0, 1.0, 1.0]);
   
}
var ultimoTiempo= 0;
function animacion() {
    var tiempoAhora = new Date().getTime();
    if (ultimoTiempo != 0) {
        var lapso = tiempoAhora - ultimoTiempo;
        rotar += (50 * lapso) / 1000.0;  
    }
    if(rotar>=360)
        rotar= 0;
  
    ultimoTiempo = tiempoAhora;
}
function mover(){
    dibujarEscena();
    animacion();
    requestAnimFrame(mover);
}
function webGLEjecutar() {
    var canvas = document.getElementById("leccion03-3D");
    iniciarGL(canvas);
    iniciarShaders();
    iniciarBuffers();
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    mover();
}