var gl;
function iniciarGL(canvas) {
	try {
		gl = canvas.getContext("webgl");
		gl.vistaAncho = canvas.width;
		gl.vistaAlto = canvas.height;
	} catch (e) { }
	if (!gl) { alert("Perdone, no se pudo inicializar WebGL"); }
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
		alert("Perdone, no pudo inicializarse el Shaders");
	}
	gl.useProgram(progShader);
	progShader.vertPosAtributo = gl.getAttribLocation(progShader, "aVertPos");
	gl.enableVertexAttribArray(progShader.vertPosAtributo);
	progShader.textCoordAtributo = gl.getAttribLocation(progShader, "aTextCoord");
	gl.enableVertexAttribArray(progShader.textCoordAtributo);
	progShader.pMatrizUniform = gl.getUniformLocation(progShader, "uPMatriz");
	progShader.mvMatrizUniform = gl.getUniformLocation(progShader, "uMVMatriz");
	progShader.muestraUniform = gl.getUniformLocation(progShader, "uMuestra");
}
function cargarManijaTextura(pTextura) {
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.bindTexture(gl.TEXTURE_2D, pTextura);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, pTextura.imagen);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.bindTexture(gl.TEXTURE_2D, null);
}
var mudTextura;
function iniciarTextura() {
	mudTextura = gl.createTexture();
	mudTextura.imagen = new Image();
	mudTextura.imagen.onload = function () {
		cargarManijaTextura(mudTextura)
	}
	mudTextura.imagen.src = "img/pared.gif";
}
var mvMatriz = mat4.create();
var mvMatrizPila = [];
var pMatriz = mat4.create();
function mvApilarMatriz() {
	var copia = mat4.create();
	mat4.set(mvMatriz, copia);
	mvMatrizPila.push(copia);
}
function mvDesapilarMatriz() {
	if (mvMatrizPila.length == 0) {
		throw "Invalido el desapilar Matriz!";
	}
	mvMatriz = mvMatrizPila.pop();
}
function modificarMatrizUniform() {
	gl.uniformMatrix4fv(progShader.pMatrizUniform, false, pMatriz);
	gl.uniformMatrix4fv(progShader.mvMatrizUniform, false, mvMatriz);
}
function sexRad(pAngulo) {
	return pAngulo * Math.PI / 180;
}
var manejoKey = {};
function keyDesactivo(evento) {
	manejoKey[evento.keyCode] = true;
}
function keyActivo(evento) {
	manejoKey[evento.keyCode] = false;
}
var vistaHorizonte = 0;
var vistaHorizonteVelocidad = 0;
var vistaVertical = 0;
var vistaVerticalVelocidad = 0;
var xPos = 0;
var yPos = 0.4;
var zPos = 0;
var velocidad = 0;
/* Gestionar los eventos de teclado para actualizar nuestras variables de posici??n de la c??mara,
incluyendo la simulaci??n del peque??o balanceo arriba-bajo al andar, y la utilizacion de la t??cnica
del tiempo delta para que todas las m??quinas que ejecuten nuestra aplicaci??n muevan la c??mara a la
misma velocidad (con esto conseguimos que un ordenador potente consiga una animaci??n fluida, pero
no mas r??pida). La forma de utilizar el tiempo delta es hacer que nuestra funci??n controlKey detecte
si est??n pulsadas ciertas teclas, y actualice unas variables que representan la tasa de movimiento,
velocidad o giro que debe hacer la c??mara en un instante dado, cuyo valor ser?? cero en caso de que
no se haya pulsado la tecla correspondiente */
function controlKeys() {
	if (manejoKey[33]) { // Page Up
		vistaHorizonteVelocidad = 0.1;
	} else if (manejoKey[34]) { // Page Down
		vistaHorizonteVelocidad = -0.1;
	} else {
		vistaHorizonteVelocidad = 0;
	}
	if (manejoKey[37] || manejoKey[65]) { // Key del cursor izquierdo o A
		vistaVerticalVelocidad = 0.1;
	} else if (manejoKey[39] || manejoKey[68]) { // Key del cursor derecho o D
		vistaVerticalVelocidad = -0.1;
	} else {
		vistaVerticalVelocidad = 0;
	}
	if (manejoKey[38] || manejoKey[87]) { // Key del cursor arriba o W
		velocidad = 0.003;
	} else if (manejoKey[40] || manejoKey[83]) { // Key del cursor abajo o S
		velocidad = -0.003;
	} else {
		velocidad = 0;
	}
	/* Si pulsamos el cursor izquierda, o la tecla a, estamos definiendo una tasa de velocidad de
	0.1 grados/milisegundo, o lo que es lo mismo, 100??/s; en otras palabras, dar??amos una vuelta
	completa sobre nosotros mismos si mantenemos pulsado la tecla 3.6 segundos. */
}
/* La funci??n recibe el contenido del fichero en una cadena de texto (muy larga, conocida como string).
Para almacenar la informaci??n, usaremos dos listas globales: una para las posiciones de los v??rtices y
otra para las coordenadas de la texturas. La forma del mapa en el fichero de texto contiene una lista de
tri??ngulos, cada uno especificado en tres lineas seguidas, una por v??rtice, y cada l??nea est?? compuesta
por cinco valores. Los tres primeros corresponden a la posici??n del v??rtice del tri??ngulo, en las
coordenadas X, Y y Z, y los dos ??ltimos, son los valores S y T de la coordenada de la textura.
El fichero tambi??n incluye l??neas con comentarios ( // ) y l??neas en blanco, para dar un formato al fichero
m??s amigable, que debemos ignorar. Por ??ltimo, pero situado al principio del fichero, tenemos una l??nea que
indica el n??mero de tri??ngulos que se han definido (??til en otros ejemplos y ya no utilizado ahora)*/
var mundoVertPosBuffer = null;
var mundoVertTextCoordBuffer = null;
/* ??Este no es un buen formato de fichero para crear mundos 3D, omite un mont??n de informaci??n para
escenas reales: vectores normales para la iluminaci??n, o la posibilidad de usar diferentes texturas para
diferentes caras de los objetos.
Podr??amos haber usado un formato JSON para facilitar la lectura del fichero con una librer??a que ya viene
con javascript, pero por el momento utilicemos este formato troceable para clasificar la informaci??n */
function cargarManijaMundo(dato) {
	/* Partimos la cadena por el caracter retorno de carro (fin de l??nea), con lo que obtenemos una lista
	de las l??neas del fichero. Por cada l??nea, usamos expresiones regulares para eliminar todos los espacion
	en blanco que pueda tener al principio, y la troceamos por cada espacio en blanco (o espacios en blanco
	seguidos) que hallan entre medias, obteniendo as?? una lista. Si la lista comienza con los caracteres que
	hemos dicho que corresponden a los comentarios, o dicha lista no contiene exactamente 5 valores (los que
	se definen para cada v??rtice) la ignoramos. Cuando tenemos una l??nea v??lida, utilizamos los valores de la
	lista para llenar los b??feres. Si todo marcha bien, obtenemos dos b??feres vertexPosition y vertexTextureCoords
	llenados correctamente, y una variable vertexCount que contiene, como su nombre indica, el n??mero de v??rtices le??dos. */
	var linea = dato.split("\n");
	var contarVert = 0;
	var vertPos = [];
	var vertTextCoord = [];
	for (var i in linea) {
		var vals = linea[i].replace(/^\s+/, "").split(/\s+/);
		if (vals.length == 5 && vals[0] != "//") {
			// It is a line describing a vertex; get X, Y and Z first
			vertPos.push(parseFloat(vals[0]));
			vertPos.push(parseFloat(vals[1]));
			vertPos.push(parseFloat(vals[2]));
			// And then the texture coords
			vertTextCoord.push(parseFloat(vals[3]));
			vertTextCoord.push(parseFloat(vals[4]));
			contarVert += 1;
		}
	}
	/* Creamos los b??feres webGL que utilizar?? la tarjeta gr??fica para pintar el mundo con las listas de
	v??rtices y coordenas de texturas que cargamos antes. */
	mundoVertPosBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, mundoVertPosBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW);
	mundoVertPosBuffer.itemCol = 3;
	mundoVertPosBuffer.numFil = contarVert;
	
	mundoVertTextCoordBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, mundoVertTextCoordBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertTextCoord), gl.STATIC_DRAW);
	mundoVertTextCoordBuffer.itemCol = 2;
	mundoVertTextCoordBuffer.numFil = contarVert;
	// Ocultamos el div con el mensaje de carga
	document.getElementById("cargarText").textContent = "";
}
/* Encargado de cargar el fichero del mapa world.txt mediante una llamada AJAX al servidor, y llamar a nuestra
funci??n cargarManijaMundo pas??ndole todo el contenido del fichero, cuando ha terminado de descargarlo. Para ello,
se crea un objeto XMLHttpRequest, que se encargar?? de todos los aspectos de la transferencia. Le decimos que haga
una solicitud HTTP GET al servidor para obtener el archivo de texto con el mapa. ??ste objeto funciona por estados.
Cuando cambia de estado, se dispara el evento onreadystatechange, dentro del cual tenemos la variable impl??cita
readyState que nos indica en qu?? estado de la descarga nos encontramos. El estado 4 quiere decir que el fichero se
ha descargado con ??xito, con lo que llamamos a nuestra funci??n pas??ndole el contenido del fichero situado en otra
variable impl??cita llamada responseText. Hay muchos otros estados, que controlan los posibles eventos y fallos que
pueden ocurrir durante la transferencia, y que en aplicaciones serias se deber??an controlar. Y por ??ltimo, iniciamos
la transferencia con la funci??n send. */
function cargarMundo() {
	var solicitud = new XMLHttpRequest();
	solicitud.open("GET", "data/world.txt");
	solicitud.onreadystatechange = function () {
		if (solicitud.readyState == 4) {
			cargarManijaMundo(solicitud.responseText);
		}
	}
	solicitud.send();
}
/* Lo primero que hacemos ahora es comprobar si el mapa ha sido cargado, es decir, si los buffers de v??rtices y texturas
han sido iniciados. Si no lo hubieran sido, abortamos el dibujado de la escena */
function dibujarEscena() {
	gl.viewport(0, 0, gl.vistaAncho, gl.vistaAlto);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	if (mundoVertTextCoordBuffer == null || mundoVertPosBuffer == null) {
		return;
	}
	// Si tenemos los buffers definidos, realizamos nuestra habitual configuraci??n de las matrices de proyecci??n y de modelo-vista
	mat4.perspective(45, gl.vistaAncho / gl.vistaAlto, 0.1, 100.0, pMatriz);
	/* Para rotar y desplazarnos en la direcci??n contraria de los valores que tenga la posici??n te??rica de la c??mara,
	y siguiendo un orden: Primero se realizan las rotaciones invertidas para pitch (vistHorizonte), y el yaw (vistaVertical),
	y luego la translaci??n. Luego webGL tomar?? esa posici??n como si fuera la (0,0,0) para empezar a pintar la escena (ojo, no
	corresponde con la (0,0,0) real donde estar?? la c??mara de webGL), con lo que hemos conseguido ese cambio de referencia de
	las coordenas sin tener que modificarlas */
	mat4.identity(mvMatriz);
	mat4.rotate(mvMatriz, sexRad(-vistaHorizonte), [1, 0, 0]);
	mat4.rotate(mvMatriz, sexRad(-vistaVertical), [0, 1, 0]);
	mat4.translate(mvMatriz, [-xPos, -yPos, -zPos]);
	/* webGL, toma la posici??n actual como si fuera la (0,0,0), con lo que estamos listos para empezar a dibujar la escena con
	los b??feres creados antes. Una diferencia es que el mapa tiene coordenadas absolutas de su posici??n en la escena, por lo
	que no es necesario girar o trasladarnos antes de empezar a pintar los tri??ngulos. Esto es ligeramente diferente a lo que
	pasaba cuando los objetos que ten??amos que pintar ten??an sus coordenadas relativas a su propio centro, lo que nos obligaba
	a antes de empezar a pintar, colocarnos en la posici??n donde ir??a el centro del objeto */
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, mudTextura);
	gl.uniform1i(progShader.muestraUniform, 0);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, mundoVertTextCoordBuffer);
	gl.vertexAttribPointer(progShader.textCoordAtributo, mundoVertTextCoordBuffer.itemCol, gl.FLOAT, false, 0, 0);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, mundoVertPosBuffer);
	gl.vertexAttribPointer(progShader.vertPosAtributo, mundoVertPosBuffer.itemCol, gl.FLOAT, false, 0, 0);
	
	modificarMatrizUniform();
	gl.drawArrays(gl.TRIANGLES, 0, mundoVertPosBuffer.numFil);
}
var ultimoTiempo = 0;
// Used to make us "jog" up and down as we move forward.
var andarAngulo = 0;
/* La ??nica variable andarAngulo, sirve para simular el balanceo de la cabeza que se produce al andar.
Hay varias formas de calcularlo, pero la m??s indicada es utilizar una onda sinusoidal para representar el valor que tiene yPos
mientras nos desplazamos. andarAngulo contiene el ??ngulo sobre el que calcular el seno para establecer yPos de la posici??n actual. */
function animar() {
	var tiempoActual = new Date().getTime();
	if (ultimoTiempo != 0) {
	var lapso = tiempoActual - ultimoTiempo;
	if (velocidad != 0) {
		xPos -= Math.sin(sexRad(vistaVertical)) * velocidad * lapso;
		zPos -= Math.cos(sexRad(vistaVertical)) * velocidad * lapso;
		andarAngulo += lapso * 0.6;
		// 0.6 "fiddle factor" - makes it feel more realistic :-)
		yPos = Math.sin(sexRad(andarAngulo)) / 20 + 0.4
	}
	// Calculamos los valores para xPos y zPos utilizando el ??ngulo yaw (vistaVertical), con el que nos estamos desplazando por la escena */
	vistaVertical += vistaVerticalVelocidad * lapso;
	vistaHorizonte += vistaHorizonteVelocidad * lapso;
	/* La posici??n y el efecto de balanceo s??lo tienen sentido si nos estamos desplazando, y no si estamos quietos o si s??lo estamos
	girando (tanto en vertical, pitch,  como en horizontal, yaw). Asi que si la tasa de velocidad no es cero, ajustamos xPos y zPos
	mediante un simple c??lculo trigonom??trico, donde adem??s usamos la tasa de movimiento (cantidad de desplazamiento en un milisegundo)
	por los milisegundos transcurridos. A continuaci??n, calculamos el nuevo ??ngulo de balanceo utilizando una tasa de 0.6, obtenida a
	base de probar valores. Por ??ltimo, calculamos la altura de la cabeca yPos seg??n el seno del ??ngulo obtenido antes, afin??ndolo un
	poco de nuevo por el m??todo de ensayo y error. Notar que la altura media de la cabeza es 0.4 unidades, y que ??ste valor se incrementar??
	o decrementar?? un poquito seg??n la funci??n seno.A continuaci??n necesitamos actualizar las variables pitch y yaw seg??n sus respectivas tasas
	de cambio, que como vimos antes, valdr??n cero si no se ha pulsado la tecla correspondiente */
	}
	// Obtenemos el tiempo actual para calcular el siguiente tiempo delta
	ultimoTiempo = tiempoActual;
}
function momento() {
	requestAnimFrame(momento);
	controlKeys();
	dibujarEscena();
	animar();
}
function ejecutarWebGL() {
	var canvas = document.getElementById("leccion07-mundo3D");
	iniciarGL(canvas);
	iniciarShaders();
	iniciarTextura();
	// Nueva funci??n que se encarga de cargar el mapa desde el servidor
	cargarMundo();
	gl.clearColor(0.0, 0.0, 1.0, 1.0);
	gl.enable(gl.DEPTH_TEST);
	document.onkeydown = keyDesactivo;
	document.onkeyup = keyActivo;
	momento();
}