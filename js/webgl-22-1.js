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
    progShader.textCoordAtributo = gl.getAttribLocation(progShader, "aTexturaCoord");// antiguo
    gl.enableVertexAttribArray(progShader.textCoordAtributo);// antiguo
    progShader.pMatrizUniforme = gl.getUniformLocation(progShader, "uPMatriz");// antiguo
    progShader.mvMatrizUniforme = gl.getUniformLocation(progShader, "umvMatriz");// antiguo
    progShader.nMatrizUniforme = gl.getUniformLocation(progShader, "uNMatriz");
    progShader.pruebaUniforme = gl.getUniformLocation(progShader, "uMuestra");// antiguo
    progShader.usoLuzUniforme = gl.getUniformLocation(progShader, "uUsoLuz");
    progShader.ambColorUniforme = gl.getUniformLocation(progShader, "uAmbienteColor");
    progShader.luzDirUniforme = gl.getUniformLocation(progShader, "uLuzDireccion");
    progShader.dirColorUniforme = gl.getUniformLocation(progShader, "uDireccionColor");
}
function cargarManijaTextura(pTextura) {
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.bindTexture(gl.TEXTURE_2D, pTextura);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, pTextura.imagen);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);//... nuevo
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST); //... nuevo
	//gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	//gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D); //... nuevo
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
		aTextura.push(cargarManija(pDireccion+i+".gif"));
	}
}
var mvMatriz = mat4.create();
var pMatriz = mat4.create();
function modificarMatrizUniforme() {
	gl.uniformMatrix4fv(progShader.pMatrizUniforme, false, pMatriz);
    gl.uniformMatrix4fv(progShader.mvMatrizUniforme, false, mvMatriz);
	//... nuevo
	/* Una matriz llamada normal, ser?? usada para transformar (rotar, trasladar, excalar.) las normales.
	No podemos transformarlas de la misma forma que hac??amos con la posici??n de los v??rtices, usando la
	matriz modelo-vista, porque al aplicar rotaciones y traslaciones se obtendr??an falsos (y desnormalizados)
	resultados. Por ejemplo, si hacemos una traslaci??n de (0,0,-5) a un vector normal (0,0,1), se convertir??a
	en (0,0,-4), que no s??lo tiene un m??dulo no normalizado, adem??s apunta a una direcci??n incorrecta.
	El modo adecuado para conseguir vertores normales en la direcci??n correcta es usar una matriz inversa
	transpuesta, rellenada con una porci??n 3X3 (las 3 primeras filas con las 3 primeras columnas) de la matriz
	modelo-vista. La explicaci??n algebraica del por qu?? es as?? queda fuera del objetivo de la lecci??n.
	Asi que digamos que calculamos la matriz normalizada haciendo uso de las funciones mat4.toInverseMat3 y
	mat3.Transpose, y que el resultado lo ponemos en una variable uniforme del programa shader para que pueda
	utilizarla en el vertice shader. */
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
var cub= Array(), cubT, cubI;
var cuboVerticeNormalBuffer;
function iniciarBuffers() {
	cub.push(puntosPoligono([-1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1, 1], 4));
	cub.push(puntosPoligono([-1, -1, -1, 1, -1, -1, 1, 1, -1, -1, 1, -1], 4));
	cub.push(puntosPoligono([-1, 1, 1, 1, 1, 1, 1, 1, -1, -1 , 1, -1], 4));
	cub.push(puntosPoligono([-1, -1, 1, 1, -1, 1, 1, -1, -1, -1 , -1, -1], 4));
	cub.push(puntosPoligono([1, -1, 1, 1, -1, -1, 1, 1, -1, 1, 1, 1], 4));
	cub.push(puntosPoligono([-1, -1, 1, -1, -1, -1, -1, 1, -1, -1, 1, 1], 4));
	/* NUEVO: Los vectores normales de los v??rtices no se calculan, los metemos nosotros.
	Es importante acordarse de que en nuestro cubo, un v??rtice s??lo pertenece a una cara, y no
	a tres, ya que en realidad lo que estamos definiendo eran seis cuadrados, cada uno con
	cuatro v??rtices, aunque juntos en una ??nica estructura, que pintamos unidos en forma de cubo.
	Por lo tanto, como un v??rtice s??lo pertenece a una cara, no hay problema alguno en determinar
	su vector normal. El siguiente cambio es un poco m??s abajo, en dibujarScene, y es s??lo el
	c??digo necesario para ligar el buffer con el atributo del programa shader adecuado, para que
	pueda recuperarlo en los shaders */
    cuboVerticeNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cuboVerticeNormalBuffer);
    var verticeNormal = [
      // Cara frontal
      0.0, 0.0, 1.0,
      0.0, 0.0, 1.0,
      0.0, 0.0, 1.0,
      0.0, 0.0, 1.0,
      //Cara posterior
      0.0, 0.0, -1.0,
      0.0, 0.0, -1.0,
      0.0, 0.0, -1.0,
      0.0, 0.0, -1.0,
      // Top face
      0.0, 1.0, 0.0,
      0.0, 1.0, 0.0,
      0.0, 1.0, 0.0,
      0.0, 1.0, 0.0,
      // Bottom face
      0.0, -1.0, 0.0,
      0.0, -1.0, 0.0,
      0.0, -1.0, 0.0,
      0.0, -1.0, 0.0,
      // Right face
      1.0, 0.0, 0.0,
      1.0, 0.0, 0.0,
      1.0, 0.0, 0.0,
      1.0, 0.0, 0.0,
      // Left face
      -1.0, 0.0, 0.0,
      -1.0, 0.0, 0.0,
      -1.0, 0.0, 0.0,
      -1.0, 0.0, 0.0
     ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verticeNormal), gl.STATIC_DRAW);
    cuboVerticeNormalBuffer.itemTam = 3;
    cuboVerticeNormalBuffer.numItems = 24;
	//... Fin de nuevo
	
	cubT= coordenadaTextura([0, 0, 1, 0, 1, 1, 0, 1], 4);
	cubI= indexPoligono([0, 1, 2,     0, 2, 3], 6);
}
function poligono3D(pPol, pPolI, pPolT, pText, pTras, pAng1, pEje1, pAng2, pEje2, pAng3, pEje3, pEsc){
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
	gl.bindBuffer(gl.ARRAY_BUFFER, cuboVerticeNormalBuffer);
    gl.vertexAttribPointer(progShader.vertNormalAtributo, cuboVerticeNormalBuffer.itemTam, gl.FLOAT, false, 0, 0);
	
    //... textura
    gl.bindBuffer(gl.ARRAY_BUFFER, pPolT);
    gl.vertexAttribPointer(progShader.textCoordAtributo, pPolT.itemTam, gl.FLOAT, false, 0, 0);
	gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, pText);
    gl.uniform1i(progShader.muestraUniform, 0);
	
	// NUEVO: Si el checkbox de HTML indica que la iluminaci??n est?? marcada o no, hay que comunic??rselo al shader:
	var iluminacion = document.getElementById("iluminacion").checked;
    gl.uniform1i(progShader.usoLuzUniforme, iluminacion);
	/* Si la iluminaci??n est?? marcada, leemos los campos de entrada de HTML pertenecientes a las
	componentes rojo, verde y azul del color RGB que el usuario ha escrito, para pas??rselas tambi??n
	al shader*/
    if (iluminacion) {
      gl.uniform3f(
        progShader.ambColorUniforme,
        parseFloat(document.getElementById("ambientR").value),
        parseFloat(document.getElementById("ambientG").value),
        parseFloat(document.getElementById("ambientB").value)
      );
	  //... Y ahora, lo mismo con la direcci??n de la luz
      var iluminacionDireccion = [
        parseFloat(document.getElementById("luzDireccionX").value),
        parseFloat(document.getElementById("luzDireccionY").value),
        parseFloat(document.getElementById("luzDireccionZ").value)
      ];
      var ajusteLD = vec3.create();
      vec3.normalize(iluminacionDireccion, ajusteLD);
	  /* Puedes ver c??mo normalizamos el vector antes de pas??rselo al shader, utilizando funciones de
	  la librer??a vec3, que al igual que mat4, pertenecen a glMatriz. El primer ajuste, vec3.normalice,
	  modifica la escala de las componenentes X, Y y Z del vector para que su m??dulo sea 1. Las normales
	  que definimos para cada v??rtice, como podr?? comprobar, tambi??n tienen m??dulo 1, pero como el vector
	  de iluminaci??n lo meter?? el usuario, es un dolor obligarlo a que lo haga ya directamente normalizado.
	  Es un requisito indispensable para poder realizar el producto escalar para obtener la cantidad de
	  iluminaci??n a reflejar en el color de la textura. El segundo ajuste es multiplicar el vector por un
	  n??mero escalar, el -1. En otras palabras, lo que estamos haciendo es invertir su direcci??n. Lo hacemos
	  as?? porque al usuario le pedimos que introduzca la direcci??n donde va la luz, pero para los c??lculos,
	  lo que en realidad necesitamos saber, es de d??nde viene (es decir, la direcci??n original invertida).
	  Y finalmente le pasamos el vector al shader con gl.uniform3fv, que ya son del tipo Float32Array, pues
	  al usar funciones de vec3, se convierte el vector a ese tipo autom??ticamente. */
      vec3.scale(ajusteLD, -1);
      gl.uniform3fv(progShader.luzDirUniforme, ajusteLD);
      gl.uniform3f(
        progShader.dirColorUniforme,
        parseFloat(document.getElementById("direccionR").value),
        parseFloat(document.getElementById("direccionG").value),
        parseFloat(document.getElementById("direccionB").value)
      );
	  /* S??lo copia los componentes del color de la luz direccional simple a la variable uniforme apropiada del shader: 
	  Estos son todos los cambios de dibujarScene. En la funci??n de eventos del teclado, eliminamos el c??digo que
	  maneja la tecla F. Otro cambio m??s interesante est?? en la funci??n modificarMatrizUniforme, que como recordar??s,
	  se encargaba de mover las variables uniformes de las matrices de modelo-vista y proyecci??n de javascript a webGL.
	  Tenemos que a??adir cuatro l??neas para crear ua nueva matriz, basada en la de modelo-vista */
    }
	//... fin nuevo
	
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
		poligono3D(cub[i], cubI, cubT, aTextura[i], [0.0, 0.0, -10.0], xRot, [1, 0, 0], yRot, [0, 1, 0], zRot, [0, 0, 1], [1, 1, 1]);
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
    animacion();
}
function iniciarWebGL() {
	var canvas = document.getElementById("leccion05-luz");
    iniciarGL(canvas);
    iniciarShaders();
    iniciarBuffers();
    //... nuevo
    iniciarTextura("img/nehe", 7);
    gl.clearColor(0.0, 0.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
	//... Para detectar las pulsaciones (presiona tecla y suelta)
    document.onkeydown = manejoKeyAbajo;
    document.onkeyup = manejoKeyArriba;
    //... Esta funcion se renombro por la circuntancia del evento
    momento();
}