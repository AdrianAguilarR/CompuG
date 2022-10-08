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

var mvMatriz = mat4.create();
var pMatriz = mat4.create();
function modificarMatrizUniforme() {
    gl.uniformMatrix4fv(programaShader.pMatrizUniforme, false, pMatriz);
    gl.uniformMatrix4fv(programaShader.mvMatrizUniforme, false, mvMatriz);
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
    
    programaShader.pMatrizUniforme = gl.getUniformLocation(programaShader, "uPMatriz");
    programaShader.mvMatrizUniforme = gl.getUniformLocation(programaShader, "umvMatriz");
}

var cuadradoPosVertBuffer;
function iniciarBuffers() {

    cuadradoPosVertBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, cuadradoPosVertBuffer);

    var vertices = [
        -1.0, 3.-1, -10.-1,
        0.0, 0.0, 1.0,
        1.0, 0.0, -5.0,
        0.0, -1.0, 0.0,
        1.0, -1.0, 0.0];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

   cuadradoPosVertBuffer.itemTam = 3;
    cuadradoPosVertBuffer.numItems = 5;
}
function dibujarEscena() {
    gl.viewport(0, 0, gl.puertoVistaAncho, gl.puertoVistaAlto);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mat4.perspective(45, gl.puertoVistaAncho / gl.puertoVistaAlto, 0.1, 100.0, pMatriz);

    mat4.identity(mvMatriz);

    mat4.translate(mvMatriz, [-1.5, 0.0, -7.0]);

    gl.bindBuffer(gl.ARRAY_BUFFER, cuadradoPosVertBuffer);
    gl.vertexAttribPointer(programaShader.atribPosVertice, cuadradoPosVertBuffer.itemTam, gl.FLOAT, false, 0, 0);
   
    modificarMatrizUniforme();
    
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, cuadradoPosVertBuffer.numItems);
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
       /*
         * 1.0, 1.0, 0.0,
        -1.0, 1.0, 0.0,
         1.0, -1.0, 0.0,  Cuadrado
        -1.0, -1.0, 0.0
         */
        
        /*
         *     var vertices = [
         0.0, 1.0, 0.0,
        -1.0, -1.0, 0.0, Triangulo
         1.0, -1.0, 0.0,
       
        ];
         */