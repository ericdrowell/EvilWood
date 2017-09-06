var elapsedTime = 0;
var lastTime = 0;
var gameState = 'menu';

function c_init() {
  gl_init(); // webgl
  w_init(); // world
  p_init(); // player
  v_init(); // view
  a_init(); // audio
  c_attachListeners();
}


function c_handleKeyDown(evt) {
  var keycode = ((evt.which) || (evt.keyCode));

  switch (keycode) {
    case 65:
      // a key (strafe left)
      if (gameState === 'playing') {
        player.sideMovement = -1;
      }
      break;
    case 87:
      // w key (move forward)
      if (gameState === 'playing') {
        player.straightMovement = 1;
      }
      break;
    case 68:
      // d key (strafe right)
      if (gameState === 'playing') {
        player.sideMovement = 1;
      }
      break;
    case 83: 
      // s key (move backwards)
      if (gameState === 'playing') {
        player.straightMovement = -1;
      }
      break;
    case 32:
      // space key
      if (gameState === 'playing') {
        player.straightMovement = 1;
        player.isClimbing = true;
      }
      break;
  }
  
};

function c_handleKeyUp(evt) {
  var keycode = ((evt.which) || (evt.keyCode));

  switch (keycode) {
    case 65:
      // a key
      player.sideMovement = 0;
      break;
    case 87:
      // w key
      player.straightMovement = 0;
      break;
    case 68:
      // d key
      player.sideMovement = 0;
      break;
    case 83:
      // s key
      player.straightMovement = 0;
      break;
    case 32:
      // space key
      player.straightMovement = 0;
      break;
  }
};

function c_handleMouseMove(evt) {
  if (c_isPointerLocked()) {
    // pitch (up and down)
    camera.pitch += evt.movementY * MATH_PI * 0.001 * -1;
    if (camera.pitch > MATH_PI/2) {
      camera.pitch = MATH_PI/2;
    }
    if (camera.pitch < -1 * MATH_PI/2) {
      camera.pitch = -1 * MATH_PI/2;
    }

    // yaw (side to side)
    camera.yaw += evt.movementX * MATH_PI * 0.001 * -1;
  }
}

function c_isPointerLocked() {
  return document.pointerLockElement === canvas;
}

function c_handleClick(evt) {
  // if pointer is not locked
  if (gameState === 'menu' || gameState === 'paused') {
    c_playGame();
  } 
  else if (gameState === 'playing') {
    p_fire();
  }
}

function c_playGame() {
  gameState = 'playing';
  canvas.requestPointerLock();
  v_hideScreen();
  a_playMusic('play');
}

function c_pauseGame() {
  gameState = 'paused';
  a_playMusic('menu');
  v_showPausedScreen();
}

function c_attachListeners() {
  document.addEventListener('keydown', function(evt) {
    c_handleKeyDown(evt);
  }, false);
  
  document.addEventListener('keyup', function(evt) {
    c_handleKeyUp(evt);
  }, false);

  document.addEventListener('mousemove', function(evt) {
    c_handleMouseMove(evt);
  }, false);

  document.addEventListener('click', function(evt) {
    c_handleClick(evt);
  }, false);

  document.addEventListener('pointerlockchange', function(evt) {
    if (!c_isPointerLocked() && gameState === 'playing') {
      c_pauseGame();
    }
  }, false);
};

function c_gameLoop() {
  var time = new Date().getTime();
  if (lastTime !== 0) {
    elapsedTime = time - lastTime;
  }
  v_updateCameraPos();
  p_updateLasers();
  w_addBlocks();
  v_render();

  lastTime = time;

  window.requestAnimationFrame(c_gameLoop);  
} 

// initialize game controller
c_init();
