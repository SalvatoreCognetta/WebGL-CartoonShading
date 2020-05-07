"use strict";

var canvas;
var gl;

var numVertices = 178;

var numChecks = 8;

var program;

var c;

var flag = true;
var flagLight = true;

var pointsArray = [];
var colorsArray = [];
var normalsArray = [];

var xLight = 1;
var yLight = 1;
var zLight = 1;

var lightPosition = vec4(1.0, 1.0, 1.0, 0.0);
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0); //no specular

var materialAmbient = vec4(1.0, 0.0, 1.0, 1.0);
var materialDiffuse = vec4(1.0, 0.8, 0.0, 1.0);
var materialSpecular = vec4(1.0, 0.8, 0.0, 1.0);
var materialShininess = 100.0;

var ambientProduct; 
var diffuseProduct;
var specularProduct;

var lightFlagLoc;
var ambientProductLoc, diffuseProductLoc, specularProductLoc, lightPositionLoc, materialShininessLoc;

//Rotation
var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var axis = 0;
var direction = 1;
var theta = [0, 0, 0];
var thetaLoc;

var near = 2.21;
var far = 6.0;
var x = 0.0;
var y = 0.0;
var z = -2.8;
var dr = 5.0 * Math.PI / 180.0;

var fovy = 90.0;  // Field-of-view in Y direction angle (in degrees)
var aspect = 1.5;       // Viewport aspect ratio

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;
var rotationMatrix;
var eye;
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

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
  vec4(0.0, 0.0, 0.0, 1.0),  // black
  vec4(1.0, 0.0, 0.0, 1.0),  // red
  vec4(1.0, 1.0, 0.0, 1.0),  // yellow
  vec4(0.0, 1.0, 0.0, 1.0),  // green
  vec4(0.0, 0.0, 1.0, 1.0),  // blue
  vec4(1.0, 0.0, 1.0, 1.0),  // magenta
  vec4(0.0, 1.0, 1.0, 1.0),  // white
  vec4(0.0, 1.0, 1.0, 1.0)   // cyan
];

var thetaLoc;

function quad(a, b, c, d) {
  var color;
  if (true) { //a >= vertexColors.length
    color = vec4(Math.random(), Math.random(), Math.random(), 1.0);   // test
  } else {
    color = vertexColors[a];
  }

  var t1 = subtract(vertices[b], vertices[a]);
  var t2 = subtract(vertices[c], vertices[b]);
  var normal = cross(t1, t2);
  normal = vec3(normal);

  pointsArray.push(vertices[a]);
  colorsArray.push(color);
  normalsArray.push(normal);

  pointsArray.push(vertices[b]);
  colorsArray.push(color);
  normalsArray.push(normal);

  pointsArray.push(vertices[c]);
  colorsArray.push(color);
  normalsArray.push(normal);

  pointsArray.push(vertices[a]);
  colorsArray.push(color);
  normalsArray.push(normal);

  pointsArray.push(vertices[c]);
  colorsArray.push(color);
  normalsArray.push(normal);

  pointsArray.push(vertices[d]);
  colorsArray.push(color);
  normalsArray.push(normal);
}

function colorCube() {
  // quad(1, 0, 3, 2);
  //Right
  quad(2, 3, 7, 11);
  quad(7, 6, 15, 11);

  // quad(3, 0, 4, 7);  
  //Bottom
  quad(0, 20, 21, 3);
  quad(3, 21, 24, 7);
  quad(7, 24, 23, 4);
  quad(4, 23, 20, 0);

  // quad(6, 5, 1, 2);
  //Top-up face
  quad(1, 2, 11, 8);
  quad(6, 5, 12, 15);
  // quad(1, 8, 12, 5);
  // quad(2, 6, 15, 11);

  //Back
  quad(4, 5, 6, 7);

  //Left
  // quad(4, 5, 12, 8);
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
    flag = true;
  };
  document.getElementById("directionButton").onclick = function () {
    direction *= -1;
  };

  // sliders for viewing parameters
  document.getElementById("zFarSlider").oninput = function (event) {
    far = event.target.value;
  };
  document.getElementById("zNearSlider").oninput = function (event) {
    near = event.target.value;
  };
  document.getElementById("xSlider").oninput = function (event) {
    x = event.target.value;
  };
  document.getElementById("ySlider").oninput = function (event) {
    y = event.target.value;
  };
  document.getElementById("zSlider").oninput = function (event) {
    z = event.target.value;
  };
  document.getElementById("aspectSlider").oninput = function (event) {
    aspect = event.target.value;
  };
  document.getElementById("fovSlider").oninput = function (event) {
    fovy = event.target.value;
  };

  // sliders for light position
  document.getElementById("toggleLight").onclick = function (event) {
    flagLight = !flagLight
  };
  document.getElementById("xLighSlider").oninput = function (event) {
    xLight = event.target.value;
  };
  document.getElementById("yLighSlider").oninput = function (event) {
    yLight = event.target.value;
  };
  document.getElementById("zLighSlider").oninput = function (event) {
    zLight = event.target.value;
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

  modelViewMatrixLoc = gl.getUniformLocation(program, "uModelViewMatrix");
  projectionMatrixLoc = gl.getUniformLocation(program, "uProjectionMatrix");

  lightFlagLoc       = gl.getUniformLocation(program,"uLightFlag");
  ambientProductLoc  = gl.getUniformLocation(program, "uAmbientProduct");
  diffuseProductLoc  = gl.getUniformLocation(program, "uDiffuseProduct");
  specularProductLoc = gl.getUniformLocation(program, "uSpecularProduct");
  lightPositionLoc   = gl.getUniformLocation(program, "uLightPosition");

  gl.uniform1f(gl.getUniformLocation(program, "uShininess"), materialShininess);

  thetaLoc = gl.getUniformLocation(program, "uTheta");

  buttonHandler();

  render();
}

var render = function () {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  if (!flag) {
    theta[axis] += direction * .9;
  }

  eye = vec3(x, y, z);
  modelViewMatrix = lookAt(eye, at, up);
  projectionMatrix = perspective(fovy, aspect, near, far);

  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
  gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

  lightPosition = vec4(xLight, yLight, zLight, 0.0);
  ambientProduct  = mult(lightAmbient, materialAmbient);
  diffuseProduct  = mult(lightDiffuse, materialDiffuse);

  gl.uniform1f(lightFlagLoc, flagLight);
  gl.uniform4fv(ambientProductLoc, ambientProduct);
  gl.uniform4fv(diffuseProductLoc, diffuseProduct);
  gl.uniform4fv(lightPositionLoc, lightPosition);


  rotationMatrix = mat4();
  rotationMatrix = mult(rotationMatrix, rotate(theta[xAxis], vec3(1, 0, 0)));
  rotationMatrix = mult(rotationMatrix, rotate(theta[yAxis], vec3(0, 1, 0)));
  rotationMatrix = mult(rotationMatrix, rotate(theta[zAxis], vec3(0, 0, 1)));

  gl.uniformMatrix4fv(gl.getUniformLocation(program, "uRotationMatrix"), false, flatten(rotationMatrix));

  gl.uniform3fv(thetaLoc, theta);

  gl.drawArrays(gl.TRIANGLES, 0, numVertices);
  requestAnimationFrame(render);
}
