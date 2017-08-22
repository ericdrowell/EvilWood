var WebGL = function(canvasId){
    this.canvas = document.getElementById(canvasId);
    this.context = this.canvas.getContext("experimental-webgl");
    this.stage = undefined;

    // Animation 
    this.t = 0;
    this.timeInterval = 0;
    this.startTime = 0;
    this.lastTime = 0;
    this.frame = 0;
    this.animating = false;
    
    // provided by Paul Irish
    window.requestAnimFrame = (function(callback){
        return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function(callback){
            window.setTimeout(callback, 1000 / 60);
        };
    })();
    
  /*
   * encapsulte mat3, mat4, and vec3 from
   * glMatrix globals
   */
    this.mat3 = mat3;
    this.mat4 = mat4;
  this.vec3 = vec3;
    
    // shader type constants
    this.BLUE_COLOR = "BLUE_COLOR";
    this.VARYING_COLOR = "VARYING_COLOR";
    this.TEXTURE = "TEXTURE";
    this.TEXTURE_DIRECTIONAL_LIGHTING = "TEXTURE_DIRECTIONAL_LIGHTING";
    
    this.shaderProgram = null;
    this.mvMatrix = this.mat4.create();
    this.pMatrix = this.mat4.create();
    this.mvMatrixStack = [];
    this.context.viewportWidth = this.canvas.width;
    this.context.viewportHeight = this.canvas.height;
    
    // init depth test
    this.context.enable(this.context.DEPTH_TEST);
};

// ======================================= GENERAL =======================================

WebGL.prototype.getContext = function(){
    return this.context;
};

WebGL.prototype.getCanvas = function(){
    return this.canvas;
};

WebGL.prototype.clear = function(){
    this.context.viewport(0, 0, this.context.viewportWidth, this.context.viewportHeight);
    this.context.clear(this.context.COLOR_BUFFER_BIT | this.context.DEPTH_BUFFER_BIT);
};

WebGL.prototype.setStage = function(func){
    this.stage = func;
};

// ======================================= ANIMATION =======================================

WebGL.prototype.isAnimating = function(){
    return this.animating;
};
WebGL.prototype.getFrame = function(){
    return this.frame;
};
WebGL.prototype.startAnimation = function(){
    this.animating = true;
    var date = new Date();
    this.startTime = date.getTime();
    this.lastTime = this.startTime;
    
    if (this.stage !== undefined) {
        this.stage();
    }
    
    this.animationLoop();
};
WebGL.prototype.stopAnimation = function(){
    this.animating = false;
};
WebGL.prototype.getTimeInterval = function(){
    return this.timeInterval;
};
WebGL.prototype.getTime = function(){
    return this.t;
};
WebGL.prototype.getFps = function(){
    return this.timeInterval > 0 ? 1000 / this.timeInterval : 0;
};
WebGL.prototype.animationLoop = function(){
    var that = this;
    
    this.frame++;
    var date = new Date();
    var thisTime = date.getTime();
    this.timeInterval = thisTime - this.lastTime;
    this.t += this.timeInterval;
    this.lastTime = thisTime;
    
    if (this.stage !== undefined) {
        this.stage();
    }
    
    if (this.animating) {
        requestAnimFrame(function(){
            that.animationLoop();
        });
    }
};

// ======================================= WEBGL WRAPPER =======================================

WebGL.prototype.save = function(){
    var copy = this.mat4.create();
    this.mat4.set(this.mvMatrix, copy);
    this.mvMatrixStack.push(copy);
};

WebGL.prototype.restore = function(){
    if (this.mvMatrixStack.length == 0) {
        throw "Invalid popMatrix!";
    }
    this.mvMatrix = this.mvMatrixStack.pop();
};

WebGL.prototype.getFragmentShaderGLSL = function(shaderType){
    switch (shaderType) {
        case this.BLUE_COLOR:
            return "#ifdef GL_ES\n" +
            "precision highp float;\n" +
            "#endif\n" +
            "void main(void) {\n" +
            "gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);\n" +
            "}";
        case this.VARYING_COLOR:
            return "#ifdef GL_ES\n" +
            "precision highp float;\n" +
            "#endif\n" +
            "varying vec4 vColor;\n" +
            "void main(void) {\n" +
            "gl_FragColor = vColor;\n" +
            "}";
        case this.TEXTURE:
            return "#ifdef GL_ES\n" +
            "precision highp float;\n" +
            "#endif\n" +
            "varying vec2 vTextureCoord;\n" +
            "uniform sampler2D uSampler;\n" +
            "void main(void) {\n" +
            "gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));\n" +
            "}";
        case this.TEXTURE_DIRECTIONAL_LIGHTING:
            return "#ifdef GL_ES\n" +
            "precision highp float;\n" +
            "#endif\n" +
            "varying vec2 vTextureCoord;\n" +
            "varying vec3 vLightWeighting;\n" +
            "uniform sampler2D uSampler;\n" +
            "void main(void) {\n" +
            "vec4 textureColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));\n" +
            "gl_FragColor = vec4(textureColor.rgb * vLightWeighting, textureColor.a);\n" +
            "}";
    }
};

WebGL.prototype.getVertexShaderGLSL = function(shaderType){
    switch (shaderType) {
        case this.BLUE_COLOR:
            return "attribute vec3 aVertexPosition;\n" +
            "uniform mat4 uMVMatrix;\n" +
            "uniform mat4 uPMatrix;\n" +
            "void main(void) {\n" +
            "gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);\n" +
            "}";
        case this.VARYING_COLOR:
            return "attribute vec3 aVertexPosition;\n" +
            "attribute vec4 aVertexColor;\n" +
            "uniform mat4 uMVMatrix;\n" +
            "uniform mat4 uPMatrix;\n" +
            "varying vec4 vColor;\n" +
            "void main(void) {\n" +
            "gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);\n" +
            "vColor = aVertexColor;\n" +
            "}";
        case this.TEXTURE:
            return "attribute vec3 aVertexPosition;\n" +
            "attribute vec2 aTextureCoord;\n" +
            "uniform mat4 uMVMatrix;\n" +
            "uniform mat4 uPMatrix;\n" +
            "varying vec2 vTextureCoord;\n" +
            "void main(void) {\n" +
            "gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);\n" +
            "vTextureCoord = aTextureCoord;\n" +
            "}";
        case this.TEXTURE_DIRECTIONAL_LIGHTING:
            return "attribute vec3 aVertexPosition;\n" +
            "attribute vec3 aVertexNormal;\n" +
            "attribute vec2 aTextureCoord;\n" +
            "uniform mat4 uMVMatrix;\n" +
            "uniform mat4 uPMatrix;\n" +
            "uniform mat3 uNMatrix;\n" +
            "uniform vec3 uAmbientColor;\n" +
            "uniform vec3 uLightingDirection;\n" +
            "uniform vec3 uDirectionalColor;\n" +
            "uniform bool uUseLighting;\n" +
            "varying vec2 vTextureCoord;\n" +
            "varying vec3 vLightWeighting;\n" +
            "void main(void) {\n" +
            "gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);\n" +
            "vTextureCoord = aTextureCoord;\n" +
            "if (!uUseLighting) {\n" +
            "vLightWeighting = vec3(1.0, 1.0, 1.0);\n" +
            "} else {\n" +
            "vec3 transformedNormal = uNMatrix * aVertexNormal;\n" +
            "float directionalLightWeighting = max(dot(transformedNormal, uLightingDirection), 0.0);\n" +
            "vLightWeighting = uAmbientColor + uDirectionalColor * directionalLightWeighting;\n" +
            "}\n" +
            "}";
    }
};

WebGL.prototype.initShaders = function(shaderType){
    this.initPositionShader();
    
    switch (shaderType) {
        case this.VARYING_COLOR:
            this.initColorShader();
            break;
        case this.TEXTURE:
            this.initTextureShader();
            break;
        case this.TEXTURE_DIRECTIONAL_LIGHTING:
            this.initTextureShader();
            this.initNormalShader();
            this.initLightingShader();
            break;
    }
};

WebGL.prototype.setShaderProgram = function(shaderType){
    var fragmentGLSL = this.getFragmentShaderGLSL(shaderType);
    var vertexGLSL = this.getVertexShaderGLSL(shaderType);
    
    var fragmentShader = this.context.createShader(this.context.FRAGMENT_SHADER);
    this.context.shaderSource(fragmentShader, fragmentGLSL);
    this.context.compileShader(fragmentShader);
    
    var vertexShader = this.context.createShader(this.context.VERTEX_SHADER);
    this.context.shaderSource(vertexShader, vertexGLSL);
    this.context.compileShader(vertexShader);
    
    this.shaderProgram = this.context.createProgram();
    this.context.attachShader(this.shaderProgram, vertexShader);
    this.context.attachShader(this.shaderProgram, fragmentShader);
    this.context.linkProgram(this.shaderProgram);
    
    if (!this.context.getProgramParameter(this.shaderProgram, this.context.LINK_STATUS)) {
        alert("Could not initialize shaders");
    }
    
    this.context.useProgram(this.shaderProgram);
    
    // once shader program is loaded, it's time to init the shaders
    this.initShaders(shaderType);
};

WebGL.prototype.perspective = function(viewAngle, minDist, maxDist){
    this.mat4.perspective(viewAngle, this.context.viewportWidth / this.context.viewportHeight, minDist, maxDist, this.pMatrix);
};

WebGL.prototype.identity = function(){
    this.mat4.identity(this.mvMatrix);
};

WebGL.prototype.translate = function(x, y, z){
    this.mat4.translate(this.mvMatrix, [x, y, z]);
};

WebGL.prototype.rotate = function(angle, x, y, z){
    this.mat4.rotate(this.mvMatrix, angle, [x, y, z]);
};

WebGL.prototype.initPositionShader = function(){
    this.shaderProgram.vertexPositionAttribute = this.context.getAttribLocation(this.shaderProgram, "aVertexPosition");
    this.context.enableVertexAttribArray(this.shaderProgram.vertexPositionAttribute);
    this.shaderProgram.pMatrixUniform = this.context.getUniformLocation(this.shaderProgram, "uPMatrix");
    this.shaderProgram.mvMatrixUniform = this.context.getUniformLocation(this.shaderProgram, "uMVMatrix");
};

WebGL.prototype.initColorShader = function(){
    this.shaderProgram.vertexColorAttribute = this.context.getAttribLocation(this.shaderProgram, "aVertexColor");
    this.context.enableVertexAttribArray(this.shaderProgram.vertexColorAttribute);
};

WebGL.prototype.initTextureShader = function(){
    this.shaderProgram.textureCoordAttribute = this.context.getAttribLocation(this.shaderProgram, "aTextureCoord");
    this.context.enableVertexAttribArray(this.shaderProgram.textureCoordAttribute);
    this.shaderProgram.samplerUniform = this.context.getUniformLocation(this.shaderProgram, "uSampler");
};

WebGL.prototype.initNormalShader = function(){
    this.shaderProgram.vertexNormalAttribute = this.context.getAttribLocation(this.shaderProgram, "aVertexNormal");
    this.context.enableVertexAttribArray(this.shaderProgram.vertexNormalAttribute);
    this.shaderProgram.nMatrixUniform = this.context.getUniformLocation(this.shaderProgram, "uNMatrix");
};

WebGL.prototype.initLightingShader = function(){
    this.shaderProgram.useLightingUniform = this.context.getUniformLocation(this.shaderProgram, "uUseLighting");
    this.shaderProgram.ambientColorUniform = this.context.getUniformLocation(this.shaderProgram, "uAmbientColor");
    this.shaderProgram.lightingDirectionUniform = this.context.getUniformLocation(this.shaderProgram, "uLightingDirection");
    this.shaderProgram.directionalColorUniform = this.context.getUniformLocation(this.shaderProgram, "uDirectionalColor");
};

WebGL.prototype.initTexture = function(texture){
    this.context.pixelStorei(this.context.UNPACK_FLIP_Y_WEBGL, true);
    this.context.bindTexture(this.context.TEXTURE_2D, texture);
    this.context.texImage2D(this.context.TEXTURE_2D, 0, this.context.RGBA, this.context.RGBA, this.context.UNSIGNED_BYTE, texture.image);
    this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_MAG_FILTER, this.context.NEAREST);
    this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_MIN_FILTER, this.context.LINEAR_MIPMAP_NEAREST);
    this.context.generateMipmap(this.context.TEXTURE_2D);
    this.context.bindTexture(this.context.TEXTURE_2D, null);
};

WebGL.prototype.createArrayBuffer = function(vertices){
    var buffer = this.context.createBuffer();
    buffer.numElements = vertices.length;
    this.context.bindBuffer(this.context.ARRAY_BUFFER, buffer);
    this.context.bufferData(this.context.ARRAY_BUFFER, new Float32Array(vertices), this.context.STATIC_DRAW);
    return buffer;
};

WebGL.prototype.createElementArrayBuffer = function(vertices){
    var buffer = this.context.createBuffer();
    buffer.numElements = vertices.length;
    this.context.bindBuffer(this.context.ELEMENT_ARRAY_BUFFER, buffer);
    this.context.bufferData(this.context.ELEMENT_ARRAY_BUFFER, new Uint16Array(vertices), this.context.STATIC_DRAW);
    return buffer;
};

WebGL.prototype.pushPositionBuffer = function(buffers){
    this.context.bindBuffer(this.context.ARRAY_BUFFER, buffers.positionBuffer);
    this.context.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute, 3, this.context.FLOAT, false, 0, 0);
};


WebGL.prototype.pushColorBuffer = function(buffers){
    this.context.bindBuffer(this.context.ARRAY_BUFFER, buffers.colorBuffer);
    this.context.vertexAttribPointer(this.shaderProgram.vertexColorAttribute, 4, this.context.FLOAT, false, 0, 0);
};

WebGL.prototype.pushTextureBuffer = function(buffers, texture){
    this.context.bindBuffer(this.context.ARRAY_BUFFER, buffers.textureBuffer);
    this.context.vertexAttribPointer(this.shaderProgram.textureCoordAttribute, 2, this.context.FLOAT, false, 0, 0);
    this.context.activeTexture(this.context.TEXTURE0);
    this.context.bindTexture(this.context.TEXTURE_2D, texture);
    this.context.uniform1i(this.shaderProgram.samplerUniform, 0);
};

WebGL.prototype.pushIndexBuffer = function(buffers){
    this.context.bindBuffer(this.context.ELEMENT_ARRAY_BUFFER, buffers.indexBuffer);
};

WebGL.prototype.pushNormalBuffer = function(buffers){
    this.context.bindBuffer(this.context.ARRAY_BUFFER, buffers.normalBuffer);
    this.context.vertexAttribPointer(this.shaderProgram.vertexNormalAttribute, 3, this.context.FLOAT, false, 0, 0);
};

WebGL.prototype.setMatrixUniforms = function(){
    this.context.uniformMatrix4fv(this.shaderProgram.pMatrixUniform, false, this.pMatrix);
    this.context.uniformMatrix4fv(this.shaderProgram.mvMatrixUniform, false, this.mvMatrix);
    
    var normalMatrix = this.mat3.create();
    this.mat4.toInverseMat3(this.mvMatrix, normalMatrix);
    this.mat3.transpose(normalMatrix);
    this.context.uniformMatrix3fv(this.shaderProgram.nMatrixUniform, false, normalMatrix);
};

WebGL.prototype.drawElements = function(buffers){
    this.setMatrixUniforms();
    
    // draw elements
    this.context.drawElements(this.context.TRIANGLES, buffers.indexBuffer.numElements, this.context.UNSIGNED_SHORT, 0);
};

WebGL.prototype.drawArrays = function(buffers){
    this.setMatrixUniforms();
    
    // draw arrays
    this.context.drawArrays(this.context.TRIANGLES, 0, buffers.positionBuffer.numElements / 3);
};

WebGL.prototype.enableLighting = function(){
    this.context.uniform1i(this.shaderProgram.useLightingUniform, true);
};

WebGL.prototype.setAmbientLighting = function(red, green, blue){
    this.context.uniform3f(this.shaderProgram.ambientColorUniform, parseFloat(red), parseFloat(green), parseFloat(blue));
};

WebGL.prototype.setDirectionalLighting = function(x, y, z, red, green, blue){
    // directional lighting
    var lightingDirection = [x, y, z];
    var adjustedLD = this.vec3.create();
    this.vec3.normalize(lightingDirection, adjustedLD);
    this.vec3.scale(adjustedLD, -1);
    this.context.uniform3fv(this.shaderProgram.lightingDirectionUniform, adjustedLD);
    
    // directional color
    this.context.uniform3f(this.shaderProgram.directionalColorUniform, parseFloat(red), parseFloat(green), parseFloat(blue));
};