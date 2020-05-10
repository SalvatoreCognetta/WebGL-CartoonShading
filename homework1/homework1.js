"use strict";

var canvas;
var gl;

var numVertices = 178;

var numChecks = 8;

var program;

var c;

var flag               = false;
var flagLight          = true;
var flagSpotLight      = true;
var flagTexture        = true;
var flagCartoonShading = true;

var pointsArray    = [];
var colorsArray    = [];
var normalsArray   = [];
var texCoordsArray = [];

//Position of the directional light
var xLight = 1;
var yLight = 1;
var zLight = 1;

var lightPosition = vec4(xLight, yLight, zLight, 0.0);
var lightAmbient  = vec4(0.2, 0.2, 0.2, 1.0);
var lightDiffuse  = vec4(1.0, 1.0, 1.0, 1.0);

var materialAmbient   = vec4(0.7, 0.0, 1.0, 1.0);
var materialDiffuse   = vec4(1.0, 0.8, 0.0, 1.0);

//Spotlight vars
var spotLightPosition   = vec4(0.0, 0.0, 9.0, 1.0 );
var spotLightAmbient    = vec4(0.2, 0.2, 0.2, 1.0 );
var spotLightDiffuse    = vec4(1.0, 1.0, 1.0, 1.0 );
var spotLightDirection  = vec4(0.0, 0.0, 1.0, 1.0);
var spotCutOff = 0.95;

var ambientProduct; 
var diffuseProduct;
var specularProduct;

var lightFlagLoc;
var ambientProductLoc, diffuseProductLoc, specularProductLoc;
var CiLoc, CsLoc;
var lightPositionLoc;

var spotLightFlagLoc;
var spotAmbientProductLoc, spotDiffuseProductLoc;
var spotLightPositionLoc, spotLightDirectionLoc;
var spotCutOffLoc;

//Rotation
var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var axis = 1;
var direction = 1;
var theta = [0, 0, 0];
var thetaLoc;

//Frustum vars
var near = 2.00;
var far = 6.0;
var dr = 5.0 * Math.PI / 180.0;

var fovy = 90.0;  // Field-of-view in Y direction angle (in degrees)
var aspect = 1.5;       // Viewport aspect ratio

//Eye position
var x = 0.0;
var y = 0.0;
var z = 2.8;
var eye;
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

//Matrix
var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;
var rotationMatrix;

//Texture vars
var texture;
var textureFlagLoc;

var cartoonFlagLoc;

var texCoord = [
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 0)
];

var vertices = [
  vec4(-0.4, -0.5, 0.4, 1.0),   //0
  vec4(-0.7, 0.4, 0.3, 1.0),    //1
  vec4(0.5, 0.6, 0.5, 1.0),     //2
  vec4(0.7, -0.3, 0.2, 1.0),    //3

  vec4(-0.3, -0.1, -0.5, 1.0),  //4
  vec4(-0.2, 0.5, -0.5, 1.0),   //5
  vec4(0.6, 0.3, -0.3, 1.0),    //6
  vec4(0.5, -0.5, -0.5, 1.0),   //7

  //Base of the half quad-pyramid
  vec4(-0.8, 0.6, 0.2, 1.0),   //8
  vec4(-0.5, 0.7, 0.2, 1.0),   //9
  vec4(0.5, 0.6, 0.2, 1.0),    //10
  vec4(0.5, 0.4, 0.2, 1.0),    //11
  vec4(-0.5, 0.4, -0.2, 1.0),  //12
  vec4(-0.5, 0.6, -0.1, 1.0),  //13
  vec4(0.5, 0.7, -0.3, 1.0),   //14
  vec4(0.5, 0.5, -0.2, 1.0),   //15

  //Top of the half quad-pyramid
  vec4(-0.3, 0.9, 0.1, 1.0),   //16
  vec4(0, 0.9, 0.1, 1.0),      //17
  vec4(-0.3, 0.9, 0, 1.0),     //18
  vec4(0.3, 0.9, -0.1, 1.0),   //19

  //Pyramid
  vec4(-0.15, -0.5, 0.3, 1.0),  //20
  vec4(0.15, -0.5, 0.3, 1.0),   //21
  vec4(0.0, -0.7, 0.0, 1.0),    //22
  vec4(-0.15, -0.5, -0.3, 1.0), //23
  vec4(0.15, -0.5, -0.3, 1.0),  //24

  //Front
  vec4(-0.1, -0.15, 0.5, 1.0),   //25
  vec4(-0.2, 0.15, 0, 1.0),      //26
  vec4(0.10, 0.15, 0.7, 1.0),    //27
  vec4(0.2, -0.15, 0.5, 1.0),    //28

];

var vertexColors = [
  vec4(1.0, 0.0, 0.0, 1.0),  // red
  vec4(1.0, 1.0, 0.0, 1.0),  // yellow
  vec4(0.0, 1.0, 0.0, 1.0),  // green
  vec4(0.0, 0.0, 1.0, 1.0),  // blue
  vec4(1.0, 0.0, 1.0, 1.0),  // magenta
  vec4(0.0, 1.0, 1.0, 1.0),  // white
  vec4(0.0, 1.0, 1.0, 1.0)   // cyan
];


function configureTexture( image ) {
  texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB,
       gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
                    gl.NEAREST_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

  gl.uniform1i(gl.getUniformLocation(program, "uTextureMap"), 0);
}

function quad(a, b, c, d) {
  var color = vec4(Math.random(), Math.random(), Math.random(), 1.0);

  var t1 = subtract(vertices[b], vertices[a]);
  var t2 = subtract(vertices[c], vertices[a]);
  var normal = cross(t1, t2);
  normal = vec3(normal);

  pointsArray.push(vertices[a]);
  colorsArray.push(color);
  normalsArray.push(normal);
  texCoordsArray.push(texCoord[0]);

  pointsArray.push(vertices[b]);
  colorsArray.push(color);
  normalsArray.push(normal);
  texCoordsArray.push(texCoord[1]);

  pointsArray.push(vertices[c]);
  colorsArray.push(color);
  normalsArray.push(normal);
  texCoordsArray.push(texCoord[2]);

  pointsArray.push(vertices[a]);
  colorsArray.push(color);
  normalsArray.push(normal);
  texCoordsArray.push(texCoord[0]);

  pointsArray.push(vertices[c]);
  colorsArray.push(color);
  normalsArray.push(normal);
  texCoordsArray.push(texCoord[2]);

  pointsArray.push(vertices[d]);
  colorsArray.push(color);
  normalsArray.push(normal);
  texCoordsArray.push(texCoord[3]);
}

function colorCube() {
  //Right
  quad(2, 3, 7, 11);
  quad(7, 6, 15, 11);

  //Bottom
  quad(0, 20, 21, 3);
  quad(3, 21, 24, 7);
  quad(7, 24, 23, 4);
  quad(4, 23, 20, 0);

  //Top-up face
  quad(1, 2, 11, 8);
  quad(6, 5, 12, 15);

  //Back
  quad(4, 5, 6, 7);

  //Left
  quad(4, 8, 12, 5);
  quad(0, 1, 8, 4);

  //Front face
  quad(0, 25, 26, 1);
  quad(2, 1, 26, 27);
  quad(3, 2, 27, 28);
  quad(0, 3, 28, 25);
  quad(28, 27, 25, 25);
  quad(25, 27, 26, 26);

  //Base
  quad(9, 8, 11, 10);
  quad(10, 11, 15, 14);
  quad(12, 13, 14, 15);
  quad(9, 8, 12, 13);

  quad(16, 9, 10, 17);
  quad(17, 10, 14, 19);
  quad(18, 19, 14, 13);
  quad(16, 18, 13, 9);
  quad(16, 17, 19, 18);

  //Pyramid
  quad(20, 22, 21, 21);
  quad(21, 24, 22, 22);
  quad(23, 22, 24, 24);
  quad(20, 22, 23, 23);
}

function buttonHandler() {
  //event listeners for buttons
  document.getElementById("xButton").onclick = function () {
    axis = xAxis;
    flag = !flag;
  };
  document.getElementById("yButton").onclick = function () {
    axis = yAxis;
    flag = !flag;
  };
  document.getElementById("zButton").onclick = function () {
    axis = zAxis;
    flag = !flag;
  };
  document.getElementById("stopButton").onclick = function () {
    flag = false;
  };
  document.getElementById("directionButton").onclick = function () {
    direction *= -1;
  };

  // sliders for viewing parameters
  document.getElementById("zFarSlider").oninput = function (event) {
    far = +event.target.value;
    console.log = far;
  };
  document.getElementById("zNearSlider").oninput = function (event) {
    near = +event.target.value;
  };
  document.getElementById("xSlider").oninput = function (event) {
    x = +event.target.value;
  };
  document.getElementById("ySlider").oninput = function (event) {
    y = +event.target.value;
  };
  document.getElementById("zSlider").oninput = function (event) {
    z = +event.target.value;
  };
  document.getElementById("aspectSlider").oninput = function (event) {
    aspect = +event.target.value;
  };
  document.getElementById("fovSlider").oninput = function (event) {
    fovy = +event.target.value;
  };

  // sliders for light position
  document.getElementById("xLighSlider").oninput = function (event) {
    xLight = event.target.value;
  };
  document.getElementById("yLighSlider").oninput = function (event) {
    yLight = event.target.value;
  };
  document.getElementById("zLighSlider").oninput = function (event) {
    zLight = event.target.value;
  };

  //slider for spotlight
  document.getElementById("toggleSpotLight").onclick = function (event) {
    flagSpotLight = !flagSpotLight
    var value_spotlight = flagSpotLight ? "ON" : "OFF";
    document.getElementById("on-off-spotlight").value = value_spotlight;
  };
  document.getElementById("cutOffSpotLighSlider").oninput = function (event) {
    spotCutOff = event.target.value;
  };

  //button for texture
  document.getElementById("toggleTexture").onclick = function (event) {
    flagTexture = !flagTexture;
    var value_texture = flagTexture ? "ON" : "OFF";
    document.getElementById("on-off-texture").value = value_texture;
  };

  //button for cartoon shading
  document.getElementById("toggleCartoonShading").onclick = function (event) {
    flagCartoonShading = !flagCartoonShading;
    var value_texture = flagCartoonShading ? "ON" : "OFF";
    document.getElementById("on-off-cartoon").value = value_texture;
  };
}


window.onload = function init() {

  canvas = document.getElementById("gl-canvas");

  gl = canvas.getContext('webgl2');
  if (!gl) alert("WebGL 2.0 isn't available");

  gl.viewport(0, 0, canvas.width, canvas.height);

  aspect = canvas.width / canvas.height;

  gl.clearColor(1.0, 1.0, 1.0, 1.0);

  gl.enable(gl.DEPTH_TEST);

  //
  //  Load shaders and initialize attribute buffers
  //
  program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  colorCube();

  var cBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW);

  var colorLoc = gl.getAttribLocation(program, "aColor");
  gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(colorLoc);

  var nBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

  var normalLoc = gl.getAttribLocation(program, "aNormal");
  gl.vertexAttribPointer(normalLoc, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(normalLoc);

  var vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

  var positionLoc = gl.getAttribLocation(program, "aPosition");
  gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(positionLoc);

  var tBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW);

  var texCoordLoc = gl.getAttribLocation(program, "aTexCoord");
  gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(texCoordLoc);

  thetaLoc = gl.getUniformLocation(program, "uTheta");

  modelViewMatrixLoc  = gl.getUniformLocation(program, "uModelViewMatrix");
  projectionMatrixLoc = gl.getUniformLocation(program, "uProjectionMatrix");

  lightFlagLoc       = gl.getUniformLocation(program,"uLightFlag");
  ambientProductLoc  = gl.getUniformLocation(program, "uAmbientProduct");
  diffuseProductLoc  = gl.getUniformLocation(program, "uDiffuseProduct");
  specularProductLoc = gl.getUniformLocation(program, "uSpecularProduct");
  lightPositionLoc   = gl.getUniformLocation(program, "uLightPosition");

  //spotlight
  spotLightFlagLoc      = gl.getUniformLocation(program,"uSpotLightFlag");
  spotAmbientProductLoc = gl.getUniformLocation(program, "uSpotAmbientProduct");
  spotDiffuseProductLoc = gl.getUniformLocation(program, "uSpotDiffuseProduct");
  spotLightPositionLoc  = gl.getUniformLocation(program, "uSpotLightPosition");
  spotLightDirectionLoc = gl.getUniformLocation(program, "uSpotLightDirection");
  
  spotCutOffLoc = gl.getUniformLocation(program, "uSpotCutOff");

  //Texture
  var image = document.getElementById("textureImg");
  configureTexture(image);
  textureFlagLoc = gl.getUniformLocation(program,"uTextureFlag");

  cartoonFlagLoc = gl.getUniformLocation(program,"uCartoonShadingFlag");

  buttonHandler();

  render();
}

var render = function () {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  if (flag) {
    theta[axis] += direction * .9;
  }

  eye = vec3(x, y, z);
  modelViewMatrix  = lookAt(eye, at, up);
  projectionMatrix = perspective(fovy, aspect, near, far);

  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
  gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

  rotationMatrix = mat4();
  rotationMatrix = mult(rotationMatrix, rotate(theta[xAxis], vec3(1, 0, 0)));
  rotationMatrix = mult(rotationMatrix, rotate(theta[yAxis], vec3(0, 1, 0)));
  rotationMatrix = mult(rotationMatrix, rotate(theta[zAxis], vec3(0, 0, 1)));

  gl.uniformMatrix4fv(gl.getUniformLocation(program, "uRotationMatrix"), false, flatten(rotationMatrix));

  gl.uniform3fv(thetaLoc, theta);


  lightPosition   = vec4(xLight, yLight, zLight, 0.0);
  ambientProduct  = mult(lightAmbient, materialAmbient);
  diffuseProduct  = mult(lightDiffuse, materialDiffuse);

  gl.uniform1f(lightFlagLoc, flagLight);
  gl.uniform4fv(ambientProductLoc, ambientProduct);
  gl.uniform4fv(diffuseProductLoc, diffuseProduct);
  gl.uniform4fv(lightPositionLoc, lightPosition);

  var spotAmbientProduct = mult(spotLightAmbient, materialAmbient);
  var spotDiffuseProduct = mult(spotLightDiffuse, materialDiffuse);
  gl.uniform1f(spotLightFlagLoc, flagSpotLight);
  gl.uniform4fv(spotAmbientProductLoc, flatten(spotAmbientProduct));
  gl.uniform4fv(spotDiffuseProductLoc, flatten(spotDiffuseProduct));
  gl.uniform4fv(spotLightPositionLoc,  flatten(spotLightPosition));
  gl.uniform1f(spotCutOffLoc, spotCutOff);
  gl.uniform4fv(spotLightDirectionLoc, spotLightDirection);

  gl.uniform1f(textureFlagLoc, flagTexture);

  gl.uniform1f(cartoonFlagLoc, flagCartoonShading);

  gl.drawArrays(gl.TRIANGLES, 0, numVertices);
  requestAnimationFrame(render);
}
