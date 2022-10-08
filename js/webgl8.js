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
    //... 1. Definimos Shaders para el color
    programaShader.vertColorAtributo = gl.getAttribLocation(programaShader, "aVerticeColor");
    gl.enableVertexAttribArray(programaShader.vertColorAtributo);
    //... Fin de Shaders para el color
    programaShader.pMatrizUniforme = gl.getUniformLocation(programaShader, "uPMatriz");
    programaShader.mvMatrizUniforme = gl.getUniformLocation(programaShader, "umvMatriz");
}
// funcion pára triangulo
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
//funcion para cuadrado
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
//... 2. variable para color
var triangulo, trianguloColor;
var cuadrado,cuadradoColor;
function iniciarBuffers() {
    //... construyendo triangulo
   triangulo= puntosTriangulo(
     [0.0, 1.0, 0.0,
      -1.0, -1.0, 0.0, 
      1.0, -1.0, 0.0]);
   triangulo1= puntosTriangulo(
     [ 0.0, 1.0, 0.0,
       1.0,-1.0, 0.0, 
      -1.0,-1.0, 0.0]);
    //... 3. Color para el triangulo
    trianguloColor=colorTriangulo([1.0, 0.0, 0.0, 1.0]);
    triangulo1Color=colorTriangulo([0.0, 1.0, 0.0, 1.0]);
    //... Fin color
    
    //... construyendo cuadrado
   cuadrado= puntosCuadrado(
           [2.0, 2.0, 0.0, 
           -2.0, 2.0, 0.0,
            2.0,-2.0, 0.0, 
           -2.0,-2.0, 0.0]);
   cuadrado2= puntosCuadrado(
           [1.0, 1.0, 0.0, 
           -1.0, 1.0, 0.0,
            1.0,-1.0, 0.0, 
           -1.0,-1.0, 0.0]);
    //... 3. Color para el cudrado
    cuadradoColor=colorCuadrado([0.0, 0.0, 1.0, 1.0]);
    cuadrado2Color=colorCuadrado([1.0, 1.0, 0.0, 1.0]);
    //... Fin color
  
}
/*var mvMatriz = mat4.create();
var mvMatrixPila =[]; //nuevo
var pMatriz = mat4.create();
function mvApilarMatrix(){
    var copiar = mat4.create();
    mat4.set(mvMatrix, copiar);
     mvmvMatrixPilar, copiar);
    
    
}*/
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
    gl.drawArrays(gl.TRIANGLES, 0, figura.numItems);
    return figura;
}
function dibujarcuadrado(traslate,rotacion,auxrotacion,escala,figura, Color){
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
    
var rotarTriangulo =0,rotarCuadrado=0,trasladar=-2.0;
var trasladart=-2, reducir=1.0;

function dibujarEscena() {
    gl.viewport(0, 0, gl.puertoVistaAncho, gl.puertoVistaAlto);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    mat4.perspective(45, gl.puertoVistaAncho / gl.puertoVistaAlto, 0.1, 100.0, pMatriz);
   
    dibujarscenes([trasladart, trasladar, -7.0],rotarTriangulo*Math.PI/180,[0,0 ,0],[0.5,0.5, 0.5],triangulo,trianguloColor);
    dibujarscenes([-2.0, 0.5, -7.0],rotarTriangulo*Math.PI/180,[0, 1, 0],[0.5, 0.5, 1.0],triangulo1,triangulo1Color);
    
    //dibujarcuadrado([ trasladar,0.5, -7.0],rotarCuadrado*Math.PI/180, [0, 1, 0],[0.5, 0.5, 0.5], cuadrado,cuadradoColor);    
   // dibujarcuadrado([0.0, -1.0, -7.0],rotarCuadrado*Math.PI/180, [0, 1, 0],[0.5, 0.5, 1.0], cuadrado2,cuadrado2Color);
      
}
var ultimoTiempo = 0;
function animacion(){
    var tiempoAhora = new Date().getTime();
    if(ultimoTiempo != 0){
        var lapso= tiempoAhora - ultimoTiempo;
        rotarTriangulo += (90* lapso) / 1000.0;
        trasladar += (0.5*lapso) / 1000.0;
        trasladart += (0.5*lapso) / 1000.0;
        reducir += (0.5*lapso) / 1000.0;
      
    }
    if(rotarTriangulo >=360)
        rotarTriangulo =0;
    
        if(trasladar>=0 )
        trasladar = 0;
        if(trasladart>=2 )
        trasladart = 2;
       if(reducir>=1 )
        reducir = -1;
     
    ultimoTiempo = tiempoAhora;   
}

function mover(){
    dibujarEscena();
    animacion();
    
    requestAnimFrame(mover);
}
function webGLEjecutar() {
    var canvas = document.getElementById("leccion02-movimiento");
    iniciarGL(canvas);
    iniciarShaders();
    iniciarBuffers();
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    //dibujarEscena();
    mover();
}