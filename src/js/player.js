// constants
var PLAYER_SPEED = 40; // units / s
var PLAYER_HEIGHT = 6;
var LASER_SPEED = 200; // units / s
var LASER_EXPIRE = 1; // s
var LASER_START_DIST_FROM_PLAYER = 2;
var player = {};

function p_init() {
  player = {
    straightMovement: 0,
    sideMovement: 0,
    isClimbing: false,
    lasers: []
  };
}

function p_fire() {
  player.lasers.push({
    x: camera.x + Math.sin(camera.yaw + MATH_PI/4) * LASER_START_DIST_FROM_PLAYER,
    y: camera.y - Math.tan(camera.pitch) * LASER_START_DIST_FROM_PLAYER - PLAYER_HEIGHT*0.2,
    z: camera.z + Math.cos(camera.yaw + MATH_PI/4) * LASER_START_DIST_FROM_PLAYER,
    pitch: camera.pitch,
    yaw: camera.yaw,
    expire: (new Date() / 1000) + LASER_EXPIRE
  });
}

function p_updateLasers() {
  var distEachFrame = LASER_SPEED * elapsedTime / 1000 *-1;
  player.lasers.forEach(function(laser) {
    laser.z += Math.cos(laser.yaw) * distEachFrame;
    laser.y += Math.tan(laser.pitch) * distEachFrame * -1;
    laser.x += Math.sin(laser.yaw) * distEachFrame;
  });
}