var canvas = document.getElementById('scene'), 
    context = canvas.getContext('webgl'),
    shaderProgram = null, 
    mvMatrix = mat4.create(), 
    pMatrix = mat4.create(),
    mvMatrixStack = [];