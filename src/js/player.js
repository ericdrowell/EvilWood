var player = {};

function p_init() {
  player = {
    straightMovement: 0,
    sideMovement: 0,
    isClimbing: false,
    health: 3
  };
}

function p_updatePlayerPos() {

  // handle moving forward and backward
  if (player.straightMovement !== 0) {
    var direction = player.straightMovement === 1 ? -1 : 1;
    var distEachFrame = direction * PLAYER_SPEED * elapsedTime / 1000;

    if (player.isClimbing) {
      camera.y += distEachFrame * -1;

      if (camera.y < PLAYER_HEIGHT) {
        camera.y = PLAYER_HEIGHT;
        player.isClimbing = false;
      }

      if (player.isClimbing && camera.y > nearbyTree.height + 10) {
        camera.y = nearbyTree.height + 10;
      }
    }
    else {
      camera.z += distEachFrame * Math.cos(camera.yaw);
      camera.x += distEachFrame * Math.sin(camera.yaw);
    }
  }
  
   // handle strafe
  if (player.sideMovement !== 0) {
    var direction = player.sideMovement === 1 ? 1 : -1;
    var distEachFrame = direction * PLAYER_SPEED * elapsedTime / 1000;
    camera.z += distEachFrame * Math.cos(camera.yaw + Math.PI / 2);
    camera.x += distEachFrame * Math.sin(camera.yaw + Math.PI / 2);
  }

  // handle touching the beacon and winning the game
  if (w_isNearbyBeacon(camera) && gameState !== 'won') {
    c_win();
  }

  // handle touching the beacon and winning the game
  if (player.health <= 0 && gameState !== 'died') {
    c_die();
  }

  // handle monsters hurting you
  w_getNearbyMonsters(camera).forEach(function(monster) {
    if (!monster.cooldown) {
      p_hurt();
      monster.cooldown = true;
      setTimeout(function() {
        monster.cooldown = false;
      }, MONSTER_COOLDOWN_TIME * 1000);
    }
  });


};

function p_hurt() {
  player.health -= 1;
}

function p_fire() {
  world.lasers.push({
    x: camera.x + Math.sin(camera.yaw + MATH_PI/4) * LASER_START_DIST_FROM_PLAYER,
    y: camera.y - Math.tan(camera.pitch) * LASER_START_DIST_FROM_PLAYER - PLAYER_HEIGHT*0.2,
    z: camera.z + Math.cos(camera.yaw + MATH_PI/4) * LASER_START_DIST_FROM_PLAYER,
    pitch: camera.pitch,
    yaw: camera.yaw,
    expire: ((new Date() / 1000) + LASER_EXPIRE) * 1000
  });
}
