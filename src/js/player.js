// constants
var PLAYER_SPEED = 40; // units / s

var player = {};

function p_init() {
  player = {
    straightMovement: 0,
    sideMovement: 0,
    isClimbing: false
  };
}