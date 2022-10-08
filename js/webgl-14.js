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
function puntosPoligono(pPuntos, pArista){
    var pol = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pol);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pPuntos), gl.STATIC_DRAW);
    pol.itemTam = 3;
    pol.numItems = pArista;
    return pol;
}
function colorPoligono(pColor, pVertice, pArista){
    var polC = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, polC);
    var color= [];
    for (var i= 0 in pColor){
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
var tri1, tri1C;
var cua1, cua1C;
function iniciarBuffers() {
    //... puntos de la piramide
    tri1= puntosPoligono([// frente
	  0.0,  1.0,  0.0,
	  -1.0, -1.0,  1.0,
	  1.0, -1.0,  1.0,
	  // cara derecha
	  0.0,  1.0,  0.0,
	  1.0, -1.0,  1.0,
	  1.0, -1.0, -1.0,
	  // cara atras
	  0.0,  1.0,  0.0,
	  1.0, -1.0, -1.0,
	  -1.0, -1.0, -1.0,
	  // cara izquierda
	  0.0,  1.0,  0.0,
	  -1.0, -1.0, -1.0,
	  -1.0, -1.0,  1.0,
          // frente inferior
          0.0,  -3.0,  0.0,
	  -1.0, -1.0,  1.0,
	  1.0, -1.0,  1.0,
          // cara derecha inferior
	  0.0, -3.0,  0.0,
	  1.0, -1.0,  1.0,
	  1.0, -1.0, -1.0,
          // cara atras inferior
	  0.0,  -3.0,  0.0,
	  1.0, -1.0, -1.0,
	  -1.0, -1.0, -1.0,
	  // cara izquierda inferior
	  0.0,  -3.0,  0.0,
	  -1.0, -1.0, -1.0,
	  -1.0, -1.0,  1.0,],24);
      
    //... Color del triangulo
    tri1C= colorPoligono([
        [1.0, 0.0, 0.0, 1.0], // frente
        [0.0, 1.0, 0.0, 1.0], // cara atras
        [0.0, 0.0, 1.0, 1.0], // cara derecha
        [1.0, 0.0, 1.0, 1.0], // cara izquierda
        [0.0, 0.0, 1.0, 1.0], // frente inferior
        [1.0, 0.0, 1.0, 1.0], // cara atras inferior
        [1.0, 0.0, 0.0, 1.0], // cara derecha inferior
        [0.0, 1.0, 0.0, 1.0], // cara izquierda inferior
       
    ], 3, 24);
    //... puntos del cubo
    cua1= puntosPoligono([// frente
	  -1.0, -1.0,  1.0,
	  1.0, -1.0,  1.0,
	  1.0,  1.0,  1.0,
	  -1.0,  1.0,  1.0,
	  // cara atras
	  -1.0, -1.0, -1.0,
	  -1.0,  1.0, -1.0,
	  1.0,  1.0, -1.0,
	  1.0, -1.0, -1.0,
	  // cara superior
	  -1.0,  1.0, -1.0,
	  -1.0,  1.0,  1.0,
	  1.0,  1.0,  1.0,
	  1.0,  1.0, -1.0,
	  // cara inferior
	  -1.0, -1.0, -1.0,
	  1.0, -1.0, -1.0,
	  1.0, -1.0,  1.0,
	  -1.0, -1.0,  1.0,
	  // cara derecha
	  1.0, -1.0, -1.0,
	  1.0,  1.0, -1.0,
	  1.0,  1.0,  1.0,
	  1.0, -1.0,  1.0,
	  // cara izquierda
	  -1.0, -1.0, -1.0,
	  -1.0, -1.0,  1.0,
	  -1.0,  1.0,  1.0,
	  -1.0,  1.0, -1.0], 24);
    //... Color del cuadrado
    cua1C= colorPoligono([
        [1.0, 0.0, 0.0, 1.0], // frente
        [1.0, 1.0, 0.0, 1.0], // cara atras
        [0.0, 1.0, 0.0, 1.0], // cara superior
        [1.0, 0.5, 0.5, 1.0], // cara inferior
        [1.0, 0.0, 1.0, 1.0], // cara derecha
        [0.0, 0.0, 1.0, 1.0] // cara izquierda
    ], 4, 24);
}
var mvMatriz = mat4.create();
var pMatriz = mat4.create();
function modificarMatrizUniforme() {
    gl.uniformMatrix4fv(programaShader.pMatrizUniforme, false, pMatriz);
    gl.uniformMatrix4fv(programaShader.mvMatrizUniforme, false, mvMatriz);
}
function triangulo(pTriangulo, pTrianguloC, pTraslacion, pAngulo, pEjeRotacion, pEscala){
    mat4.identity(mvMatriz);
    mat4.translate(mvMatriz, pTraslacion);
    mat4.rotate(mvMatriz, pAngulo, pEjeRotacion);
    mat4.scale(mvMatriz, pEscala);
    gl.bindBuffer(gl.ARRAY_BUFFER, pTriangulo);
    gl.vertexAttribPointer(programaShader.atribPosVertice, pTriangulo.itemTam, gl.FLOAT, false, 0, 0);
    //... Aplicando color
    gl.bindBuffer(gl.ARRAY_BUFFER, pTrianguloC);
    gl.vertexAttribPointer(programaShader.vertColorAtributo, pTrianguloC.itemTam, gl.FLOAT, false, 0, 0);
    //... Fin aplicando color
    modificarMatrizUniforme();
    gl.drawArrays(gl.TRIANGLES, 0, pTriangulo.numItems);
}
function poligono(pPoligono, pPoligonoC, pTraslacion, pAngulo, pEjeRotacion, pEscala){
    mat4.identity(mvMatriz);
    mat4.translate(mvMatriz, pTraslacion);
    mat4.rotate(mvMatriz, pAngulo, pEjeRotacion);
    mat4.scale(mvMatriz, pEscala);
    gl.bindBuffer(gl.ARRAY_BUFFER, pPoligono);
    gl.vertexAttribPointer(programaShader.atribPosVertice, pPoligono.itemTam, gl.FLOAT, false, 0, 0);
    //... Aplicando color
    gl.bindBuffer(gl.ARRAY_BUFFER, pPoligonoC);
    gl.vertexAttribPointer(programaShader.vertColorAtributo, pPoligonoC.itemTam, gl.FLOAT, false, 0, 0);
    //... Fin aplicando color
    modificarMatrizUniforme();
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, pPoligono.numItems);
}
var rotarTri = 0, rotarCua= 0, escalaCua= 0.1;
function dibujarEscena() {
    gl.viewport(0, 0, gl.puertoVistaAncho, gl.puertoVistaAlto);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    mat4.perspective(45, gl.puertoVistaAncho / gl.puertoVistaAlto, 0.1, 100.0, pMatriz);
    //... dibujando el triangulo
    //triangulo(tri1, tri1C, [0.0, 1.0, -10.0], rotarTri*Math.PI/90, [0, 1, 0], [1.0, 1.0, 1.0]);
    //... dibujando el cuadrado
    poligono(cua1, cua1C, [0.0, -1.0, -10.0], rotarCua*Math.PI/180, [0.0, 1.0, 0.0], [1.0, 1.0, 1.0]);
}
var ultimoTiempo= 0, signo= 1;
function animacion() {
    var tiempoAhora = new Date().getTime();
    if (ultimoTiempo != 0) {
        var lapso = tiempoAhora - ultimoTiempo;
        rotarTri += (50 * lapso) / 1000.0;
        rotarCua += (150 * lapso) / 1000.0;
        escalaCua += signo*(0.5 * lapso) / 1000.0;
    }
    if(rotarTri>=360)
        rotarTri= 0;
    if(rotarCua>=360)
        rotarCua= 0;
    if(escalaCua>=1.0 || escalaCua<=0.1){
        signo= signo*(-1);
    }
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