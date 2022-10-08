var gl;
function iniciarGL(canvas) {
	try {
		gl = canvas.getContext("webgl");
		gl.puertoVistaAncho = canvas.width;
		gl.puertoVistaAlto = canvas.height;
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
function iniciarShaders() {
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
	progShader.atribPosVertice = gl.getAttribLocation(progShader, "aPosVertice");
	gl.enableVertexAttribArray(progShader.atribPosVertice);
	//... nuevo
	progShader.vertNormalAtributo = gl.getAttribLocation(progShader, "aVerticeNormal");
    gl.enableVertexAttribArray(progShader.vertNormalAtributo);
    progShader.textCoordAtributo = gl.getAttribLocation(progShader, "aTexturaCoord");
    gl.enableVertexAttribArray(progShader.textCoordAtributo);
    progShader.pMatrizUniforme = gl.getUniformLocation(progShader, "uPMatriz");
    progShader.mvMatrizUniforme = gl.getUniformLocation(progShader, "umvMatriz");
    progShader.nMatrizUniforme = gl.getUniformLocation(progShader, "uNMatriz");
    progShader.pruebaUniforme = gl.getUniformLocation(progShader, "uMuestra");
    progShader.usoLuzUniforme = gl.getUniformLocation(progShader, "uUsoLuz");
    progShader.ambColorUniforme = gl.getUniformLocation(progShader, "uAmbienteColor");
    progShader.luzDirUniforme = gl.getUniformLocation(progShader, "uLuzDireccion");
    progShader.dirColorUniforme = gl.getUniformLocation(progShader, "uDireccionColor");
	//... nuevo
	progShader.alphaUniform = gl.getUniformLocation(progShader, "uAlpha");
}
function cargarManijaTextura(pTextura) {
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.bindTexture(gl.TEXTURE_2D, pTextura);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, pTextura.imagen);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
	gl.bindTexture(gl.TEXTURE_2D, null);
}
function cargarManija(pDireccion){
	var textura= gl.createTexture();
	textura.imagen = new Image();
	textura.imagen.src= pDireccion;
	textura.imagen.onload = function () {
		cargarManijaTextura(textura);
	};
	return textura;
}
var aTextura= Array();
function iniciarTextura(pDireccion, pNum) {
	for(i= 0; i<pNum; i++){
		aTextura.push(cargarManija(pDireccion+".gif"));
	}
}
var mvMatriz = mat4.create();
var pMatriz = mat4.create();
function modificarMatrizUniforme() {
	gl.uniformMatrix4fv(progShader.pMatrizUniforme, false, pMatriz);
    gl.uniformMatrix4fv(progShader.mvMatrizUniforme, false, mvMatriz);
	var normalMatriz = mat3.create();
    mat4.toInverseMat3(mvMatriz, normalMatriz);
    mat3.transpose(normalMatriz);
    gl.uniformMatrix3fv(progShader.nMatrizUniforme, false, normalMatriz);
}
function sexRad(angulo) {
	return angulo * Math.PI / 180;
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
function indexPoligono(pIndex, pNumI){
    var polI = gl.createBuffer(); //... nuevo
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, polI);
    //... triangulamos cada cara del poligono
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(pIndex), gl.STATIC_DRAW);
    polI.itemTam = 1;
    polI.numItems = pNumI;
    return polI;
}
function coordenadaTextura(pCoord, pNumC){
	var polC = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, polC);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pCoord), gl.STATIC_DRAW);
    polC.itemTam = 2;
    polC.numItems = pNumC;
	return polC;
}
function coordenadaLuz(pPosL, pNumL){
	var polN = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, polN);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pPosL), gl.STATIC_DRAW);
    polN.itemTam = 3;
    polN.numItems = pNumL;
	return polN;
}
var cub= Array(), cubT, cubI, cubN= Array();
function iniciarBuffers() {
	cub.push(puntosPoligono([-1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1, 1], 4));
	cub.push(puntosPoligono([-1, -1, -1, 1, -1, -1, 1, 1, -1, -1, 1, -1], 4));
	cub.push(puntosPoligono([-1, 1, 1, 1, 1, 1, 1, 1, -1, -1 , 1, -1], 4));
	cub.push(puntosPoligono([-1, -1, 1, 1, -1, 1, 1, -1, -1, -1 , -1, -1], 4));
	cub.push(puntosPoligono([1, -1, 1, 1, -1, -1, 1, 1, -1, 1, 1, 1], 4));
	cub.push(puntosPoligono([-1, -1, 1, -1, -1, -1, -1, 1, -1, -1, 1, 1], 4));
	//... Iluminacion ambiente
	cubN.push(coordenadaLuz([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1], 4)); // Front face
	cubN.push(coordenadaLuz([0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1], 4)); // Back face
	cubN.push(coordenadaLuz([0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0], 4)); // Top face
	cubN.push(coordenadaLuz([0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0], 4)); // Bottom face
	cubN.push(coordenadaLuz([1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0], 4)); // Right face
	cubN.push(coordenadaLuz([-1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0], 4)); // Left face
	//... Fin de nuevo
	cubT= coordenadaTextura([0, 0, 1, 0, 1, 1, 0, 1], 4);
	cubI= indexPoligono([0, 1, 2,     0, 2, 3], 6);
}
function poligono3D(pPol, pPolI, pPolT, pText, pCubN, pTras, pAng1, pEje1, pAng2, pEje2, pAng3, pEje3, pEsc){
	mat4.identity(mvMatriz);
	mat4.translate(mvMatriz, pTras);
	mat4.rotate(mvMatriz, sexRad(pAng1), pEje1);
    mat4.rotate(mvMatriz, sexRad(pAng2), pEje2);
    mat4.rotate(mvMatriz, sexRad(pAng3), pEje3);
	mat4.scale(mvMatriz, pEsc);
	//... puntos
    gl.bindBuffer(gl.ARRAY_BUFFER, pPol);
    gl.vertexAttribPointer(progShader.atribPosVertice, pPol.itemTam, gl.FLOAT, false, 0, 0);
	//... nuevo: normal
	gl.bindBuffer(gl.ARRAY_BUFFER, pCubN);
    gl.vertexAttribPointer(progShader.vertNormalAtributo, pCubN.itemTam, gl.FLOAT, false, 0, 0);
    //... textura
    gl.bindBuffer(gl.ARRAY_BUFFER, pPolT);
    gl.vertexAttribPointer(progShader.textCoordAtributo, pPolT.itemTam, gl.FLOAT, false, 0, 0);
	gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, pText);
    gl.uniform1i(progShader.muestraUniform, 0);
	//NUEVO
	var transparencia = document.getElementById("transparencia").checked;
	if (transparencia) {
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
		gl.enable(gl.BLEND);
		// La técnica blending está desactivada por defecto, así que como es obvio, la tenemos que activar.
		gl.disable(gl.DEPTH_TEST);
		/* Desactivamos el buffer de profundidad para comprobar la escena. Si no lo hacemos entonces ocurrirá
		que el blending se producirá en algunos casos, y en otros no. Por ejemplo, si dibujamos una cara
		trasera de nuestro cubo que estará total o parcialmente oculta por una de las caras delanteras que
		todavía no se han dibujado, se producirá el blending, cuando webGL pinte la cara de delante. Por el
		contrario, si pintamos primero una de las caras delanteras, todas las caras traseras quedarán ocultadas
		sin blending. Ésto no es lo que queremos.
		Los lectores más perspicaces se abrán dado cuenta de que el orden con el que se pintan los objetos es
		decisivo para el blending, algo que nunca había ocurrido en nuestras lecciones anteriores. */
		gl.uniform1f(progShader.alphaUniform, parseFloat(document.getElementById("alpha").value));
		/* Cargamos el valor alfa del campo de texto correspondiente en el HTML, y mandándolo al programa shader
		relacionándolo con una variable uniforme creada expresamente para ello, como ya sabemos hacer.
		El principal motivo por el que estamos especificando el valor de alfa de transparencia a mano, es porque
		la imagen que usamos para la textura no tiene un canal alfa propio (es decir, sólo tiene el RGB, por lo
		que por defecto implícitamente tomará un 1 como valor alfa en cada pixel). Así también tenemos la
		oportunidad de poder modificar el valor alfa y ver cómo afecta a la imagen del cubo. */
	} else {
		gl.disable(gl.BLEND);
		/* Esta intrucción del sistema webGL dice qué hacer cuando se va a escribir un nuevo fragmento en el
		buffer de frame, y básicamente significa "usa el buffer de profundidad". Y así, junto con otros comandos
		de webGL que se combinarán, se utilizará la función de cálculo de profundidad. Dicha función usará un
		algoritmo por defecto, aunque podemos indicarle expresamente cuál utilizar con: gl.depthFunc(gl.LESS);
		Ésto significa "si nuestro fragmento tiene un valor Z menor (less) que el que haya en el buffer para esa
		misma posición, usa el nuevo fragmento para sustituir el viejo". Éste simple código basta para dar un
		comportamiento razonable a la escena, las cosas que están cerca ocultarán a las que están lejos.
		También se puede utilizar otro tipo de valores para el algoritmo, aunque sospecho que muy rara vez se utilizan.*/
		gl.enable(gl.DEPTH_TEST);
		/* Restaura el modo normal con uso del buffer de profundidad que ya conocemos, para en caso de que se desactive el blending */
	}
	/* Define cómo se tiene que hacer la mezcla. Primeramente, para entender mejor la explicación, definimos dos
	términos: el fragmento fuente es el fragmento que queremos dibujar ahora, y el fragmento de destino es el que
	hay en el buffer para esa posición. El primer parámetro de gl.blendFunc determina el factor fuente, y el
	segundo determinal el factor destino. Estos factores son números que se usan en la función de mezcla.
	En este caso, estamos indicando que que el factor fuente es el valor alfa del fragmento fuente, y el factor
	destino es el valor constante 1. Hay otras posibilidades, por ejemplo, si se usa un gl.SRC_COLOR para especificar
	el color fuente, trabajarás por separado con cada uno de los componentes de los colores, es decir, con el rojo,
	verde, azul y el valor alfa (indica el porcentaje de transparencia), cuyo valor inicial es el componente del color
	correspondiente del fragmento fuente.
	Imaginemos que webGL está intentando calcular el color de un fragmento, cuando el fragmento destino tiene los
	valores RGBA (Rd, Gd, Bd, Ad) y el fragmento fuente tiene (Rf, Gf, Bf, Af). Además, también tenemos los factores
	fuente (Fr, Fg, Fb, Fa) y destino (Dr, Dg, Db, Da).
	Para cada componente del color, webGL lo calculará como sigue:
	Rresultado = Rf * Fr + Rd * Dr
	Gresultado = Gf * Fg + Gd * Dg
	Bresultado = Bf * Fb + Bd * Db
	Aresultado = Af * Fa + Ad * Da
	Pero en nuestro caso, gl.RSC_ALPHA, estamos diciendo (el resto de los componentes del color es lo similar):
	Rresultado = Rf * Af + Rd
	Normalmente esto no sería la forma ideal de crear transparencias, pero funciona muy bien para este ejemplo, donde
	la iluminación se puede desactivar. Y en este punto vale la pena enfatizar que el "blending" (mezclas) no es lo
	mismo que "transparencia", el blending es simplemente una técnica que se puede utilizar para obtener efectos de
	transparencias, entre otros muchos usos. */
	var iluminacion = document.getElementById("iluminacion").checked;
    gl.uniform1i(progShader.usoLuzUniforme, iluminacion);
	if (iluminacion) { //... combinando (mezcla) transparencia con iluminacion
      gl.uniform3f(
        progShader.ambColorUniforme,
        parseFloat(document.getElementById("ambientR").value),
        parseFloat(document.getElementById("ambientG").value),
        parseFloat(document.getElementById("ambientB").value)
      );
	  //... Y ahora, lo mismo con la dirección de la luz
      var iluminacionDireccion = [
        parseFloat(document.getElementById("luzDireccionX").value),
        parseFloat(document.getElementById("luzDireccionY").value),
        parseFloat(document.getElementById("luzDireccionZ").value)
      ];
      var ajusteLD = vec3.create();
      vec3.normalize(iluminacionDireccion, ajusteLD);
	  vec3.scale(ajusteLD, -1);
      gl.uniform3fv(progShader.luzDirUniforme, ajusteLD);
      gl.uniform3f(
        progShader.dirColorUniforme,
        parseFloat(document.getElementById("direccionR").value),
        parseFloat(document.getElementById("direccionG").value),
        parseFloat(document.getElementById("direccionB").value)
      );
	}
    //... index
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, pPolI);
    modificarMatrizUniforme();
    gl.drawElements(gl.TRIANGLES, pPolI.numItems, gl.UNSIGNED_SHORT, 0);
}
var xVel= 0, yVel= 0; zVel= 0;
var keyPrecionado = {};
function manejoKeyAbajo(evento) {
	keyPrecionado[evento.keyCode] = true;
}
function manejoKeyArriba(evento) {
    keyPrecionado[evento.keyCode] = false;
}
function manejoKeys() {
    if (keyPrecionado[33]) {
        zRot+= 1; // Page Up
		if(zRot>=360)
			zRot= 0;
    }
    if (keyPrecionado[34]) {
        zRot-= 1; // Page Down
		if(zRot<=0)
			zRot= 360;
    }
    if (keyPrecionado[37]) {
        yRot-= 1; // Left cursor key
		if(yRot<=0)
			yRot= 360;
    }
    if (keyPrecionado[39]) {
        yRot+= 1; // Right cursor key
		if(yRot>=360)
			yRot= 0;
    }
    if (keyPrecionado[38]) {
        xRot-= 1; // Up cursor key
		if(xRot<=0)
			xRot= 360;
    }
    if (keyPrecionado[40]) {
        xRot+= 1; // Down cursor key
		if(xRot>=360)
			xRot= 0;
    }
}
var xRot = 0, yRot = 0, zRot = 0;
function dibujarEscena() {
	gl.viewport(0, 0, gl.puertoVistaAncho, gl.puertoVistaAlto);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    mat4.perspective(45, gl.puertoVistaAncho / gl.puertoVistaAlto, 0.1, 100.0, pMatriz);
	for(i= 0; i<6; i++)
		poligono3D(cub[i], cubI, cubT, aTextura[i], cubN[i], [0.0, 0.0, -5.0], xRot, [1, 0, 0], yRot, [0, 1, 0], zRot, [0, 0, 1], [1, 1, 1]);
}
var ultimoTiempo = 0;
function animacion() {
	var tiempoActual = new Date().getTime();
    if (ultimoTiempo != 0) {
		var periodo = tiempoActual - ultimoTiempo;
		xRot += (xVel * periodo) / 1000.0;
		yRot += (yVel * periodo) / 1000.0;
		zRot += (zVel * periodo) / 1000.0;
	}
	ultimoTiempo = tiempoActual;
}
function momento() {
	requestAnimFrame(momento);
	manejoKeys();
    dibujarEscena();
    //animacion();
}
function iniciarWebGL() {
	var canvas = document.getElementById("leccion05-luz");
    iniciarGL(canvas);
    iniciarShaders();
    iniciarBuffers();
    //... nuevo
    //iniciarTextura("img/crate", 6);
	iniciarTextura("img/nehe0", 6);
    gl.clearColor(0.0, 0.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
	//... Para detectar las pulsaciones (presiona tecla y suelta)
    document.onkeydown = manejoKeyAbajo;
    document.onkeyup = manejoKeyArriba;
    //... Esta funcion se renombro por la circuntancia del evento
    momento();
}