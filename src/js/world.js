var TREES_PER_BLOCK = 20;
var MONSTERS_PER_BLOCK = 1;

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

var world = {
  blocks: {},
  beacon: {},
  monsters: []
};

function w_init() {
  w_addBlock(0, 0);
  w_addBlocks();
  w_addBeacon();
}

function w_addBeacon() {
  world.beacon = {
    x: 0,
    z: -50,
    rota4ionY: 0
  }
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
    world.blocks[x][z].trees.push({
      x: (MATH_RANDOM() * BLOCK_SIZE) - BLOCK_SIZE/2,
      z: (MATH_RANDOM() * BLOCK_SIZE) - BLOCK_SIZE/2,
      rotationY: MATH_RANDOM() * MATH_PI * 2,
      height: 60 + MATH_RANDOM() * 60
    });
  }

  // add monsters
  for (var n = 0; n < MONSTERS_PER_BLOCK; n++) {
    world.monsters.push({
      x: (x * BLOCK_SIZE) + (MATH_RANDOM() * BLOCK_SIZE) - BLOCK_SIZE/2,
      z: (z * BLOCK_SIZE) + (MATH_RANDOM() * BLOCK_SIZE) - BLOCK_SIZE/2
    });
  }
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

function w_isNearTree() {
  return true;
}
