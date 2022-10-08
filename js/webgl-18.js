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
function colorPoligono(pColor, pVertice){
    var polC = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, polC);
    color= [];
    for (var i= 0; i<pVertice; i++){
        color= color.concat(pColor);
    }
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(color), gl.STATIC_DRAW);
    polC.itemTam = 4;
    polC.numItems = pVertice;
    return polC;
}
function colorPoligono3D(pColor, pVertice, pArista){
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
//... esta funcion es exclusivo para 3D
function indexPoligono(pIndex, pNumI){
    var polI = gl.createBuffer(); //... nuevo
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, polI);
    //... triangulamos cada cara del poligono
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(pIndex), gl.STATIC_DRAW);
    polI.itemTam = 1;
    polI.numItems = pNumI;
    return polI;
}
var pen1, pen1C, pen2, pen2C;
var lPen1, lPen1C, lPen1I;
function iniciarBuffers() {
    //... puntos del pentagono
    pen1= puntosPoligono([0.0, 1.0, 0.5, -0.9511, 0.309, 0.5, 0.9511, 0.309, 0.5, -0.5878, -0.809, 0.5, 0.5878, -0.809, 0.5], 5);
    pen2= puntosPoligono([0.0, 1.0, -0.5, -0.9511, 0.309, -0.5, 0.9511, 0.309, -0.5, -0.5878, -0.809, -0.5, 0.5878, -0.809, -0.5], 5);
    //... lados del pentadono para generar el 3D
    lPen1= puntosPoligono([0.0, 1.0, 0.5, -0.9511, 0.309, 0.5, -0.9511, 0.309, -0.5, 0.0, 1.0, -0.5, // cara1
        -0.9511, 0.309, 0.5, -0.5878, -0.809, 0.5, -0.5878, -0.809, -0.5, -0.9511, 0.309, -0.5, // cara 2
        -0.5878, -0.809, 0.5, 0.5878, -0.809, 0.5, 0.5878, -0.809, -0.5, -0.5878, -0.809, -0.5, // cara 3
        0.5878, -0.809, 0.5, 0.9511, 0.309, 0.5, 0.9511, 0.309, -0.5, 0.5878, -0.809, -0.5, // cara 4
        0.9511, 0.309, 0.5, 0.0, 1.0, 0.5, 0.0, 1.0, -0.5, 0.9511, 0.309, -0.5], 20);
    //... Color del pentagono
    pen1C= colorPoligono([1.0, 0.0, 0.0, 1.0], 5);
    pen2C= colorPoligono([0.0, 1.0, 0.0, 1.0], 5);
    //... Color lados del pentagono
    lPen1C= colorPoligono3D([[0.0, 0.0, 1.0, 1.0], // cara 1
        [1.0, 1.0, 0.0, 1.0], // cara 2
        [1.0, 0.0, 1.0, 1.0], // cara 3
        [0.0, 1.0, 1.0, 1.0], // cara 4
        [1.0, 1.0, 1.0, 1.0]], 4, 20);
    lPen1I= indexPoligono([
        0, 1, 2,     0, 2, 3,    // cara 1
        4, 5, 6,     4, 6, 7,    // cara 2
        8, 9, 10,    8, 10, 11,  // cara 3
        12, 13, 14,  12, 14, 15, // cara 4
        16, 17, 18,  16, 18, 19], 30);
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
function poligono3D(pPoligono, pPoligonoC, pPoligonoI, pTraslacion, pAngulo, pEjeRotacion, pEscala){
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
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, pPoligonoI);
    modificarMatrizUniforme();
    //... cambiado
    gl.drawElements(gl.TRIANGLES, pPoligonoI.numItems, gl.UNSIGNED_SHORT, 0);
}
/* rotarX y rotarYte deberían ser familiares (rotarZ desaparece).
 * Ellas representan la rotación actual del pentagono en los ejes X e Y.
 * velX y velY permitirán al usuario variar la velocidad de la rotación del cubo
 * usando los cursores del teclado (las flechas).
 * Es decir, determinarán la velocidad de cambio de las variables rotarX y rotarY.
 * Además, con las teclas de RePag y AvPag (retroceder y avanzar página) haremos
 * que la coordenada Z del cubo cambie, es decir, hacer que el cubo se aleje o se
 * acerque. Señalo de que es el cubo el que se mueve, no la cámara (como en los
 * videojuegos 3D). Para ello usamos la variable z.
 * Finalmente, enbudo contendrá un entero dentro del rango [0,2], incluídos los
 * extremos (por eso uso corchetes en vez de paréntesis),  que indicará cuál de
 * los 3 filtros se utilizará para renderizar la textura del cubo. */
var rotarX= 0, rotarY= 0, velX= 0, velY= 0, coordZ= -5, enbudo= 0;
function dibujarEscena() {
    gl.viewport(0, 0, gl.puertoVistaAncho, gl.puertoVistaAlto);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    mat4.perspective(45, gl.puertoVistaAncho / gl.puertoVistaAlto, 0.1, 100.0, pMatriz);
    //... dibujando pentagono
    poligono(pen1, pen1C, [0.0, 0.0, coordZ], rotarX*Math.PI/180, [1.0, 0.0, 0.0], [1.0, 1.0, 1.0]);
    poligono(pen2, pen2C, [0.0, 0.0, coordZ], rotarX*Math.PI/180, [1.0, 0.0, 0.0], [1.0, 1.0, 1.0]);
    poligono3D(lPen1, lPen1C, lPen1I, [0.0, 0.0, coordZ], rotarX*Math.PI/180, [1.0, 0.0, 0.0], [1.0, 1.0, 1.0]);
}
/* Mantener un diccionario (o array asociativo) llamado actualKeyPrecionado de las
 * teclas pulsadas en un momento dado, poniéndolas a TRUE. Si la tecla pulsada es
 * la F, además actualiza la variable del tipo de filtrado a utilizar de entre las
 * 3 disponibles, secuencialmente. Cuando se suelta, pone la tecla a FALSE.
 * Vale la pena tomarse un tiempo en explicar por qué manejamos los eventos de
 * teclado de dos formas diferentes. En un juego 3D de ordenador o consola, las
 * dos formas más comunes de manejar las pulsaciones son:
 * Las que ejecutan una acción inmediata. Por ejemplo, disparar una pistola.
 * Incluso si se pulsan repetidamente, podría fijarse algun tipo de tasa de acciones
 * (en este caso disparos) por segundo.
 * Las que tienen un efecto dependiendo del tiempo que se tiene pulsada la tecla.
 * Por ejemplo, cuando se presiona la tecla de caminar hacia adelante, se espera
 * seguir avanzando mientras se mantiene pulsada.
 * Es importante destacar que, con el segundo tipo, se tiene que seguir manteniendo
 * la posibilidad de pulsar otras teclas, mientras la acción continúa ejecutándose,
 * por ejemplo, correr hacia adelante, saltar un obstáculo, y seguir corriendo.
 * Ésto produce situaciones totalmente diferentes a la lectura normal de teclado
 * como hacen los editores de texto, que cuando mantiene una A pulsada, se
 * concatenan un montón de aes, pero cuando se pulsa y se suelta la b (sin soltar
 * la a), la cadena de aes se interrumpe, y se escribe una b. El equivalente es
 * que una vez que saltas el obstáculo, te quedarías quieto, lo cuál sería extremadamente
 * irritante para el jugador.
 * Por lo tanto, en el código hacemos que la F siga el primer tipo de manejar las
 * pulsaciones, y con el diccionario de teclas pulsadas estamos cubriendo el segundo
 * tipo. Nótese que en el diccionario se guardarán las pulsaciones de todas las
 * teclas, aunque después sólo utilicemos unas pocas.
 * El diccionario será usado en una sola función, manejoKeys, que será llamada en
 * la función momento */
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
/* Esta función comprueba cuáles teclas han sido pulsadas, y realiza las operaciones
 * asociadas a ellas, como son el gestionar las velocidades de rotación vertical
 * y horizontal del cubo, y su posición en el eje Z. */
function manejoKeys() {
    if (keyPrecionado[33]) {
        coordZ-= 0.05; // Page Up
    }
    if (keyPrecionado[34]) {
        coordZ+= 0.05; // Page Down
    }
    if (keyPrecionado[37]) {
        velY-= 1; // Left cursor key
    }
    if (keyPrecionado[39]) {
        velY+= 1; // Right cursor key
    }
    if (keyPrecionado[38]) {
        velX-= 1; // Up cursor key
    }
    if (keyPrecionado[40]) {
        velX+= 1; // Down cursor key
    }
}
var ultimoTiempo= 0;
function animacion() {
    var tiempoAhora = new Date().getTime();
    if (ultimoTiempo != 0) {
        var lapso = tiempoAhora - ultimoTiempo;
        rotarX += (velX * lapso) / 1000.0;
        rotarY += (velY * lapso) / 1000.0;
    }
    ultimoTiempo = tiempoAhora;
}
//... Esta funcion se renombro por la circuntancia del evento
function momento(){
    requestAnimFrame(momento);
    manejoKeys();
    dibujarEscena();
    animacion();
}
function webGLEjecutar() {
    var canvas = document.getElementById("leccion03-control");
    iniciarGL(canvas);
    iniciarShaders();
    iniciarBuffers();
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    //... Para detectar las pulsaciones (presiona tecla y suelta)
    document.onkeydown = manejoKeyAbajo;
    document.onkeyup = manejoKeyArriba;
    //... Esta funcion se renombro por la circuntancia del evento
    momento();
}