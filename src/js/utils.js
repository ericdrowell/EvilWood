var MATH_PI = Math.PI;
var MATH_ROUND = Math.round;
var MATH_RANDOM = Math.random;

function u_convertNegZeroToPosZero(val) {
  if (1/val === -Infinity) {
    return val * -1;
  }
  return val;
}