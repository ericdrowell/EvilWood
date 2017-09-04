/*
 * The view is responsible for the camera, loading textures, and rendering the world model
 */
var canvas = document.getElementById('scene');
var context = canvas.getContext('webgl');
var shaderProgram = context.createProgram();
var camera = {
  x: 0,
  y: 6,
  z: 0,
  pitch: 0,
  yaw: 0
};
var textures = {};

function v_init() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  gl_setShaderProgram(gl_getFragmentShaderGLSL(), gl_getVertexShaderGLSL());

  v_loadTextures(function() {
    c_gameLoop();

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

function v_renderGround(x, z) {
  gl_save();
  gl_translate(x * BLOCK_SIZE, -1.1, z * BLOCK_SIZE);
  gl_pushBuffers(buffers.plane, textures.metalFloor.glTexture);
  gl_drawElements(buffers.plane);
  gl_restore();
};

function v_renderTreeTops(x, z) {
  gl_save();
  gl_translate(x * BLOCK_SIZE, 25, z * BLOCK_SIZE);
  // use floor buffers with ceiling texture
  gl_pushBuffers(buffers.plane, textures.ceiling.glTexture);
  gl_drawElements(buffers.plane);
  gl_restore();
};

function v_renderTrees(x, z) {
  var trees = world.blocks[x][z].trees;

  for (var n = 0; n < trees.length; n++) {
    var tree = trees[n];
    var treeX = (x * BLOCK_SIZE) + tree.x;
    var treeY = (z * BLOCK_SIZE) + tree.z;

    for (var i = 0; i < tree.height/2; i++) {
      // trunk
      gl_save();
      gl_translate(treeX, i*2, treeY);
      gl_rotate(tree.rotationY, 0, 1, 0);
      gl_pushBuffers(buffers.cube, textures.tree.glTexture);
      gl_drawElements(buffers.cube);
      gl_restore();
    }

    // bottom level leaves
    gl_save();
    gl_translate(treeX, tree.height*0.4, treeY);
    gl_rotate(tree.rotationY, 0, 1, 0);
    gl_pushBuffers(buffers.smallPlane, textures.ceiling.glTexture);
    gl_drawElements(buffers.smallPlane);
    gl_restore();

    gl_save();
    gl_translate(treeX, tree.height*0.5, treeY);
    gl_rotate(tree.rotationY, 0, 1, 0);
    gl_scale(0.6, 1, 0.6);
    gl_pushBuffers(buffers.smallPlane, textures.ceiling.glTexture);
    gl_drawElements(buffers.smallPlane);
    gl_restore();

    gl_save();
    gl_translate(treeX, tree.height*0.6, treeY);
    gl_rotate(tree.rotationY, 0, 1, 0);
    gl_scale(0.5, 1, 0.5);
    gl_pushBuffers(buffers.smallPlane, textures.ceiling.glTexture);
    gl_drawElements(buffers.smallPlane);
    gl_restore();

    gl_save();
    gl_translate(treeX, tree.height*0.7, treeY);
    gl_rotate(tree.rotationY, 0, 1, 0);
    gl_scale(0.4, 1, 0.4);
    gl_pushBuffers(buffers.smallPlane, textures.ceiling.glTexture);
    gl_drawElements(buffers.smallPlane);
    gl_restore();

    gl_save();
    gl_translate(treeX, tree.height*0.8, treeY);
    gl_rotate(tree.rotationY, 0, 1, 0);
    gl_scale(0.3, 1, 0.3);
    gl_pushBuffers(buffers.smallPlane, textures.ceiling.glTexture);
    gl_drawElements(buffers.smallPlane);
    gl_restore();

    gl_save();
    gl_translate(treeX, tree.height*0.9, treeY);
    gl_rotate(tree.rotationY, 0, 1, 0);
    gl_scale(0.2, 1, 0.2);
    gl_pushBuffers(buffers.smallPlane, textures.ceiling.glTexture);
    gl_drawElements(buffers.smallPlane);
    gl_restore();

    // top level leaves
    gl_save();
    gl_translate(treeX, tree.height*0.98, treeY);
    gl_rotate(tree.rotationY, 0, 1, 0);
    gl_scale(0.1, 1, 0.1);
    gl_pushBuffers(buffers.smallPlane, textures.ceiling.glTexture);
    gl_drawElements(buffers.smallPlane);
    gl_restore();
  }
};

function v_renderBlocks() {
  // only render blocks potentially within view
  var blocks = w_getSurroundingBlocks();

  blocks.forEach(function(block) {
    var x = block.x;
    var z = block.z;
    v_renderGround(x, z);
    v_renderTrees(x, z);
    //v_renderTreeTops(x, z);
  });
}

function v_updateCameraPos() {

  if (player.straightMovement !== 0) {
    var direction = player.straightMovement === 1 ? -1 : 1;
    var distEachFrame = direction * PLAYER_SPEED * elapsedTime / 1000;

    if (player.isClimbing) {
      camera.y += distEachFrame * -1;
    }
    else {
      camera.z += distEachFrame * Math.cos(camera.yaw);
      camera.x += distEachFrame * Math.sin(camera.yaw);
    }
  }
  
  if (player.sideMovement !== 0) {
    var direction = player.sideMovement === 1 ? 1 : -1;
    var distEachFrame = direction * PLAYER_SPEED * elapsedTime / 1000;
    camera.z += distEachFrame * Math.cos(camera.yaw + Math.PI / 2);
    camera.x += distEachFrame * Math.sin(camera.yaw + Math.PI / 2);
  }


  
};

function v_render() {
  gl_clear();

  // set field of view at 45 degrees
  // set viewing range between 0.1 and 100 units away.
  gl_perspective(45, 0.1, 150.0);
  gl_identity();
  
  // enable lighting
  gl_enableLighting();
  gl_setAmbientLighting(0.5, 0.5, 0.5);


  //gl_setDirectionalLighting(-0.25, -0.25, -1, 0.8, 0.8, 0.8);
  gl_setPointLighting(0.5, 0.5, 0.5);

  gl_rotate(-camera.pitch, 1, 0, 0);
  gl_rotate(-camera.yaw, 0, 1, 0);
  gl_translate(-camera.x, -camera.y, -camera.z);
  
  v_renderBlocks();
};