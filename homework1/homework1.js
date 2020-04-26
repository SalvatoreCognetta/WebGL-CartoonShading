"use strict";

var canvas;
var gl;

var numVertices = 178; //172

var numChecks = 8;

var program;

var c;

var flag = true;

var pointsArray = [];
var colorsArray = [];


var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var axis = 0;
var stopRotation = true;
var direction = 1;
var theta = [0, 0, 0];

var thetaLoc;

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
  
  pointsArray.push(vertices[a]);
  colorsArray.push(color);

  pointsArray.push(vertices[b]);
  colorsArray.push(color);

  pointsArray.push(vertices[c]);
  colorsArray.push(color);

  pointsArray.push(vertices[a]);
  colorsArray.push(color);

  pointsArray.push(vertices[c]);
  colorsArray.push(color);

  pointsArray.push(vertices[d]);
  colorsArray.push(color);
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
  quad(0,3,28,25);
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
  quad(20, 22, 21, 20);
  quad(21, 24, 22, 21);
  quad(23, 22, 24, 23);
  quad(20, 22, 23, 20);
}


window.onload = function init() {

  canvas = document.getElementById("gl-canvas");

  gl = canvas.getContext('webgl2');
  if (!gl) alert("WebGL 2.0 isn't available");

  gl.viewport(0, 0, canvas.width, canvas.height);
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

  var vColor = gl.getAttribLocation(program, "aColor");
  gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vColor);

  var vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

  var vPosition = gl.getAttribLocation(program, "aPosition");
  gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  thetaLoc = gl.getUniformLocation(program, "uTheta");

  //event listeners for buttons

  document.getElementById("xButton").onclick = function () {
    axis = xAxis;
    stopRotation = !stopRotation;
  };
  document.getElementById("yButton").onclick = function () {
    axis = yAxis;
    stopRotation = !stopRotation;
  };
  document.getElementById("zButton").onclick = function () {
    axis = zAxis;
    stopRotation = !stopRotation;
  };
  document.getElementById("stopButton").onclick = function () {
    stopRotation = true;
  };
  document.getElementById("directionButton").onclick = function () {
    direction *= -1;
  };
  render();
}

var render = function () {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
  if (!stopRotation) {
    theta[axis] += direction*.9;
  }
  
  gl.uniform3fv(thetaLoc, theta);

  gl.drawArrays(gl.TRIANGLES, 0, numVertices);
  requestAnimationFrame(render);
}
