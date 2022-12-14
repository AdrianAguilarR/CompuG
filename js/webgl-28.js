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
function iniciarShader() {
	var fragShader = conseguirShader(gl, "shader-fs");
	var vertShader = conseguirShader(gl, "shader-vs");
	progShader = gl.createProgram();
	gl.attachShader(progShader, vertShader);
	gl.attachShader(progShader, fragShader);
	gl.linkProgram(progShader);
	if (!gl.getProgramParameter(progShader, gl.LINK_STATUS)) {
		alert("Could not initialise shaders");
	}
	gl.useProgram(progShader);
	progShader.verticePosicionAtributo = gl.getAttribLocation(progShader, "aVerticePosicion");
    gl.enableVertexAttribArray(progShader.verticePosicionAtributo);
	progShader.texturaCoordAtributo = gl.getAttribLocation(progShader, "aTexturaCoord");
    gl.enableVertexAttribArray(progShader.texturaCoordAtributo);
	progShader.verticeNormalAtributo = gl.getAttribLocation(progShader, "aVerticeNormal");
    gl.enableVertexAttribArray(progShader.verticeNormalAtributo);
	progShader.pMatrizUniforme = gl.getUniformLocation(progShader, "uPMatriz");
    progShader.mvMatrizUniforme = gl.getUniformLocation(progShader, "uMVMatriz");
    progShader.nMatrizUniforme = gl.getUniformLocation(progShader, "uNMatriz");
    progShader.muestraUniforme = gl.getUniformLocation(progShader, "uMuestra");
    progShader.usarLuzUniforme = gl.getUniformLocation(progShader, "uUsarLuz");
    progShader.ambienteColorUniforme = gl.getUniformLocation(progShader, "uAmbienteColor");
    progShader.luzDireccionUniforme = gl.getUniformLocation(progShader, "uLuzDireccion");
    progShader.direccionalColorUniforme = gl.getUniformLocation(progShader, "uDirectionalColor");
}
function cargarManijaTextura(pTexture) {
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.bindTexture(gl.TEXTURE_2D, pTexture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, pTexture.imagen);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);
}
var texturaLuna;
function iniciarTextura() {
	texturaLuna = gl.createTexture();
	texturaLuna.imagen = new Image();
	texturaLuna.imagen.onload = function () {
		cargarManijaTextura(texturaLuna)
	}
	texturaLuna.imagen.src = "img/moon.gif";
}
var mvMatriz = mat4.create();
var mvPilaMatriz = [];
var pMatriz = mat4.create();
function mvApilarMatriz() {
	var copiar = mat4.create();
	mat4.set(mvMatriz, copiar);
	mvPilaMatriz.push(copiar);
}
function mvDesapilarMatriz() {
	if (mvPilaMatriz.length == 0) {
		throw "Desapilar matriz invalido!";
	}
	mvMatriz = mvPilaMatriz.pop();
}
function modificarMatrizUniforme() {
	gl.uniformMatrix4fv(progShader.pMatrizUniforme, false, pMatriz);
    gl.uniformMatrix4fv(progShader.mvMatrizUniforme, false, mvMatriz);
	var normalMatriz = mat3.create();
	mat4.toInverseMat3(mvMatriz, normalMatriz);
    mat3.transpose(normalMatriz);
    gl.uniformMatrix3fv(progShader.nMatrizUniforme, false, normalMatriz);
}
function sexRad(pAngulo) {
	return pAngulo * Math.PI / 180;
}
/* Mantenemos una matriz para almacenar el estado de la rotaci??n actual de la luna, rotacionLunaMatriz.
Cuando el usuario arrastra el rat??n, se obtiene una secuencia de eventos que se producen al mover el rat??n,
y en cada uno de ellos tenemos que calcular cu??ntos grados de rotaci??n sobre X e Y actuales se ha producido,
mediante la cantidad de arrastre que se haya hecho. A continuaci??n, calculamos una matriz temporal que
representa las dos ??ltimas rotaciones, y multiplicamos el moonRotationMatrix por ella (ojo, el orden con el
que se multiplican dos matrices importa, primero hay que poner la matriz con la nueva rotaci??n, y despu??s,
la matriz por la que multiplicar; el tercer par??metro sirve para decir d??nde guardar el resultado,
pues si utilizamos el multiplicador de dos par??metros, por defecto se guarda el resultado en el primero de ellos).
Y as??, tenemos este c??digo:*/
var ratonAbajo = false;
var ultimoRatonX = null;
var ultimoRatonY = null;
var rotacionLunaMatriz = mat4.create();
mat4.identity(rotacionLunaMatriz);
function resolverRatonAbajo(event) {
	ratonAbajo = true;
	ultimoRatonX = event.clientX;
	ultimoRatonY = event.clientY;
}
function resolverRatonArriba(event) {
	ratonAbajo = false;
}
function resolverRatonMover(event) {
	if (!ratonAbajo) { return; }
	var nuevoX = event.clientX;
	var nuevoY = event.clientY;
	var deltaX = nuevoX - ultimoRatonX
    var nuevaRotacionMatriz = mat4.create();
    mat4.identity(nuevaRotacionMatriz);
    mat4.rotate(nuevaRotacionMatriz, sexRad(deltaX / 10), [0, 1, 0]);
	var deltaY = nuevoY - ultimoRatonY;
    mat4.rotate(nuevaRotacionMatriz, sexRad(deltaY / 10), [1, 0, 0]);
	mat4.multiply(nuevaRotacionMatriz, rotacionLunaMatriz, rotacionLunaMatriz);
	/* almacenando la rotaci??n actual de la luna en una matriz rotacionLunaMatriz,
	matriz que comienza como matriz de identidad y que luego, cuando el usuario
	pinche y arrastre sobre la luna, ir?? reflejando dichas manipulaciones.
	Por lo tanto, antes de dibujar la luna, tenemos que aplicar la matriz de
	rotaciones a la matriz modelo-vista, lo cu??l se realiza como una multiplicaci??n con mat4.multiply*/
	ultimoRatonX = nuevoX
    ultimoRatonY = nuevoY;
}
/* la funci??n iniciarMemoria, tiene tres funciones que controlan los eventos de rat??n.
Empecemos por ver cuidadosamente lo que estamos intentando hacer.
Queremos que el espectador de la escena pueda ser capaz de girar sobre la luna pinchando sobre alguna parte del canvas y arrastrando.
Ingenuamente podr??amos pensar que ??sto podr??amos hacerlo parecido a como lo hicimos con la caja, es decir,
con tres variables que representan los giros sobre los ejes X, Y y Z, ajustando cada uno de ellos seg??n el movimiento del rat??n.
Por ejemplo, si lo arrastramos hacia arriba o hacia abajo, ajustar??amos la rotaci??n sobre X, y si es de lado a lado,
sobre la variable que controle el eje Y. El problema de hacer las cosas de esta forma es que cuando est??s rotando un objeto sobre varios ejes,
y haces despu??s varias rotaciones m??s, el orden con el que hay que realizar los giros para obtener un buen resultado es muy importante.
Digamos que el espectador gira la luna 90?? sobre el eje Y, y a continuaci??n, arrastra el rat??n de arriba a abajo. Si hacemos girar la luna
sobre su eje X, como parece l??gico, lo que se conseguir?? es que la luna gire alrededor de lo que ahora es el eje Z
(ya que la primera rotaci??n tambi??n afect?? a los ejes).
Y el resultado ser?? muy extra??o. El problema, empeora m??s cuando el espectador gira en dos ejes a la vez, por ejemplo,
10?? sobre el eje X y 23?? sobre el eje Y???  Se podr??a programar algo como ???dado el stado actual de rotaci??n, si el usuario arrastra hacia abajo,
ajusta los tres valores de la rotaci??n adecuadamente??? una vez por cada giro que se haga en cada eje. Pero una forma m??s sencilla de manejar
??ste problema ser??a mantener alg??n tipo de registro de cada giro que el espectador ha aplicado en la luna, para luego repetirlos cada vez quees dibujada.
??sto puede parecer una manera a??n m??s costosa de realizar los giros, a no ser que recordemos que ya tenemos una forma perfecta de representar
multitud de transformaciones (rotaciones, en este caso) secuenciales sobre objetos geom??tricos en el espacio en una sola operaci??n: Usar una matriz.*/
var verticeLunaPosicion;
var verticeLunaNormal;
var verticeLunaCoordTextura;
var verticeLunaIndex;
function iniciarMemoria() {
	var bandaLatitud = 30;
    var bandaLongitud = 30;
    var radio = 2;
	var verticePosicionDato = [];
	var normalDato = [];
    var texturaCoordDato = [];
    for (var ultimoNumero=0; ultimoNumero <= bandaLatitud; ultimoNumero++) {
		var theta = ultimoNumero * Math.PI / bandaLatitud;
        var senoTheta = Math.sin(theta);
        var cosenoTheta = Math.cos(theta);
		for (var numeroLargo=0; numeroLargo <= bandaLongitud; numeroLargo++) {
			var phi = numeroLargo * 2 * Math.PI / bandaLongitud;
			var senoPhi = Math.sin(phi);
			var cosenoPhi = Math.cos(phi);
			var x = cosenoPhi * senoTheta;
			var y = cosenoTheta;
			var z = senoPhi * senoTheta;
			var u = 1 - (numeroLargo / bandaLongitud);
			var v = 1 - (ultimoNumero / bandaLatitud);
			normalDato.push(x);
			normalDato.push(y);
			normalDato.push(z);
            texturaCoordDato.push(u);
            texturaCoordDato.push(v);
            verticePosicionDato.push(radio * x);
            verticePosicionDato.push(radio * y);
            verticePosicionDato.push(radio * z);
		}
	}
	/* Recorremos todos los segmentos latitudinales, donde en cada uno de ellos obtenemos
	los segmentos longitudinales, y generamos las normales, las coordenadas de la textura,
	y las posiciones de los v??rtices. La ??nica rareza es que los bucles terminan cuando el
	??ndice es mayor que el n??mero de l??neas longitudinales o latitudinales, es decir,
	usamos ???<=??? en vez de ???<???. ??sto lo hemos hecho as?? para que la ??ltima colecci??n de v??rtices
	superponga  a los de la primera, cerrando as?? la esfera al completo.*/
	var datoIndex = [];
    for (var ultimoNumero=0; ultimoNumero < bandaLatitud; ultimoNumero++) {
		for (var numeroLargo=0; numeroLargo < bandaLongitud; numeroLargo++) {
			var primero = (ultimoNumero * (bandaLongitud + 1)) + numeroLargo;
            var segundo = primero + bandaLongitud + 1;
            datoIndex.push(primero);
            datoIndex.push(segundo);
            datoIndex.push(primero + 1);
			datoIndex.push(segundo);
            datoIndex.push(segundo + 1);
            datoIndex.push(primero + 1);
		}
	}
	/*Ahora que tenemos los v??rtices, y la informaci??n asociada a cada uno de ellos,
	nos falta unirlas de alguna forma para dibujar los tri??ngulos, y ??sto lo hac??amos usando un
	??ndice de elemento, que contendr?? secuencias de seis valores que representan un cuadrado
	expresado mediante un par de tri??ngulos.*/
	verticeLunaNormal = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, verticeLunaNormal);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalDato), gl.STATIC_DRAW);
    verticeLunaNormal.tamanioItem = 3;
    verticeLunaNormal.numeroItem = normalDato.length / 3;
	verticeLunaCoordTextura = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, verticeLunaCoordTextura);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texturaCoordDato), gl.STATIC_DRAW);
    verticeLunaCoordTextura.tamanioItem = 2;
    verticeLunaCoordTextura.numeroItem = texturaCoordDato.length / 2;
	verticeLunaPosicion = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, verticeLunaPosicion);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verticePosicionDato), gl.STATIC_DRAW);
    verticeLunaPosicion.tamanioItem = 3;
    verticeLunaPosicion.numeroItem = verticePosicionDato.length / 3;
	verticeLunaIndex = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, verticeLunaIndex);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(datoIndex), gl.STATIC_DRAW);
    verticeLunaIndex.tamanioItem = 1;
    verticeLunaIndex.numeroItem = datoIndex.length;
}
function dibujarEscena() {
	gl.viewport(0, 0, gl.vistaAncho, gl.vistaAlto);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	mat4.perspective(45, gl.vistaAncho / gl.vistaAlto, 0.1, 100.0, pMatriz);
	var iluminacion = document.getElementById("iluminacion").checked;
	gl.uniform1i(progShader.usarLuzUniforme, iluminacion);
    if (iluminacion) {
		gl.uniform3f(
			progShader.ambienteColorUniforme,
            parseFloat(document.getElementById("ambienteR").value),
            parseFloat(document.getElementById("ambienteG").value),
            parseFloat(document.getElementById("ambienteB").value));
		var luzDireccion = [
			parseFloat(document.getElementById("direccionLuzX").value),
            parseFloat(document.getElementById("direccionLuzY").value),
            parseFloat(document.getElementById("direccionLuzZ").value)];
		var adjustedLD = vec3.create();
        vec3.normalize(luzDireccion, adjustedLD);
        vec3.scale(adjustedLD, -1);
        gl.uniform3fv(progShader.luzDireccionUniforme, adjustedLD);
		gl.uniform3f(
			progShader.direccionalColorUniforme,
            parseFloat(document.getElementById("direccionR").value),
            parseFloat(document.getElementById("direccionG").value),
            parseFloat(document.getElementById("direccionB").value));
	}
	mat4.identity(mvMatriz);
	mat4.translate(mvMatriz, [0, 0, -6]);
	mat4.multiply(mvMatriz, rotacionLunaMatriz);
	gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texturaLuna);
    gl.uniform1i(progShader.muestraUniforme, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, verticeLunaPosicion);
    gl.vertexAttribPointer(progShader.verticePosicionAtributo, verticeLunaPosicion.tamanioItem, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, verticeLunaCoordTextura);
    gl.vertexAttribPointer(progShader.texturaCoordAtributo, verticeLunaCoordTextura.tamanioItem, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, verticeLunaNormal);
    gl.vertexAttribPointer(progShader.verticeNormalAtributo, verticeLunaNormal.tamanioItem, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, verticeLunaIndex);
    modificarMatrizUniforme();
	gl.drawElements(gl.TRIANGLES, verticeLunaIndex.numeroItem, gl.UNSIGNED_SHORT, 0);
	/* ??c??mo podemos crear la posici??n de cada v??rtice de una esfera para poder dibujarla mediante tri??ngulos?
	??C??mo podemos asignarle las coordenadas de la textura a cada v??rtice con los valores correctos para que toda la esfera
	se pinte con una sola textura cuadrada que cubra todas sus caras?
	??C??mo definimos los vectores normales? De todo esto se encarga la funci??n iniciarMemoria.*/
}
function momento() {
	requestAnimFrame(momento);
	dibujarEscena();
}
function ejecutarWebGL() {
	var canvas = document.getElementById("leccion08-esfera");
	iniciarGL(canvas);
    iniciarShader();
    iniciarMemoria();
    iniciarTextura();
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
	/* detectar??n los eventos de rat??n, y llamar??n a funciones nuestras, que har??n que la luna gire sobre su centro.
	F??jate de que el evento de presionar el bot??n derecho del rat??n se controla s??lo dentro del canvas, pero cuando
	se suelta o cuando se mueve el puntero del rat??n lo detectamos para toda la superficie de la p??gina web.
	??sto quiere decir que podremos orbitar sobre la luna si pinchamos dentro del canvas, pero podremos girarla
	arrastrando el rat??n incluso hasta fuera del canvas. */
	canvas.onmousedown = resolverRatonAbajo;
    document.onmouseup = resolverRatonArriba;
    document.onmousemove = resolverRatonMover;
	momento();
}