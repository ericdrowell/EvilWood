var elapsedTime = 0;
var lastTime = 0;

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

  if (c_isPointerLocked()) {
    switch (keycode) {
      case 65:
        // a key
        player.sideMovement = -1;
        break;
      case 87:
        // w key
        player.straightMovement = 1;
        break;
      case 68:
        // d key
        player.sideMovement = 1;
        break;
      case 83:
        // s key
        player.straightMovement = -1;
        break;
      case 32:
        // space key
        player.isClimbing = true;
        break;
    }
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
  if (!c_isPointerLocked()) {
    canvas.requestPointerLock();
  } 
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
};

function c_gameLoop() {
  var time = new Date().getTime();
  if (lastTime !== 0) {
    elapsedTime = time - lastTime;
  }
  v_updateCameraPos();
  w_addBlocks();
  v_render();

  lastTime = time;

  window.requestAnimationFrame(c_gameLoop);  
} 

// initialize game controller
c_init();
