var gl;
function iniciarGL(canvas) {
	try {
		gl = canvas.getContext("webgl");
		gl.verAnchoVentana = canvas.width;
		gl.verAltoVentana = canvas.height;
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
function iniciarShader() {
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
	progShader.vertPosAtributo = gl.getAttribLocation(progShader, "aVertPosicion");
	gl.enableVertexAttribArray(progShader.vertPosAtributo);
	progShader.textCoordAtributo = gl.getAttribLocation(progShader, "aTexturaCoord");
	gl.enableVertexAttribArray(progShader.textCoordAtributo);
	progShader.pMatrizUniform = gl.getUniformLocation(progShader, "uPMatriz");
	progShader.mvMatrizUniform = gl.getUniformLocation(progShader, "uMVMatriz");
	progShader.muestraUniform = gl.getUniformLocation(progShader, "uMuestra");
	progShader.colorUniform = gl.getUniformLocation(progShader, "uColor");
 }
function cargarManijaTextura(pTextura) {
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.bindTexture(gl.TEXTURE_2D, pTextura);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, pTextura.imagen);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.bindTexture(gl.TEXTURE_2D, null);
}
var aTextura;
function cargarManija(pDireccion){
	var textura = gl.createTexture();
	textura.imagen = new Image();
	textura.imagen.onload = function () {
		cargarManijaTextura(textura);
	};
	textura.imagen.src = pDireccion;
	return textura;
}
function iniciarTextura(pDireccion) {
	aTextura= cargarManija(pDireccion);
}
var mvMatriz = mat4.create();
var pMatriz = mat4.create();
function modificarMatrizUniforme() {
	gl.uniformMatrix4fv(progShader.pMatrizUniform, false, pMatriz);
	gl.uniformMatrix4fv(progShader.mvMatrizUniform, false, mvMatriz);
}
function sexRad(pAngulo) {
	return pAngulo * Math.PI / 180;
}
var keyPrecionado = {};
function keyDesactivo(event) {
	keyPrecionado[event.keyCode] = true;
}
function keyActivo(event) {
	keyPrecionado[event.keyCode] = false;
}
var zoom = -15;
var inclinacionX = 90;
var girarZ = 0;
function manejoKey() {
	if (keyPrecionado[33]) {
		zoom -= 0.1; // Page Up
	}
	if (keyPrecionado[34]) {
		zoom += 0.1; // Page Down
	}
	if (keyPrecionado[38]) {
		inclinacionX += 2; // Up cursor key
	}
	if (keyPrecionado[40]) {
		inclinacionX -= 2; // Down cursor key
	}
}
/* Se establece las posiciones de los vértices que forman el cuadrado, y la posición de la
textura que debe aplicarse a ese cuadrado, y en el initTexture y handleLoadedTexture lo único
que hacemos es cambiarle nombre de la textura que utilizamos. */
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
function coordenadaTextura(pCoord, pNumT){
	var polT = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, polT);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pCoord), gl.STATIC_DRAW);
    polT.itemTam = 2;
    polT.numItems = pNumT;
	return polT;
}
var aPtoEstrella, aCoordTextura;
function iniciarBuffer() {
	aPtoEstrella= puntosPoligono([-1, -1, 0, 1, -1, 0, -1, 1, 0, 1, 1, 0], 4);
	aCoordTextura= coordenadaTextura([0, 0, 1, 0, 0, 1, 1, 1], 4);
}
/* Estaremos dibujar Estrella que es una parte de dibujarEscena, debido a que para su pintado
necesitamos el contro respectivo*/
function dibujarImagen(pTextura, pCoordTextura, pPtoEstrella) {
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, pTextura);
	gl.uniform1i(progShader.muestraUniform, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, pCoordTextura);
	gl.vertexAttribPointer(progShader.textCoordAtributo, pCoordTextura.itemTam, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, pPtoEstrella);
	gl.vertexAttribPointer(progShader.vertPosAtributo, pPtoEstrella.itemTam, gl.FLOAT, false, 0, 0);
	modificarMatrizUniforme();
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, pPtoEstrella.numItems);
}
/* Se inicializa todas las variables que tiene el objeto estrella, éstas son el ángulo de giro
actual de la estrella, que comienza en cero, y los parámetros que le pasábamos en initWorldObjects.
Además, estamos llamando a un método del objeto Star, que se encarga de iniciar el color que tendrá
esa estrella. */
function estrella(pDistancia, pVelocidadR) {
	this.aAngulo = 0;
	this.aDistancia = pDistancia;
	this.aVelocidadR = pVelocidadR;
	// Modificar el color con valores en ejecucion
	this.colorAleatorio();
}
/* Recogemos los parámetros que le pasamos en la función drawScene; para dar inicio mete en la pila la
matriz de modelo-vista actual, para poder volver a un estado anterior antes de que otras funciones
dibujen en la escena para que no sufra efectos secundarios (ya visto en el ejemplos anteriores).
Usando la palabra reservada prototype, crearemos los métodos de nuestro objeto Star. Todos los objetos
que creemos con un new Star, tendrán también definidos estos métodos.
El prototipo sólo prepara los bufferes con las características únicas que distingue cada estrella.
El código que las pinta, es el mismo para todas, como una función global, drawStar, que pinta un cuadrado
en el que aplicará la textura. */
var mvMatrizPila = [];
function mvApilarMatriz() {
	var copiar = mat4.create();
	mat4.set(mvMatriz, copiar);
	mvMatrizPila.push(copiar);
}
function mvDesapilarMatriz() {
	if (mvMatrizPila.length == 0) {
		throw "Invalid popMatriz!";
	}
	mvMatriz = mvMatrizPila.pop();
}
estrella.prototype.draw = function (pInclinacionX, pGirarZ, pCentella) {
	mvApilarMatriz();
	//... Movemos la estrella a una posicion
	
	mat4.rotate(mvMatriz, sexRad(this.aAngulo), [0.0, 1.0, 0.0]);
	mat4.translate(mvMatriz, [this.aDistancia, 0.0, 0.0]);
	/* Nos situamos sobre la posición donde se debe dibujar la estrella rotando toda la escena cierto ángulo
	y moviéndonos cierta distancia del centro. */
	// Rotate back so that the star is facing the viewer
	
	mat4.rotate(mvMatriz, sexRad(-this.aAngulo), [0.0, 1.0, 0.0]);
	mat4.rotate(mvMatriz, sexRad(-pInclinacionX), [1.0, 0.0, 0.0]);
	/* Estas líneas cambian el ángulo con el que vemos la escena, una textura pintada sobre un cubo no tiene
	anchura esto quiere decir que  sólo pueden ser vistas de frente o parcialmente inclinadas, pero si las
	viésemos de perfil, sólo veríamos una línea. Este código se encarga de hacer que la textura siempre esté
	mirando de frente a la cámara, por ello, hay que deshacer todo los giros que hemos hecho, incluído aquél
	que hacíamos en drawScene, y en un exacto orden inverso, pero ojo, SIN MOVERNOS de la posición donde estamos. */
	if (pCentella) {
		// Draw a non-rotating star in the alternate "twinkling" color
		gl.uniform3f(progShader.colorUniform, this.aBrilloRojo, this.aBrilloVerde, this.aBrilloAzul);
		dibujarImagen(aTextura, aCoordTextura, aPtoEstrella);
		/* Si el brillo (centella) está activo. Para dibujar la estrella primero rotamos sobre el eje Z la cantidad
		indicada, es decir, para girar sobre su propio centro. A continuación, le pasamos al shader un color con el
		dibujar la textura en una variable uniforme, y finalmente llamamos a una función global llamada drawStar.
		¿Y qué hay del brillo? Bueno, la estrella tiene dos colores asociados con ella. Su color normal, que es el
		que acabamos de ver, y su color de brillo. Éste lo simularemos dibujando una estrella (que no gira), con un
		color diferente. Luego dibujamos la otra estrella justo encima, y las mezclamos usando el blending.
		Además,haciendo que los rayos de la primera estrella se queden fijos, mientras los de la segunda estrella van
		girando, se consigue un bonito efecto.
		Y para acabar, restauramos el estado anterior de la matriz de modelo-vista que hay en nuestra pila. */
	}
	// All estrellas girarZ around the Z axis at the same rate
	
	mat4.rotate(mvMatriz, sexRad(pGirarZ), [0.0, 0.0, 1.0]);
	// Draw the star in its main color
	gl.uniform3f(progShader.colorUniform, this.aRojo, this.aVerde, this.aAzul);
	dibujarImagen(aTextura, aCoordTextura, aPtoEstrella);
	mvDesapilarMatriz();
};
/* En lugar de actualizar la escena con un valor constante, cuya velocidad real de animación dependerá de la velocidad de
ejecución de la máquina donde corra este código, usaremos la técnica del ritmo constante (tiempo delta), con lo que las
máquinas rápidas conseguirán una animación suave, y las más lentas, si bien tendrán una animación más a trompicones, al
menos la verán moverse a la misma velocidad. Ahora, creo que la velocidad angular y la velocidad con la que orbitan las
estrellas alrededor del centro de la escena fueron cuidadosamente calculadas por NeHe para que produjeran una bonita
animación a 60 frames por segundo, valor que ponemos en una variable global fuera de la función para que no tenga que
calcularse en cada llamada.
Por lo tanto, con este valor ajustaremos el ángulo de la estrella, es decir, el valor para su nueva posición en la órbita
alrededor del centro de la escena. */
var efectoFPMS = 60 / 1000;
estrella.prototype.animacionP = function (pLapsoTiempo) {
	this.aAngulo += this.aVelocidadR * efectoFPMS * pLapsoTiempo;
	/* También hay que disminuir ligeramente la distancia que tiene del centro de la escena, para dar el efecto en espiral.
	Pero si una estrella alcanza el centro, debe volver a colocarse en el extremo más alejado, volviéndole a cambiar el color. */
	this.aDistancia -= 0.01 * efectoFPMS * pLapsoTiempo;
	if (this.aDistancia < 0.0) {
		this.aDistancia += 5.0;
		this.colorAleatorio();
	}
};
/* El último método de nuestro prototipo de estrella es el que vimos en el constructor, que se encargará de elegir un color al
azar para el color normal de la estrella y para el color de su brillo */
estrella.prototype.colorAleatorio = function () {
	// Dar a la estrella un color aleatorio
	// Circunstacia...
	this.aRojo = Math.random();
	this.aVerde = Math.random();
	this.aAzul = Math.random();
	//... Requerimos tambien un color para el brillo de la estrella cuando esta en ejecucion
	this.aBrilloRojo = Math.random();
	this.aBrilloVerde = Math.random();
	this.aBrilloAzul = Math.random();
};
/* Sólo es un bucle que introducirá 50 estrellas en una lista (modificar el código añadiendo o quitando estrellas).
Cada estrella necesita dos parámetros para crearse correctamente. El primero indica la distancia que habrá entre el
centro de la escena y el centro de esa estrella, y el segundo es la velocidad con la que orbitará alrededor de ese centro. */
var estrellas = [];
function iniciarMundoObjeto() {
	var numEstrella = 50;
	for (var i=0; i < numEstrella; i++) {
		estrellas.push(new estrella((i / numEstrella) * 5.0, i / numEstrella));
	}
}
function dibujarEscena() {
	gl.viewport(0, 0, gl.verAnchoVentana, gl.verAltoVentana);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	mat4.perspective(45, gl.verAnchoVentana / gl.verAltoVentana, 0.1, 100.0, pMatriz);
	/* Pintar un objeto en pantalla, a una función dentro del propio objeto. Por lo tanto, drawScenes ahora se encarga
	de preparar de forma general el canvas, y llamará a la función de pintado de cada objeto de la escena con un bucle
	similar al anterior */
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
	gl.enable(gl.BLEND);
	/* Activamos el blending, esta técnica permitirá a los objetos brillar a través de otros. Así podremos hacer que
	las partes negras de la imagen de la textura se dibujen como si fueran totalmente transparentes, quiere decir que
	cuando estemos dibujando las estrellas que componen nuestra escena, los bits de negro serán transparentes */
	mat4.identity(mvMatriz);
	mat4.translate(mvMatriz, [0.0, 0.0, zoom]);
	
	mat4.rotate(mvMatriz, sexRad(inclinacionX), [1.0, 0.0, 0.0]);
	/* El modelo-vista con la matriz de identidad, nos movemos al centro dependiendo de la Z actual (zoom, que puede
	variar si usamos las teclas, como ya vimos) y la posibilidad de rotar toda la escena en el eje X (manejada también
	por teclado, en la variable inclinacionX). Ahora sólo nos queda comprobar el brillo seleccionado */
	var centella = document.getElementById("centella").checked;
	/* Iteramos sobre la lista de estrellas para decirle a cada una que se dibuje a sí misma, pasándole la inclinación
	actual de la escena y el booleano que indica si usar o no el brillo. También le pasamos un valor de giro, girarZ,
	para que las estrellas giren sobre sus propios centros al mismo tiempo que orbitan alrededor del centro de la escena. */
	for (var i in estrellas) {
		estrellas[i].draw(inclinacionX, girarZ, centella);
		girarZ += 0.1;
	}
}
var finTiempo = 0;
function animacion() {
	var tiempoActual = new Date().getTime();
	if (finTiempo != 0) {
		var lapso = tiempoActual - finTiempo;
		for (var i in estrellas) {
			/* Usado para actualizar las variables globales que representaban algunos cambios en la escena, ahora en lugar
			de actualizar las variables, lo que vamos a hacer es usar un sencillo bucle que recorra todos los objetos de la
			escena (dentro de la lista estrellas) y que ejecute sobre cada uno de ellos su propia función de animado
			(programación orientada a objetos) */
			estrellas[i].animacionP(lapso);
		}
	}
	finTiempo = tiempoActual;
}
function momento() {
	manejoKey();
	dibujarEscena();
	animacion();
	requestAnimFrame(momento);
}
function iniciarWebGL() {
	var canvas = document.getElementById("leccion06-brillo");
	iniciarGL(canvas);
	iniciarShader();
	iniciarBuffer();
	iniciarTextura("img/estrella.gif");
	/* initWorldObjects. Esta función crea objetos javascript para representar la escena (en las lecciones anteriores
	solíamos iniciar el buffer de profundidad) */
	iniciarMundoObjeto();
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	/* gl.enable(gl.DEPTH_TEST);
	La técnica blending y el buffer de profundidad no se llevan bien juntos, y como vamos a volver a aplicar blending,
	y sabiendo que por defecto, el uso del buffer de profundidad está desactivado, simplemente la borramos */
	document.onkeydown = keyDesactivo;
	document.onkeyup = keyActivo;
	momento();
}