/*
 x  0  1  2  x
 3  4  5  6  7
 8  9  20 10 11
 12 13 14 15 16
 x  17 18 19 x
*/
var LEAVES_GEOMETRY = [
  [-1, -2, -2], // 0
  [0, -2, -2], // 1
  [1, -2, -2], // 2
  [-2, -1, -2], // 3
  [-1, -1, -1], // 4
  [0, -1, -1], // 5
  [1, -1, -1], // 6
  [2, -1, -2], // 7
  [-2, 0, -2], // 8
  [-1, 0, -1], // 9
  [1, 0, -1], // 10
  [2, 0, -2], // 11
  [-2, 1, -2], // 12
  [-1, 1, -1], // 13
  [0, 1, -1], // 14
  [1, 1, -1], // 15
  [2, 1, -2], // 16
  [-1, 2, -2], // 17
  [0, 2, -2], // 18
  [1, 2, -2], // 19
  [0, 0, 0], // 20
];

var world = {};
var numBlocks = 0;

function w_init() {
  world = {
    // big blocky areas of the world.  Infinite world generation works by dynamically
    // assembling blocks
    blocks: {},
    beacon: {},
    monsters: [],
    lasers: [],
    // sparse 3d grid used for fast collision detection
    grid: {}
  };

  numBlocks = 0;

  w_addBlock(0, 0);
  w_addBeacon();
}

function w_getGridPoint(point) {
  return {
    x: MATH_ROUND(point.x/GRID_CELL_SIZE),
    y: MATH_ROUND(point.y/GRID_CELL_SIZE),
    z: MATH_ROUND(point.z/GRID_CELL_SIZE)
  }
}

function w_updateMonsters() {
  world.monsters.forEach(function(monster, n) {
    // if monster is dead
    if (monster.health <= 0) {
      monster.points.forEach(function(point) {
        w_removeGridCell(point);
      }); 
      world.monsters.splice(n, 1);
    }
    else {
      var firstPoint = monster.points[0];

      // move monster closer to player
      var playerDirection = vec3.create([firstPoint.x - camera.x, 0, firstPoint.z - camera.z]);
      vec3.normalize(playerDirection);
      var distEachFrame = MONSTER_SPEED * elapsedTime / 1000;

      monster.points.forEach(function(point) {
        w_removeGridCell(point);
    
        point.x += playerDirection[0]*distEachFrame*-1;
        point.z += playerDirection[2]*distEachFrame*-1;

        w_removeGridCell(point);
        w_addObjectToGrid(monster, point);
      });
    } 
  }); 
}

function w_updateLasers() {
  var distEachFrame = LASER_SPEED * elapsedTime / 1000 *-1;
  world.lasers.forEach(function(laser, n) {
    laser.z += Math.cos(laser.yaw) * distEachFrame;
    laser.y += Math.tan(laser.pitch) * distEachFrame * -1;
    laser.x += Math.sin(laser.yaw) * distEachFrame;

    var intersectingObj = w_getGridObject(laser);

    if (intersectingObj && intersectingObj.type === 'monster') {
      if (intersectingObj.timout) {
        clearTimeout(intersectingObj.timeout);
      }

      intersectingObj.isHit = true;
      
      world.lasers.splice(n, 1);

      intersectingObj.timeout = setTimeout(function() {
        intersectingObj.isHit = false;
        intersectingObj.health -= 1;
      }, 100);
    }

    // handle laser expire
    if (laser.expire <= now) {
      world.lasers.splice(n, 1);
    }
  });
}

function w_removeGridCell(point) {
  var gridPoint = w_getGridPoint(point);

  for (var x=-1; x<=1; x++) {
    for (var z=-1; z<=1; z++) {
      var key = w_getGridCellKey({
        x: gridPoint.x + x,
        y: gridPoint.y,
        z: gridPoint.z + z
      });
      world.grid[key] = null;
    }
  }


}

function w_getGridObject(point) {
  var gridPoint = w_getGridPoint(point);
  var key = w_getGridCellKey(gridPoint);

  return world.grid[key];
}

function w_getGridCellKey(gridPoint) {
  return gridPoint.x + ':' + gridPoint.y + ':' + gridPoint.z;
}

function w_addObjectToGrid(obj, point) {
  var gridPoint = w_getGridPoint(point);

  // add to all cells around point
  for (var x=-1; x<=1; x++) {
    for (var z=-1; z<=1; z++) {
      var key = w_getGridCellKey({
        x: gridPoint.x + x,
        y: gridPoint.y,
        z: gridPoint.z + z
      });
      world.grid[key] = obj;
    }
  }
  
}

function w_getNearbyObjects(point, dist) {
  var gridPoint = w_getGridPoint(point);
  var objects = [];

  if (!dist) {
    dist = 3;
  }

  // add to all cells around point
  for (var x=-dist; x<=dist; x++) {
    for (var z=-dist; z<=dist; z++) {
      var key = w_getGridCellKey({
        x: gridPoint.x + x,
        y: gridPoint.y,
        z: gridPoint.z + z
      });

      if (world.grid[key]) {
        objects.push(world.grid[key]);
      }
    }
  }

  return objects;
}

function w_isNearbyBeacon(point) {
  var objects = w_getNearbyObjects({
    x: point.x,
    y: 6,
    z: point.z
  });

  for (var key in objects) {
    if (objects[key].type === 'beacon') {
      return true;
    }
  }

  return false;
}

function w_getNearbyTree(point) {
  var objects = w_getNearbyObjects({
    x: point.x,
    y: 0,
    z: point.z
  }, 5);

  for (var key in objects) {
    if (objects[key].type === 'tree') {
      return objects[key];
    }
  }

  return null;
}

function w_getNearbyMonsters(point) {
  var objects = w_getNearbyObjects({
    x: point.x,
    y: 0,
    z: point.z
  });

  var monsters = [];

  for (var key in objects) {
    if (objects[key].type === 'monster') {
      monsters.push(objects[key]);
    }
  }

  return monsters;
}

function w_addBeacon() {
  world.beacon = {
    type: 'beacon',
    points: [
      {
        x: BEACON_DISTANCE * 2 * MATH_RANDOM() - BEACON_DISTANCE,
        y: 6,
        z: BEACON_DISTANCE * 2 * MATH_RANDOM() - BEACON_DISTANCE
      }
    ],
    rotationY: 0
  }

  w_addObjectToGrid(world.beacon, world.beacon.points[0]);
}

function w_addBlock(x, z) {

  if (world.blocks[x] === undefined) {
    world.blocks[x] = {};
  }

  world.blocks[x][z] = {
    trees: []
  }

  // add trees
  for (var n = 0; n < TREES_PER_BLOCK; n++) {
    var height = 60 + MATH_RANDOM() * 60;
    //var height = 1;
    var newTree = {
      type: 'tree',
      points: [],
      rotationY: MATH_RANDOM() * MATH_PI * 2,
      height: height
    };

    var treeX = (x * BLOCK_SIZE) + (MATH_RANDOM() * BLOCK_SIZE) - BLOCK_SIZE/2;
    var treeZ = (z * BLOCK_SIZE) + (MATH_RANDOM() * BLOCK_SIZE) - BLOCK_SIZE/2;

    for (var i = 0; i < height/4; i++) {
      var treeY = i*4;
      var newTreePoint = {
        x: treeX,
        y: treeY,
        z: treeZ
      };

      newTree.points.push(newTreePoint);

      w_addObjectToGrid(newTree, newTreePoint);
    }

    world.blocks[x][z].trees.push(newTree);
  }

  // add monsters
  if (numBlocks >= 9) {
    var monsterX = (x * BLOCK_SIZE) + (MATH_RANDOM() * BLOCK_SIZE) - BLOCK_SIZE/2;
    var monsterZ = (z * BLOCK_SIZE) + (MATH_RANDOM() * BLOCK_SIZE) - BLOCK_SIZE/2;

    for (var n = 0; n < MONSTERS_PER_BLOCK; n++) {
      var newMonster = {
        type: 'monster',
        points: [],
        health: 3
      }

      for (var i=0; i<4; i++) {
        var newMonsterPoint = {
          x: monsterX,
          y: i*2,
          z: monsterZ
        };
        newMonster.points.push(newMonsterPoint);

        w_addObjectToGrid(newMonster, newMonsterPoint);
      }
      world.monsters.push(newMonster);
    }
  }

  numBlocks++;
}

/*
 *     -
 *   1 2 3
 * - 8 0 4 +
 *   7 6 5 
 *     +
 */ 
function w_getSurroundingBlocks() {
  var x = u_convertNegZeroToPosZero(MATH_ROUND(camera.x/BLOCK_SIZE));
  var z = u_convertNegZeroToPosZero(MATH_ROUND(camera.z/BLOCK_SIZE));

  return [
    {x: x, z: z}, // 0
    {x: x-1, z: z-1}, // 1
    {x: x, z: z-1}, // 2
    {x: x+1, z: z-1}, // 3
    {x: x+1, z: z}, // 4
    {x: x+1, z: z+1}, // 5
    {x: x, z: z+1}, // 6
    {x: x-1, z: z+1}, // 7
    {x: x-1, z: z} // 8
  ];
}
   
function w_addBlocks() {
  var blocks = w_getSurroundingBlocks();

  blocks.forEach(function(block) {
    var bx = block.x;
    var bz = block.z;

    if (world.blocks[bx] === undefined) {
      world.blocks[bx] = {};
    }

    if (world.blocks[bx][bz] === undefined) {
      w_addBlock(bx, bz);
    }
  });
}
