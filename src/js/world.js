var world = {
  blocks: {}
};

function w_init() {
  w_addBlock(0, 0);
  w_addBlocks();
}

function w_addBlock(x, z) {
  if (world.blocks[x] === undefined) {
    world.blocks[x] = {};
  }

  world.blocks[x][z] = {
    trees: []
  }

  var treeRange = 45;
  // randomize 20 trees
  for (var n = 0; n < 20; n++) {
    world.blocks[x][z].trees.push({
      x: (Math.random() * treeRange * 2) - treeRange,
      z: (Math.random() * treeRange * 2) - treeRange,
      rotationY: Math.random() * Math.PI * 2,
      height: 10
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
