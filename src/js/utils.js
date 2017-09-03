function u_convertNegZeroToPosZero(val) {
  if (1/val === -Infinity) {
    return val * -1;
  }
  return val;
}