/*
 * The view is responsible for the camera, loading textures, and rendering the world model
 */

var camera,
    elapsedTime = 0,
    lastTime = 0;

function v_init() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  camera = {
    x: 0,
    y: 1.5,
    z: 5,
    pitch: 0,
    yaw: 0
  }
  
  gl_setShaderProgram();
  v_loadTextures(function() {
    v_gameLoop();

  });
}

function v_loadTextures(callback) {
  textures = {
    tree: {
      encoding: '{{TREE_TRUNK_ENCODING}}'
    },
    metalFloor: {
      encoding: '{{GROUND_ENCODING}}'
    },
    ceiling: {
      encoding: '{{LEAVES_ENCODING}}'
    }
  };

  var loadedImages = 0;
  var numImages = 0;
  for (var key in textures) {
    (function() {
      numImages++;
      var texture = textures[key];
      var glTexture = texture.glTexture = context.createTexture();
      var image = texture.image = new Image();
      image.onload = function() {
        gl_initTexture(glTexture, image);
        if (++loadedImages >= numImages) {
          callback();
        }
      };
      
      image.src = texture.encoding;
    })();
  }
};

function v_renderFloor() {
  gl_save();
  gl_translate(0, -1.1, 0);
  gl_pushBuffers(buffers.plane, textures.metalFloor.glTexture);
  gl_drawElements(buffers.plane);
  gl_restore();
};

function v_renderCeiling() {
  gl_save();
  gl_translate(0, 8.9, 0);
  // use floor buffers with ceiling texture
  gl_pushBuffers(buffers.plane, textures.ceiling.glTexture);
  gl_drawElements(buffers.plane);
  gl_restore();
};

function v_renderTrees() {
  for (var n = 0; n < world.trees.length; n++) {
    var tree = world.trees[n];

    for (var i = 0; i < tree.height; i++) {
      gl_save();
      gl_translate(tree.x, i*2, tree.z);
      gl_rotate(tree.rotationY, 0, 1, 0);
      gl_pushBuffers(buffers.cube, textures.tree.glTexture);
      gl_drawElements(buffers.cube);
      gl_restore();
    }
  }
};

function v_updateCameraPos() {
  if (player.straightMovement !== 0) {
    var direction = player.straightMovement === 1 ? -1 : 1;
    var distEachFrame = direction * PLAYER_SPEED * elapsedTime / 1000;
    camera.z += distEachFrame * Math.cos(camera.yaw);
    camera.x += distEachFrame * Math.sin(camera.yaw);
  }
  
  if (player.sideMovement !== 0) {
    var direction = player.sideMovement === 1 ? 1 : -1;
    var distEachFrame = direction * PLAYER_SPEED * elapsedTime / 1000;
    camera.z += distEachFrame * Math.cos(camera.yaw + Math.PI / 2);
    camera.x += distEachFrame * Math.sin(camera.yaw + Math.PI / 2);
  }
};

function v_gameLoop() {
  var time = new Date().getTime();
  if (lastTime !== 0) {
    elapsedTime = time - lastTime;
  }
  v_render();

  lastTime = time;

  window.requestAnimationFrame(v_gameLoop);  
} 

function v_render() {
  v_updateCameraPos();

  gl_clear();

  // set field of view at 45 degrees
  // set viewing range between 0.1 and 100 units away.
  gl_perspective(45, 0.1, 150.0);
  gl_identity();
  
  // enable lighting
  gl_enableLighting();
  gl_setAmbientLighting(0.5, 0.5, 0.5);


  gl_setDirectionalLighting(-0.25, -0.25, -1, 0.8, 0.8, 0.8);

  gl_rotate(-camera.pitch, 1, 0, 0);
  gl_rotate(-camera.yaw, 0, 1, 0);
  gl_translate(-camera.x, -camera.y, -camera.z);
  
  v_renderFloor();
  v_renderCeiling();
  v_renderTrees();
};