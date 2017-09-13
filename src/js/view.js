var INSTRUCTIONS_TEXT = '[WASD]&nbsp; MOVE AROUND&nbsp;&nbsp;&nbsp;<br>[CLICK] SHOOT&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>[SPACE] CLIMB TREE &nbsp;&nbsp;&nbsp;<br>[ESC]&nbsp;&nbsp; PAUSE &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>';

/*
 * The view is responsible for the camera, loading textures, and rendering the world model
 */
var canvas = document.getElementById('scene');
var context = canvas.getContext('webgl');
var shaderProgram = context.createProgram();
var camera = {};
var textures = {};
var overlayEl = document.getElementById('a');
var healthEl = document.getElementById('b');
var openMenuTime = 0;

function v_init() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  gl_setShaderProgram(gl_getFragmentShaderGLSL(), gl_getVertexShaderGLSL());

  v_loadTextures(function() {
    c_gameLoop();
  });
}

function v_createTexture(colors) {
  var canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 16;
  var context = canvas.getContext('2d');

  for (var x=0; x<16; x++) {
    for (var y=0; y<16; y++) {
      context.save();
      context.fillStyle = '#' + u_getRandomElement(colors);
      context.fillRect(x, y, 2, 2);
      context.restore();
    }
  }

  return canvas.toDataURL();
}

function v_showMenuScreen() {
  overlayEl.innerHTML = 'EVIL WOOD<br><br>YOU ARE LOST IN AN EVIL FOREST<br>CLIMB TREES TO SEE THE SKY<br>LET THE NORTH STAR GUIDE YOU<br>FIND THE RED FAIRY TO ESCAPE<br>BEWARE THE DARK SOULS<br><br>' + INSTRUCTIONS_TEXT + '<br><br>CLICK SCREEN TO START'
  openMenuTime = new Date().getTime();
}

function v_showPausedScreen() {
  overlayEl.innerHTML = 'PAUSED<br><br>' + INSTRUCTIONS_TEXT + '<br>CLICK SCREEN TO CONTINUE'
  openMenuTime = new Date().getTime();
}

function v_showWinScreen() {
  overlayEl.innerHTML = 'YOU WIN!<br><br>CONGRATULATIONS ON ESCAPING EVIL WOOD<br>YOUR CUNNING, SKILL, AND BRAVERY<br>WILL BE REMEMBERED FOR ALL TIME<br><br>CLICK SCREEN TO PLAY AGAIN'
  openMenuTime = new Date().getTime();
}

function v_showDiedScreen() {
  overlayEl.innerHTML = 'YOU DIED<br><br>DARK SOULS DEVOUR YOUR BODY<br>DARKNESS FALLS AND EVIL WOOD FADES AWAY<br>YOUR HORRIFIC FATE IS LOST FOREVER<br><br>CLICK SCREEN TO TRY AGAIN'
  openMenuTime = new Date().getTime();
}

function v_hideScreen() {
  overlayEl.innerHTML = ''
}

function v_loadTextures(callback) {
  textures = {
    tree: {
      encoding: v_createTexture([
        '4a493b', 
        '534e3e', 
        '3d3527', 
        '524534', 
        '46433b', 
        '443e2b', 
        '271c10'
      ])
    },
    ground: {
      encoding: v_createTexture([
        '2c2e20',
        '282e26',
        '303e1a',
        '444b31',
        '393c2c',
        '33352f',
        '333435',
        '2c2e23',
        '3d3f36',
        '3d3a30',
        '464339',
        '514938',
        '6a6554'
      ])
    },
    leaves: {
      encoding: v_createTexture([
        '51531f',
        '4e5315',
        '545617',
        '4c4d13',
        '252108',
        '33370a',
        '474d13',
        '383c0d',
      ])
    },
    red: {
      encoding: v_createTexture(['ff0000'])
    },
    shadow: {
      encoding: v_createTexture(['000000'])
    },
    monster: {
      encoding: v_createTexture([
        '5f3b88', 
        '56367e',
        '4d3279', 
        '553783',
        '412d6f', 
        '3b2866',
        '4b337a', 
        '563986',
        '4e3179', 
        '54367f',
        '663f8f', 
        '382460'
      ])
    },
    orange: {
      encoding: v_createTexture(['ffcc00'])
    },
    white: {
      encoding: v_createTexture(['ffffff'])
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

  if (gameState !== 'won') {
    gl_save();
    gl_translate(beacon.x, beacon.y, beacon.z);
    gl_rotate(beacon.rotationY, 0, 1, 0);
    gl_pushBuffers(buffers.cube, textures.red.glTexture, false);
    gl_drawElements(buffers.cube);
    gl_restore();

    // beacon shadow
    gl_save();
    gl_translate(beacon.x, -1.99, beacon.z);
    gl_rotate(beacon.rotationY, 0, 1, 0);
    gl_pushBuffers(buffers.cube, textures.shadow.glTexture, true);
    gl_drawElements(buffers.cube);
    gl_restore();

    // star
    var starDirection = vec3.create([beacon.x - camera.x, 0, beacon.z - camera.z]);

    vec3.normalize(starDirection); 
    gl_save();
    gl_translate(camera.x, 140, camera.z);
    gl_translate(starDirection[0] * STAR_DIST, 0, starDirection[2] * STAR_DIST);
    gl_pushBuffers(buffers.cube, textures.orange.glTexture, false);
    gl_drawElements(buffers.cube);
    gl_restore();
  }
}

function v_renderMonsters() {
  world.monsters.forEach(function(monster) {
    var texture = monster.isHit ? 'white' : 'monster'
    monster.points.forEach(function(point) {
      gl_save();
      gl_translate(point.x, point.y, point.z);
      gl_pushBuffers(buffers.cube, textures[texture].glTexture, true);
      gl_drawElements(buffers.cube);
      gl_restore();
    })
  });
}


function v_renderGround(x, z) {
  gl_save();
  gl_translate(x * BLOCK_SIZE, -1.1, z * BLOCK_SIZE);
  gl_pushBuffers(buffers.plane, textures.ground.glTexture, true);
  gl_drawElements(buffers.plane);
  gl_restore();
};

function v_renderTrees(x, z) {
  if (world.blocks[x] && world.blocks[x][z]){
    var trees = world.blocks[x][z].trees;

    for (var n = 0; n < trees.length; n++) {
      var tree = trees[n];

      tree.points.forEach(function(point) {
        // trunk
        gl_save();
        gl_translate(point.x, point.y, point.z);
        gl_rotate(tree.rotationY, 0, 1, 0);
        gl_scale(2, 2, 2);
        gl_pushBuffers(buffers.cube, textures.tree.glTexture, true);
        gl_drawElements(buffers.cube);
        gl_restore();
      });

      var lastPoint = tree.points[tree.points.length-1];
      var treeX = lastPoint.x;
      var treeY = lastPoint.y;
      var treeZ = lastPoint.z;

      LEAVES_GEOMETRY.forEach(function(leaf) {
        gl_save();
        gl_translate(treeX + leaf[0]*8, treeY + leaf[2]*8, treeZ + leaf[1]*8);
        gl_scale(4, 4, 4);
        gl_pushBuffers(buffers.cube, textures.leaves.glTexture, true);
        gl_drawElements(buffers.cube);
        gl_restore();
      });
    }
  }
};

function v_renderHealth() {
  var str = '';

  for (var n=0; n<player.health; n++) {
    str += '<span>&hearts;</span>';
  }

  healthEl.innerHTML = str;
}

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

function v_renderLasers() {
  world.lasers.forEach(function(laser) {
    gl_save();
    gl_translate(laser.x, laser.y, laser.z);
    gl_rotate(laser.yaw, 0, 1, 0);
    gl_rotate(laser.pitch, 1, 0, 0);
    gl_scale(0.2, 0.2, 5);
    gl_pushBuffers(buffers.cube, textures.orange.glTexture, false);
    gl_drawElements(buffers.cube);
    gl_restore();
  });
}

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
  
  v_renderHealth()
  v_renderBlocks();
  v_renderBeacon();
  v_renderMonsters();
  v_renderLasers();
};