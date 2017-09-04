var mvMatrix = mat4.create(); 
var pMatrix = mat4.create();
var mvMatrixStack = [];

function gl_init() {
  // init depth test
  context.enable(context.DEPTH_TEST);
};

function gl_clear() {
  context.viewport(0, 0, canvas.width, canvas.height);
  context.clear(context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT);
};

function gl_save() {
  var copy = mat4.create();
  mat4.set(mvMatrix, copy);
  mvMatrixStack.push(copy);
};

function gl_restore() {
  if (mvMatrixStack.length == 0) {
    throw 'Invalid popMatrix!';
  }
  mvMatrix = mvMatrixStack.pop();
};

function gl_initShaders() {
  gl_initPositionShader();
  gl_initTextureShader();
  gl_initNormalShader();
  gl_initLightingShader();
};

function gl_setShaderProgram(fragmentGLSL, vertexGLSL) {
  var fragmentShader = context.createShader(context.FRAGMENT_SHADER);
  context.shaderSource(fragmentShader, fragmentGLSL);
  context.compileShader(fragmentShader);
  
  var vertexShader = context.createShader(context.VERTEX_SHADER);
  context.shaderSource(vertexShader, vertexGLSL);
  context.compileShader(vertexShader);

  context.attachShader(shaderProgram, vertexShader);
  context.attachShader(shaderProgram, fragmentShader);
  context.linkProgram(shaderProgram);
  
  if (!context.getProgramParameter(shaderProgram, context.LINK_STATUS)) {
    alert('Could not initialize shaders');
  }
  
  context.useProgram(shaderProgram);
  
  // once shader program is loaded, it's time to init the shaders
  gl_initShaders();
};

function gl_perspective(viewAngle, minDist, maxDist) {
  mat4.perspective(viewAngle, canvas.width / canvas.height, minDist, maxDist, pMatrix);
};

function gl_identity() {
  mat4.identity(mvMatrix);
};

function gl_translate(x, y, z) {
  mat4.translate(mvMatrix, [x, y, z]);
};

function gl_rotate(angle, x, y, z) {
  mat4.rotate(mvMatrix, angle, [x, y, z]);
};

function gl_scale(x, y, z) {
  mat4.scale(mvMatrix, [x, y, z]);
};

function gl_initPositionShader() {
  shaderProgram.vertexPositionAttribute = context.getAttribLocation(shaderProgram, 'aVertexPosition');
  context.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
  shaderProgram.pMatrixUniform = context.getUniformLocation(shaderProgram, 'uPMatrix');
  shaderProgram.mvMatrixUniform = context.getUniformLocation(shaderProgram, 'uMVMatrix');
};

function gl_initColorShader() {
  shaderProgram.vertexColorAttribute = context.getAttribLocation(shaderProgram, 'aVertexColor');
  context.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
};

function gl_initTextureShader() {
  shaderProgram.textureCoordAttribute = context.getAttribLocation(shaderProgram, 'aTextureCoord');
  context.enableVertexAttribArray(shaderProgram.textureCoordAttribute);
  shaderProgram.samplerUniform = context.getUniformLocation(shaderProgram, 'uSampler');
};

function gl_initNormalShader() {
  shaderProgram.vertexNormalAttribute = context.getAttribLocation(shaderProgram, 'aVertexNormal');
  context.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);
  shaderProgram.nMatrixUniform = context.getUniformLocation(shaderProgram, 'uNMatrix');
};

function gl_initLightingShader() {
  shaderProgram.useLightingUniform = context.getUniformLocation(shaderProgram, 'uUseLighting');
  shaderProgram.ambientColorUniform = context.getUniformLocation(shaderProgram, 'uAmbientColor');
  shaderProgram.pointLightingLocationUniform = context.getUniformLocation(shaderProgram, 'uPointLightingLocation');
  shaderProgram.pointLightingColorUniform = context.getUniformLocation(shaderProgram, 'uPointLightingColor');
};

function gl_initTexture(glTexture, image) {
  context.pixelStorei(context.UNPACK_FLIP_Y_WEBGL, true);
  context.bindTexture(context.TEXTURE_2D, glTexture);
  context.texImage2D(context.TEXTURE_2D, 0, context.RGBA, context.RGBA, context.UNSIGNED_BYTE, image);
  context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MAG_FILTER, context.NEAREST);
  context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MIN_FILTER, context.LINEAR_MIPMAP_NEAREST);
  context.generateMipmap(context.TEXTURE_2D);
  context.bindTexture(context.TEXTURE_2D, null);
};

function gl_createArrayBuffer(vertices) {
  var buffer = context.createBuffer();
  buffer.numElements = vertices.length;
  context.bindBuffer(context.ARRAY_BUFFER, buffer);
  context.bufferData(context.ARRAY_BUFFER, new Float32Array(vertices), context.STATIC_DRAW);
  return buffer;
};

function gl_createElementArrayBuffer(vertices) {
  var buffer = context.createBuffer();
  buffer.numElements = vertices.length;
  context.bindBuffer(context.ELEMENT_ARRAY_BUFFER, buffer);
  context.bufferData(context.ELEMENT_ARRAY_BUFFER, new Uint16Array(vertices), context.STATIC_DRAW);
  return buffer;
};

function gl_pushBuffers(buffers, texture) {
  // position buffers
  context.bindBuffer(context.ARRAY_BUFFER, buffers.position);
  context.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 3, context.FLOAT, false, 0, 0);

  // texture buffers
  context.bindBuffer(context.ARRAY_BUFFER, buffers.texture);
  context.vertexAttribPointer(shaderProgram.textureCoordAttribute, 2, context.FLOAT, false, 0, 0);
  context.activeTexture(context.TEXTURE0);
  context.bindTexture(context.TEXTURE_2D, texture);
  context.uniform1i(shaderProgram.samplerUniform, 0);

  // index buffers
  context.bindBuffer(context.ELEMENT_ARRAY_BUFFER, buffers.index);

  // normal buffers
  context.bindBuffer(context.ARRAY_BUFFER, buffers.normal);
  context.vertexAttribPointer(shaderProgram.vertexNormalAttribute, 3, context.FLOAT, false, 0, 0);
};

function gl_setMatrixUniforms() {
  context.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
  context.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
  
  var normalMatrix = mat3.create();
  mat4.toInverseMat3(mvMatrix, normalMatrix);
  mat3.transpose(normalMatrix);
  context.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, normalMatrix);
};

function gl_drawElements(buffers) {
  gl_setMatrixUniforms();
  
  // draw elements
  context.drawElements(context.TRIANGLES, buffers.index.numElements, context.UNSIGNED_SHORT, 0);
};

function l_drawArrays(buffers) {
  gl_setMatrixUniforms();
  
  // draw arrays
  context.drawArrays(context.TRIANGLES, 0, buffers.position.numElements / 3);
};

function gl_enableLighting() {
  context.uniform1i(shaderProgram.useLightingUniform, true);
};

function gl_setAmbientLighting(red, green, blue) {
  context.uniform3f(shaderProgram.ambientColorUniform, red, green, blue);
};

function gl_setPointLighting(red, green, blue) {
  context.uniform3f(shaderProgram.pointLightingColorUniform, red, green, blue);
}