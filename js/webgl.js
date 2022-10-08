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
/* mvMatriz, que contendrá la matriz modelo-vista, y pMatriz, será la matriz de
 * proyección (inicialmente llenas de ceros). Necesitábamos una matriz donde
 * guardar los resultados de las translaciones y rotaciones, también necesitamos
 * otra matriz que maneje el proceso de hacer más grandes o pequeñas los objetos
 * del espacio según la perspectiva, eso es lo que hace la matriz de proyección.
 * modificarMatrizUniforme, mueve las matrices de modelo-vista y proyección de
 * javascript a webGL, y tambien las funciones de uso de shaders.*/
var mvMatriz = mat4.create();
var pMatriz = mat4.create();
function modificarMatrizUniforme() {
    gl.uniformMatrix4fv(programaShader.pMatrizUniforme, false, pMatriz);
    gl.uniformMatrix4fv(programaShader.mvMatrizUniforme, false, mvMatriz);
}
function dibujarEscena() {
    gl.viewport(0, 0, gl.puertoVistaAncho, gl.puertoVistaAlto);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    /* Montamos la perspectiva (punto de vista), con la que queremos ver la escena
     * (por defecto, webGL dibuja las cosas que están cerca del mismo tamaño que
     * las que están lejos: estilo 3D de perspectiva llamado proyección ortográfica,
     * basada en la proyección ortogonal). Con el fin de hacer que las cosas que
     * estén más lejos se vean más pequeñas que las que tenemos cerca. En esta
     * escena tenemos un campo de visión vertical con un ángulo de 45º, la relación
     * que hay entre la anchura y la altura del lienzo, que no queremos ver las
     * cosas que hay a menos de 0,1 unidades del punto de vista, ni tampoco las
     * que estén a más de 100. Esta forma de definir la perspectiva usa una función
     * llamado mat4, e implica usar una variable llamada pMatriz.*/
    mat4.perspective(45, gl.puertoVistaAncho / gl.puertoVistaAlto, 0.1, 100.0, pMatriz);
    /* mat4.identity prepara una matriz identidad para poder empezar a realizar
     * multiplicaciones de translación y rotación sobre ella, y nos traslada a un
     * punto de origen desde el cual nos podemos empezar a mover para dibujar el
     * mundo 3D. webGL no tiene programadas librería de movimiento en su lugar,
     * utilizaremos una biblioteca glMatrix, hecha por Brandon Jones.*/
    mat4.identity(mvMatriz);
    /* mat4.translate, estando al centro de nuestro espacio 3D com mvMatriz con
     * la matriz identidad, se inicia el triángulo moviéndonos 1.5 unidades a la
     * izquierda (x negativo), y alejándonos 7 unidades de la escena (z negativo),
     * esto hace la multiplicación de translación a la matriz de modelo-vista con
     * los parámetros.*/
    mat4.translate(mvMatriz, [-1.5, 0.0, -7.0]);
    /* gl.bindbuffer, seleccionando el buffer que contiene los vértices del
     * triángulo, trianguloPosVertBuffer, y a continuación diciéndole a webGL los
     * valores que se deben de utilizar para las posiciones de los vértices,
     * haciendo uso del itemTam que definimos antes.*/
    gl.bindBuffer(gl.ARRAY_BUFFER, trianguloPosVertBuffer);
    gl.vertexAttribPointer(programaShader.atribPosVertice, trianguloPosVertBuffer.itemTam, gl.FLOAT, false, 0, 0);
    /* modificarMatrizUniforme, le dice a webGL que almacene en la memoria de la
     * tarjeta gráfica nuestra matriz modelo-vista actual y también la matriz de
     * proyección (se vera más adelante). Necesario hacerlo ya que las
     * transformaciones de la matrices no vienen programadas en webGL (la matriz
     * con el resultado de las traslaciones esta en el ámbito privado de javascript).
     * setMatrixUniform, copia esas matrices en la tarjeta gráfica. Una vez hecho
     * esto, webGL tendrá en memoria una lista de números que representan las
     * posiciones de los vértices actual del triángulo.*/
    modificarMatrizUniforme();
    /* El siguiente paso es dibujar los vértices como triángulos, empezando con
     * el elemento 0 del array y siguiendo con los siguientes numItems elementos.*/
    gl.drawArrays(gl.TRIANGLES, 0, trianguloPosVertBuffer.numItems);
}
/* getShader, lo único que hace es buscar en el árbol DOM de nuestra página HTML
 * algún elemento que tenga la ID especificada como parámetro de la función, extraer
 * todo su contenido (creación de un fragmento o el sombreado de los vértices),
 * y pasarle el código a webGL para que lo compile y pueda ejecutarse en la tarjeta
 * gráfica. Después, el código controla cualquier posible y error, y acaba. Como
 * alternativa, podríamos crear el código como un string (cadena de caracteres),
 * en vez de utilizar un elemento HTML y perder el tiempo buscándolo y tomando su
 * contenido, pero de esta forma se hace mucho más fácil de leer y modificar, ya
 * que aparentan ser trozos de código javascript, pero ojo, no lo son.*/
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
}/* iniciarShaders, contiene la funcion getShader quien obtiene dos objetos,
 * fragmentoShader, y otro verticeShader, que luego los une para obtener
 * programaShader y es un trozo de código que reside en el lado webGL del sistema;
 * puedes verlo como una forma de especificar que algo debe funcionar en la tarjeta
 * gráfica. Cada programa debe enlazar con un vértice shader y un fragmento shader.
 * ¿Qué es un shader? Bueno, en algún momento de la historia de la informática
 * gráfica en 3D, alguien necesitó de funciones que calcula en el color y las
 * sombras de los objetos de la escena, antes de empezar a dibujarlos. Con el tiempo,
 * los shaders han ido creciendo en utilidades, y actualmente podríamos decir que
 * son una porción de código que puede modificar todos y cada uno de los bits
 * finales de una escena, antes de dibujarla. Y ésto es realmente útil, porque
 * además de que se ejecuta en la tarjeta gráfica (muy rápido), el tipo de
 * transformaciones que puede realizar son verdaderamente útiles, incluso en un
 * ejemplo tan pequeño e insignificante como el que tenemos entre manos. La razón
 * por la que vamos a utilizar shaders en lo que pretende ser un sencillo ejemplo
 * de introducción a webGL, es que se encargarán de que el sistema webGL aplique
 * nuestras matrices modelo-vista y de proyección a nuestra escena con la rapidísima
 * GPU y la memoria de la tarjeta gráfica, evitando que sea la CPU la que tenga
 * que estar calculando en comparación con un lento javascript.*/
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
    /* Configurado el programa shader, y unido a él los shaders, ahora necesita
     * que le asociemos una referencia a uno atributo, llamado atribPosVertice,
     * que permite inventarnos nuevos atributos en cualquier momento. Lo hacemos
     * así porque es conveniente tener esos dos valores en el mismo objeto
     * (programa shader) para usarlos más fácilmente. Pero… ¿Qué es un
     * atribPosVertice?
     * Se utilizaba en el código que establecía los vértices del triángulo al
     * buffer adecuado */
    programaShader.atribPosVertice = gl.getAttribLocation(programaShader, "aPosVertice");
    /* gl.enableVertexAttribArray, le dice a webGL que queremos proporcionarle
     * valores al atributo usando una lista.*/
    gl.enableVertexAttribArray(programaShader.atribPosVertice);
    /* Lo último que hacemos en iniciarShaders es recuperar dos valores más del
     * programa shader: Las localizaciones de dos cosas llamadas matrices uniformes.
     * De momento sólo hay que saber que las guardamos en el objeto programa por
     * comodidad, aprovechándonos de que en javascript se pueden crear variables… */
    programaShader.pMatrizUniforme = gl.getUniformLocation(programaShader, "uPMatriz");
    programaShader.mvMatrizUniforme = gl.getUniformLocation(programaShader, "umvMatriz");
}
/* Declaramos la variable global donde mantener los buffers (En una página real
 * nunca se utilizará una variable para cada objeto de la escena, porque sería
 * impensable manejar individualmente cada buffer de objeto cuando se tienen
 * decenas o cientos), para que sea más fácil entender cómo se usan.*/
var trianguloPosVertBuffer;
function iniciarBuffers() {
    /* Creamos un buffer donde almacenar las posiciones de los vértices del triángulo
     * (los vértices son puntos en un espacio 3D), que definen la forma del objeto
     * a dibujar. Este buffer se guardará en la memoria de la tarjeta gráfica, y
     * cuando queramos dibujar la escena, esencialmente sólo necesitamos decir a
     * webGL que dibuje todo lo que te tienes en la memoria y pintar cada objeto
     * decenas de veces en un segundo para dar la sensación de movimiento.
     * Y cuando se trate de modelos enormes con decenas de miles de vértices, esta
     * tecnica será una enorme ventaja en rendimiento de la memoria*/
    trianguloPosVertBuffer = gl.createBuffer();
    /* gl.bindBuffer. indica que cualquier operación posterior que actúe sobre
     * buffers deberá de aplicarse sobre el buffer que le acabamos de indicar
     * (apuntador implícito al buffer actual sobre el que ejecutar los métodos),
     * así se obtiene un mejor rendimiento.*/
    gl.bindBuffer(gl.ARRAY_BUFFER, trianguloPosVertBuffer);
    /* Definimos las posiciones de los vértices del triangulo isósceles con el
     * centro en (0,0,0).*/
    var vertices = [
        0.0, 1.0, 0.0,
        -1.0, -1.0, 0.0,
        1.0, -1.0, 0.0];
    /* Creamos un objeto del tipo Float32Array basado en nuestra lista de vértices,
     * y le decimos a webGL que la use para rellenar el buffer actual, que por
     * supuesto será nuestro triangleVerticePosicionBuffer, es una forma de convertir
     * una lista (tabla, matriz, array, arreglo) de javascript en una estructura
     * de datos compatible con webGL para que llene los buffers.*/
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    /* Aunque el objeto buffer no tenía previamente definidos los atributos itemTam
     * y numItems, los tiene para decir que los 9 elementos (números) del buffer
     * actualmente representan tres vértices (numItems), y cada uno de ellos está
     * formado por 3 números (itemSize).*/
    trianguloPosVertBuffer.itemTam = 3;
    trianguloPosVertBuffer.numItems = 3;
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