const assert = require('assert');
const { getCombination } = require('../src/util.js');

describe("getCombination", function() {
  it("should return empty array with empty lists", function() {
    assert.deepEqual(getCombination([],[]),[]);
  });

  it("should appropriate output according to input", function() {
    let result = [ [ -1, -1 ],
      [ -1, 0 ],
      [ -1, 1 ],
      [ 0, -1 ],
      [ 0, 0 ],
      [ 0, 1 ],
      [ 1, -1 ],
      [ 1, 0 ],
      [ 1, 1 ] ]
    assert.deepEqual(getCombination([-1,0,1],[-1,0,1]), result);
  });
});
