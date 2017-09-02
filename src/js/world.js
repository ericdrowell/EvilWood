var world = {};

function w_init() {
  // also export window to model for debugging
  world = {
    trees: []
  };

  w_inittrees();
}

function w_inittrees() {
  var treeRange = 45;
  // randomize 20 trees
  for (var n = 0; n < 20; n++) {
    world.trees.push({
      x: (Math.random() * treeRange * 2) - treeRange,
      z: (Math.random() * treeRange * 2) - treeRange,
      rotationY: Math.random() * Math.PI * 2,
      height: 10
    });
  }
};