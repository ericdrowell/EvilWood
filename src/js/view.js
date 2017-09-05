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
      encoding: '{{TREE_ENCODING}}'
    },
    ground: {
      encoding: '{{GROUND_ENCODING}}'
    },
    leaves: {
      encoding: '{{LEAVES_ENCODING}}'
    },
    beacon: {
      encoding: '{{BEACON_ENCODING}}'
    },
    shadow: {
      encoding: '{{SHADOW_ENCODING}}'
    },
    monster: {
      encoding: '{{MONSTER_ENCODING}}'
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

function v_renderBeacon() {
  var beacon = world.beacon;

  gl_save();
  gl_translate(beacon.x, 6, beacon.z);
  gl_pushBuffers(buffers.cube, textures.beacon.glTexture);
  gl_drawElements(buffers.cube);
  gl_restore();

  gl_save();
  gl_translate(beacon.x, -1.99, beacon.z);
  gl_pushBuffers(buffers.cube, textures.shadow.glTexture);
  gl_drawElements(buffers.cube);
  gl_restore();
}

function v_renderMonsters() {
  world.monsters.forEach(function(monster) {
    gl_save();
    gl_translate(monster.x, 0, monster.z);
    gl_pushBuffers(buffers.cube, textures.monster.glTexture);
    gl_drawElements(buffers.cube);
    gl_restore();

    gl_save();
    gl_translate(monster.x, 2, monster.z);
    gl_pushBuffers(buffers.cube, textures.monster.glTexture);
    gl_drawElements(buffers.cube);
    gl_restore();

    gl_save();
    gl_translate(monster.x, 4, monster.z);
    gl_pushBuffers(buffers.cube, textures.monster.glTexture);
    gl_drawElements(buffers.cube);
    gl_restore();

    gl_save();
    gl_translate(monster.x, 6, monster.z);
    gl_pushBuffers(buffers.cube, textures.monster.glTexture);
    gl_drawElements(buffers.cube);
    gl_restore();
  });




}


function v_renderGround(x, z) {
  gl_save();
  gl_translate(x * BLOCK_SIZE, -1.1, z * BLOCK_SIZE);
  gl_pushBuffers(buffers.plane, textures.ground.glTexture);
  gl_drawElements(buffers.plane);
  gl_restore();
};

function v_renderTrees(x, z) {
  var trees = world.blocks[x][z].trees;

  for (var n = 0; n < trees.length; n++) {
    var tree = trees[n];
    var treeX = (x * BLOCK_SIZE) + tree.x;
    var treeZ = (z * BLOCK_SIZE) + tree.z;
    

    for (var i = 0; i < tree.height/4; i++) {
      var treeY = i*4;
      // trunk
      gl_save();
      gl_translate(treeX, treeY, treeZ);
      gl_rotate(tree.rotationY, 0, 1, 0);
      gl_scale(2, 2, 2);
      gl_pushBuffers(buffers.cube, textures.tree.glTexture);
      gl_drawElements(buffers.cube);
      gl_restore();
    }

    LEAVES_GEOMETRY.forEach(function(leaf) {
      gl_save();
      gl_translate(treeX + leaf[0]*8, treeY + leaf[2]*8, treeZ + leaf[1]*8);
      gl_scale(4, 4, 4);
      gl_pushBuffers(buffers.cube, textures.leaves.glTexture);
      gl_drawElements(buffers.cube);
      gl_restore();
    });
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
  gl_setAmbientLighting(0, 0, 0);


  //gl_setDirectionalLighting(-0.25, -0.25, -1, 0.8, 0.8, 0.8);
  gl_setPointLighting(0.9, 0.9, 0.9);

  gl_rotate(-camera.pitch, 1, 0, 0);
  gl_rotate(-camera.yaw, 0, 1, 0);
  gl_translate(-camera.x, -camera.y, -camera.z);
  
  v_renderBlocks();
  v_renderBeacon();
  v_renderMonsters();
};