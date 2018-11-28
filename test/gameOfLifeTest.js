const assert = require('assert');
const {nextGeneration,
  createInitialBoard,
  findNeighbourCells,
  getNeighbourCellState,
  nextGenerationState,
  canBeAlive,
  canBeDead,
  isStateSame,
  boardGenerator,
  filterNeighbours,
  createAliveCells } = require('../src/gameOfLife.js');

const contains = (list,element) => list.some(e=>e[0]===element[0] && e[1]===element[1]);
const isSame = (actualList,expectedList) => actualList.every(contains.bind(null,expectedList));
const isSameArity = (actualList,expectedList) => actualList.length == expectedList.length;

describe('nextGeneration',() => {
  it('should generate an empty generation for a current generation that contains only one live cell',() => {
    let currentGeneration = [[0,1]];
    let bounds = {topLeft: [0,0], bottomRight: [3,3]};
    let actualNextGen = nextGeneration(currentGeneration,bounds);
    assert.deepEqual(actualNextGen,[]);
  });

  it('should generate a vertical blinker as the next step of a horizontal blinker',() => {
    let currentGeneration = [[0,1],[1,1],[2,1]];
    let expectedNextGen = [[1,0],[1,1],[1,2]]
    let bounds = {topLeft: [0,0], bottomRight: [3,3]};
    let actualNextGen = nextGeneration(currentGeneration,bounds);
    assert.ok(isSame(actualNextGen,expectedNextGen));
    assert.ok(isSameArity(actualNextGen,expectedNextGen));
  });

  it('should kill cells not within bounds',() => {
    let currentGeneration = [[0,1],[0,2],[0,3]];
    let expectedNextGen = []
    let bounds = {topLeft: [1,1], bottomRight: [3,3]};
    let actualNextGen = nextGeneration(currentGeneration,bounds);
    assert.ok(isSame(actualNextGen,expectedNextGen));
    assert.ok(isSameArity(actualNextGen,expectedNextGen));
  });
});

describe("createInitialBoard", function() {
  it("should replace given position elements of board  with 'alive'", function() {
    let result = [ [ 'alive', 'dead' ], [ 'dead', 'alive' ] ];
    assert.deepEqual(createInitialBoard(2,2,[[0,0],[1,1]]), result);
  });

  it("should replace given position elements of board  with 'alive'", function() {
    let result = [ [ 'alive', 'dead', 'alive' ],[ 'dead', 'alive', 'dead' ],[ 'dead', 'dead', 'alive' ] ]
    assert.deepEqual(createInitialBoard(3,3,[[0,0],[1,1],[2,2],[0,2]]), result);
  });
});

describe("findNeighbourCells", function() {
  describe("for corner cells", function() {
    it("should return three neighbour cells", function() {
      let result = [ [ 0, 1 ], [ 1, 0 ], [ 1, 1 ] ];
      assert.deepEqual(findNeighbourCells(3,3,[0,0]),result);
    });
  });

  describe("for edge cells", function() {
    it("should return five neighbour cells", function() {
      let result = [ [ 0, 0 ], [ 0, 2 ], [ 1, 0 ], [ 1, 1 ], [ 1, 2 ] ]; 
      assert.deepEqual(findNeighbourCells(3,3,[0,1]), result);
    });
  });

  describe("for middle cells", function() {
    it("should return nine neighbour cells", function() {
      let result = [ [ 1, 0 ],
        [ 1, 2 ],
        [ 0, 0 ],
        [ 0, 1 ],
        [ 0, 2 ],
        [ 2, 0 ],
        [ 2, 1 ],
        [ 2, 2 ] ];
      assert.deepEqual(findNeighbourCells(3,3,[1,1]), result);
    });
  });
});

describe("getNeighbourCellState", function() {
  describe("for all alive neighbour cells", function() {
    it("should return array with all alive states and empty array for dead states in object", function() {
      let cell = [0,0];
      let aliveCells = [[1,1],[1,0],[0,1]];
      let board = createInitialBoard(3,3,aliveCells);
      let result = { alive: [ 'alive', 'alive', 'alive' ], dead: [] }; 
      assert.deepEqual(getNeighbourCellState(3,3,board,cell),result);
    });
  });

  describe("for all dead neighbour cells", function() {
    it("should return array with all dead states and empty array for alive states in object", function() {
      let cell = [0,0];
      let aliveCells = [[2,0],[2,1],[2,2]];
      let board = createInitialBoard(3,3,aliveCells);
      let result = { alive: [], dead: [ 'dead', 'dead', 'dead' ] }; 
      assert.deepEqual(getNeighbourCellState(3,3,board,cell),result);
    });
  });

  describe("for some dead and some alive cells", function() {
    it("should return object with arrays of alive and dead cells", function() {
      let cell = [1,1];
      let aliveCells = [[2,0],[2,1],[2,2]];
      let board = createInitialBoard(3,3,aliveCells);
      let result ={ alive: [ 'alive', 'alive', 'alive' ],
        dead: [ 'dead', 'dead', 'dead', 'dead', 'dead' ] };
      assert.deepEqual(getNeighbourCellState(3,3,board,cell),result);
    });
  });
});

describe("nextGenerationState", function() {
  describe("for all alive cells and more than 2 iterations", function() {
    it("should return board of same length with all dead cells", function() {
      let iterations = 3;
      let aliveCells = [[0,0],[0,1],[0,2],[1,0],[1,1],[1,2],[2,0],[2,1],[2,2]];
      let result = [ [ 'dead', 'dead', 'dead' ],
        [ 'dead', 'dead', 'dead' ],
        [ 'dead', 'dead', 'dead' ] ];
      assert.deepEqual(nextGenerationState(3,3,aliveCells,iterations),result);
    });
  });

  describe("for all dead cells", function() {
    it("should return array same board after any number of iterations", function() {
      let iterations = 6;
      let aliveCells = [];
      let result = [ [ 'dead', 'dead', 'dead' ],
        [ 'dead', 'dead', 'dead' ],
        [ 'dead', 'dead', 'dead' ] ];
      assert.deepEqual(nextGenerationState(3,3,aliveCells,iterations),result);
    });
  });

  describe("for some dead and some alive cells", function() {
    it("should return apropriate board after given iterations", function() {
      let iterations = 4;
      let aliveCells =[[2,2],[1,0],[3,4],[3,3],[3,1],[0,0],[2,0]];
      let result = [ [ 'dead', 'dead', 'dead', 'dead', 'dead' ],
        [ 'dead', 'dead', 'dead', 'dead', 'dead' ],
        [ 'alive', 'alive', 'alive', 'dead', 'dead' ],
        [ 'alive', 'alive', 'dead', 'dead', 'dead' ],
        [ 'dead', 'dead', 'alive', 'dead', 'dead' ] ];
      assert.deepEqual(nextGenerationState(5,5,aliveCells,iterations),result);
    });
  });
});

describe("boardGenerator", function() {
  it("should return a Array of Arrays of same given length", function() {
    let result = [ [ 'dead', 'dead' ], [ 'dead', 'dead' ] ];
    assert.deepEqual(boardGenerator(2,2), result);
  });

  it("should return a Array of Arrays of same given length", function() {
    let result = [ [ 'dead', 'dead', 'dead' ],[ 'dead', 'dead', 'dead' ] ]
    assert.deepEqual(boardGenerator(2,3), result);
  });
});

describe("filterNeighbours", function() {
  describe("for negative index", function() {
    it("should return false", function() {
      let isReal = filterNeighbours(2,2);
      assert.deepEqual(isReal([-1,0]), false);
      assert.deepEqual(isReal([0,-1]), false);
    });
  });

  describe("for index greater than size", function() {
    it("should return false ", function() {
      let isReal = filterNeighbours(3,3);
      assert.deepEqual(isReal([3,2]),false);
      assert.deepEqual(isReal([3,3]),false);
      assert.deepEqual(isReal([2,3]),false);
    });
  });

  describe("for index which is non-negative and lesser than size", function() {
    it("should return true ", function() {
      let isReal = filterNeighbours(4,5);
      assert.deepEqual(isReal([3,2]),true);
      assert.deepEqual(isReal([3,3]),true);
      assert.deepEqual(isReal([2,3]),true);
    });
  });
});
