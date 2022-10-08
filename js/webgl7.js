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
function iniciarShaders(){
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
    //... 1. Definimos Shaders para el color
    programaShader.vertColorAtributo = gl.getAttribLocation(programaShader, "aVerticeColor");
    gl.enableVertexAttribArray(programaShader.vertColorAtributo);
    //... Fin de Shaders para el color
    programaShader.pMatrizUniforme = gl.getUniformLocation(programaShader, "uPMatriz");
    programaShader.mvMatrizUniforme = gl.getUniformLocation(programaShader, "umvMatriz");
}
// funcion pára triangulo1
function puntosTriangulo(pPuntos){
    
    var  tri = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tri);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pPuntos), gl.STATIC_DRAW);
    tri.itemTam = 3;
    tri.numItems = 3;
    return tri;
}
function colorTriangulo(pColor){
    var triC = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triC);
    var color =[];
    for (var i=0;i<3;i++){
        color= color.concat(pColor);
    }
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(color), gl.STATIC_DRAW);
    triC.itemTam = 4;
    triC.numItems = 3;
    return triC;
}
// funcion para el triangulo 2
function puntosTriangulo2(pPuntos){
    
    var  tri2 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tri2);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pPuntos), gl.STATIC_DRAW);
    tri2.itemTam = 3;
    tri2.numItems = 3;
    return tri2;
}
function colorTriangulo2(pColor){
    var tri2C = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tri2C);
    var color =[];
    for (var i=0;i<3;i++){
        color= color.concat(pColor);
    }
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(color), gl.STATIC_DRAW);
    tri2C.itemTam = 4;
    tri2C.numItems = 3;
    return tri2C;
}
// funcion para el triangulo 3
function puntosTriangulo3(pPuntos){
    
    var  tri3 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tri3);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pPuntos), gl.STATIC_DRAW);
    tri3.itemTam = 3;
    tri3.numItems = 3;
    return tri3;
}
function colorTriangulo3(pColor){
    var tri3C = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tri3C);
    var color =[];
    for (var i=0;i<3;i++){
        color= color.concat(pColor);
    }
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(color), gl.STATIC_DRAW);
    tri3C.itemTam = 4;
    tri3C.numItems = 3;
    return tri3C;
}
// funcion para el triangulo 4
function puntosTriangulo4(pPuntos){
    
    var  tri4 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tri4);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pPuntos), gl.STATIC_DRAW);
    tri4.itemTam = 3;
    tri4.numItems = 3;
    return tri4;
}
function colorTriangulo4(pColor){
    var tri4C = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tri4C);
    var color =[];
    for (var i=0;i<3;i++){
        color= color.concat(pColor);
    }
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(color), gl.STATIC_DRAW);
    tri4C.itemTam = 4;
    tri4C.numItems = 3;
    return tri4C;
}
// funcion para el triangulo 5
function puntosTriangulo5(pPuntos){
    
    var  tri5 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tri5);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pPuntos), gl.STATIC_DRAW);
    tri5.itemTam = 3;
    tri5.numItems = 3;
    return tri5;
}
function colorTriangulo5(pColor){
    var tri5C = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tri5C);
    var color =[];
    for (var i=0;i<3;i++){
        color= color.concat(pColor);
    }
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(color), gl.STATIC_DRAW);
    tri5C.itemTam = 4;
    tri5C.numItems = 3;
    return tri5C;
}
//funcion para cuadrado 1
function puntosCuadrado(pPuntos){
    
    var  cua = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cua);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pPuntos), gl.STATIC_DRAW);
    cua.itemTam = 3;
    cua.numItems = 4;
    return cua;
}
function colorCuadrado(pColor){
    var cuaC = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cuaC);
    var color =[];
    for (var i=0;i<4;i++){
        color= color.concat(pColor);
    }
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(color), gl.STATIC_DRAW);
    cuaC.itemTam = 4;
    cuaC.numItems = 3;
    return cuaC;
}
//funcion para cuadrado 2
function puntosCuadrado2(pPuntos){
    
    var  cua2 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cua2);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pPuntos), gl.STATIC_DRAW);
    cua2.itemTam = 3;
    cua2.numItems = 4;
    return cua2;
}
function colorCuadrado2(pColor){
    var cua2C = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cua2C);
    var color =[];
    for (var i=0;i<4;i++){
        color= color.concat(pColor);
    }
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(color), gl.STATIC_DRAW);
    cua2C.itemTam = 4;
    cua2C.numItems = 3;
    return cua2C;
}
//... 2. variable para color
var triangulo, trianguloColor;
var triangulo2, triangulo2Color;
var triangulo3, triangulo3Color;
var triangulo4, triangulo4Color;
var triangulo5, triangulo5Color;
var cuadrado,cuadradoColor;
var cuadrado2,cuadrado2Color;

function iniciarBuffers() {
    //... construyendo triangulo
   triangulo= puntosTriangulo(
           [ 0.0, 0.0, 0.0,
            -1.0,-1.0, 0.0, 
            -1.0, 0.0, 0.0]);
    triangulo2= puntosTriangulo2(
           [ 0.0, 0.0, 0.0,
            -2.0,-2.0, 0.0, 
            2.0, -2.0, 0.0]);
    triangulo3= puntosTriangulo3(
           [ 0.0, 0.0, 0.0,
            1.5,-1.5, 0.0, 
            3.0, 0.0, 0.0]);
    triangulo4= puntosTriangulo4(
           [ 2, -2, 0.0,
             4.0, -4.0, 0.0, 
             4.0, 0.0, 0.0]);
    triangulo5= puntosTriangulo5(
           [ 0.0, 0.0, 0.0,
            -2.5,-2.5, 0.0, 
            2.5, -2.5, 0.0]);
    cuadrado= puntosCuadrado(
           [-3.5, -0.5, 0.0,
            -0.5, -0.5, 0.0,
            -5.7, -2.7, 0.0,
            -2.7, -2.7, 0.0]);
    cuadrado2= puntosCuadrado2(
           [-0.7, -0.7, 0.0,
            -4.0, -0.5, 0.0,
            -0.7,  1.5, 0.0,
            -4.0,  1.5, 0.0]);
    trianguloColor=colorTriangulo([1.0,  0.0,  1.0,  1.0]);
    triangulo2Color=colorTriangulo2([1.0, 0.0, 1.0 ,1.0]);
    triangulo3Color=colorTriangulo3([1.0,  1.0,  0.0,  1.0]);
    triangulo4Color=colorTriangulo4([1.0, 1.0, 1.0,1.0]);
    triangulo5Color=colorTriangulo5([0.0,  0.0,  1.0,  1.0]);
    cuadradoColor=colorCuadrado([1.0,  0.0,  0.0,  1.0]);
    cuadrado2Color=colorCuadrado2([0.0,  1.0,  0.0,  1.0]);
}
var mvMatriz = mat4.create();
var pMatriz = mat4.create();
function modificarMatrizUniforme() {
    gl.uniformMatrix4fv(programaShader.pMatrizUniforme, false, pMatriz);
    gl.uniformMatrix4fv(programaShader.mvMatrizUniforme, false, mvMatriz);
}


function dibujarscenes(traslate,rotacion,auxrotacion,escala,figura, Color){
    mat4.identity(mvMatriz);
    mat4.translate(mvMatriz, traslate);
    mat4.rotate(mvMatriz, rotacion, auxrotacion);
    mat4.scale(mvMatriz, escala);
    gl.bindBuffer(gl.ARRAY_BUFFER, figura);
    gl.vertexAttribPointer(programaShader.atribPosVertice, figura.itemTam, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, Color);
    gl.vertexAttribPointer(programaShader.vertColorAtributo, Color.itemTam, gl.FLOAT, false, 0, 0);
    modificarMatrizUniforme();
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, figura.numItems);
    return figura;
}
    

function dibujarEscena() {
    gl.viewport(0, 0, gl.puertoVistaAncho, gl.puertoVistaAlto);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    mat4.perspective(45, gl.puertoVistaAncho / gl.puertoVistaAlto, 0.1, 100.0, pMatriz);
    dibujarscenes( [0.0, 1.05, -5.0],[Math.PI],[0, 0, 0],[0.5, 0.5, 1.0],triangulo,trianguloColor);
    dibujarscenes( [0.0, 1.05, -5.0],[Math.PI],[0, 0, 0],[0.5, 0.5, 1.0],triangulo2,triangulo2Color);
    dibujarscenes( [0.0, 1.05, -5.0],[Math.PI],[0, 0, 0],[0.5, 0.5, 1.0],triangulo3,triangulo3Color);
    dibujarscenes( [0.0, 1.05, -5.0],[Math.PI],[0, 0, 0],[0.5, 0.5, 1.0],triangulo4,triangulo4Color);
 
}
function webGLEjecutar() {
    var canvas = document.getElementById("leccion01-canvas");
    iniciarGL(canvas);
    iniciarShaders();
    iniciarBuffers();
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    dibujarEscena();
}
