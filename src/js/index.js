// constants
var DIRECTIONAL_LIGHT_X = -0.25;
var DIRECTIONAL_LIGHT_Y = -0.25;
var DIRECTIONAL_LIGHT_Z = -1;
var DIRECTIONAL_LIGHT_COLOR = 0.8;
var AMBIENT_LIGHT_COLOR = 0.2;    

// variables
var gl;
var lastTime = 0;
var mvMatrix = mat4.create();
var pMatrix = mat4.create();

function setMatrixUniforms() {
  gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
  gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);

  var normalMatrix = mat3.create();
  mat4.toInverseMat3(mvMatrix, normalMatrix);
  mat3.transpose(normalMatrix);
  gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, normalMatrix);
}

function degToRad(degrees) {
  return degrees * Math.PI / 180;
}


function drawScene() {
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);

  mat4.identity(mvMatrix);

  mat4.translate(mvMatrix, [0.0, 0.0, -5]);

  var xRot = 0;
  var yRot = 0;
  mat4.rotate(mvMatrix, degToRad(xRot), [1, 0, 0]);
  mat4.rotate(mvMatrix, degToRad(yRot), [0, 1, 0]);

  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexNormalBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, cubeVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer);
  gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, cubeVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, crateTexture);
  gl.uniform1i(shaderProgram.samplerUniform, 0);
  var lighting = true;
  gl.uniform1i(shaderProgram.useLightingUniform, lighting);
  if (lighting) {
      gl.uniform3f(
          shaderProgram.ambientColorUniform,
          AMBIENT_LIGHT_COLOR,
          AMBIENT_LIGHT_COLOR,
          AMBIENT_LIGHT_COLOR
      );

      var lightingDirection = [
          DIRECTIONAL_LIGHT_X,
          DIRECTIONAL_LIGHT_Y,
          DIRECTIONAL_LIGHT_Z
      ];
      var adjustedLD = vec3.create();
      vec3.normalize(lightingDirection, adjustedLD);
      vec3.scale(adjustedLD, -1);
      gl.uniform3fv(shaderProgram.lightingDirectionUniform, adjustedLD);

      gl.uniform3f(
          shaderProgram.directionalColorUniform,
          DIRECTIONAL_LIGHT_COLOR,
          DIRECTIONAL_LIGHT_COLOR,
          DIRECTIONAL_LIGHT_COLOR
      );
  }

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
  setMatrixUniforms();
  gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
}

function update() {
  var time = new Date().getTime(),
      elapsedTime = lastTime === 0 ? 0 : time - lastTime;

  lastTime = time;

  drawScene();
  requestAnimationFrame(update);
}

function init() {
  var sceneCanvas = document.getElementById('sceneCanvas');
  sceneCanvas.width = window.innerWidth;
  sceneCanvas.height = window.innerHeight;
  document.body.appendChild(sceneCanvas);

  gl = sceneCanvas.getContext('webgl');
  gl.viewportWidth = sceneCanvas.width;
  gl.viewportHeight = sceneCanvas.height;

  initShaders();
  initBuffers();
  initTextures();

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

  update();


}

init(); 