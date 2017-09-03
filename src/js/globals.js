var MATH_PI = Math.PI;
var MATH_ROUND = Math.round;

// variables
var canvas = document.getElementById('scene'), 
    context = canvas.getContext('webgl'),
    shaderProgram = context.createProgram();
    mvMatrix = mat4.create(), 
    pMatrix = mat4.create(),
    mvMatrixStack = [];