var view = new View(),
    model = new Model();

function c_init() {
  gl_init();
  gl_setShaderProgram();
  c_attachListeners();
  
  var sources = {
    crate: GROUND_TEXTURE_ENCODING,
    metalFloor: GROUND_TEXTURE_ENCODING,
    metalWall: GROUND_TEXTURE_ENCODING,
    ceiling: GROUND_TEXTURE_ENCODING
  };
  
  c_loadTextures(sources, function() {
    view.stage();
  });
}

function c_loadTextures(sources, callback) {
  var textures = model.textures;
  var loadedImages = 0;
  var numImages = 0;
  for (var src in sources) {
    (function() {
      var key = src;
      numImages++;
      textures[key] = context.createTexture();
      textures[key].image = new Image();
      textures[key].image.onload = function() {
        gl_initTexture(textures[key]);
        if (++loadedImages >= numImages) {
            callback();
        }
      };
      
      textures[key].image.src = sources[key];
    })();
  }
};

function c_handleKeyDown(evt) {
  var keycode = ((evt.which) || (evt.keyCode));
  switch (keycode) {
    case 37:
      // left key
      model.sideMovement = model.LEFT;
      break;
    case 38:
      // up key
      model.straightMovement = model.FORWARD;
      break;
    case 39:
      // right key
      model.sideMovement = model.RIGHT;
      break;
    case 40:
      // down key
      model.straightMovement = model.BACKWARD;
      break;
  }
};

function c_handleKeyUp(evt) {
  var keycode = ((evt.which) || (evt.keyCode));
  switch (keycode) {
    case 37:
      // left key
      model.sideMovement = model.STILL;
      break;
    case 38:
      // up key
      model.straightMovement = model.STILL;
      break;
    case 39:
      // right key
      model.sideMovement = model.STILL;
      break;
    case 40:
      // down key
      model.straightMovement = model.STILL;
      break;
  }
};

function c_attachListeners() {
  document.addEventListener('keydown', function(evt) {
    c_handleKeyDown(evt);
  }, false);
  
  document.addEventListener('keyup', function(evt) {
    c_handleKeyUp(evt);
  }, false);
};

// initialize game controller
c_init();
            