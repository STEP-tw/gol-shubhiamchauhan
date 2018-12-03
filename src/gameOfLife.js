const { getCombination } = require('./util.js');

const boardGenerator = function(rows, columns) {
  let board = new Array(rows).fill([]);
  return board.map(element => new Array(columns).fill(0));
}

const createAliveCells = function(cells, position) {
  cells[position[0]][position[1]] = 1;
  return cells;
}

const isRealNeighbour = function(size, index) {
  return !(index < 0 || index >= size);
}

const filterNeighbours = function(rows, columns) {
  return function(position) {
    return isRealNeighbour(rows,position[0]) && isRealNeighbour(columns,position[1]);
  }
}

const createInitialBoard = function(rows, columns, aliveCells) {
  let emptyBoard = boardGenerator(rows, columns);
  aliveCells = aliveCells.filter(filterNeighbours(rows, columns));
  return aliveCells.reduce(createAliveCells, emptyBoard);
}

const addToListValue = function(cell, difference) {
  let result = [].concat(cell[0]+difference[0]);
  result.push(cell[1]+difference[1]);
  return result;
}

const findNeighbourCells = function(rows, columns, cell) {
  let differenceFromNeighbour = getCombination([-1,0,1],[-1,0,1]);
  differenceFromNeighbour.splice(4,1);
  let addDifferenceToNeighbour = addToListValue.bind(null, cell);
  let neighbourCells = differenceFromNeighbour.map(addDifferenceToNeighbour);
  return neighbourCells.filter(filterNeighbours(rows, columns));
}

const extractCellState = function(board) {
  return function(cellState, position) {
    let state = board[position[0]][position[1]];
    cellState[state].push(state);
    return cellState;
  }
}

const getNeighbourCellState = function(rows, columns, board, cell) {
  let cellState = { 1:[], 0:[]};
  let neighbours = findNeighbourCells(rows,columns, cell);
  return neighbours.reduce(extractCellState(board), cellState);
}

const canBeAlive = function(neighbourCellStates) {
  return neighbourCellStates[1].length == 3;
}

const canBeDead = function(neighbourCellStates) {
  let aliveCount = neighbourCellStates[1].length;
  return (aliveCount < 2 || aliveCount > 3);
}

const isStateSame = function(neighbourCellStates) {
  return !canBeAlive(neighbourCellStates) && !canBeDead(neighbourCellStates);
}

const updateState = function(neighbourCells, index){
  return function(nextGenWorld, cell, column){
    let neighbourCellStates = neighbourCells([index, column]);
    canBeAlive(neighbourCellStates) && nextGenWorld.push(1);
    canBeDead(neighbourCellStates) && nextGenWorld.push(0);
    isStateSame(neighbourCellStates) && nextGenWorld.push(cell);
    return nextGenWorld;
  }
}

const updateRow = function(neighbourCells){
  return function(row , index) {
    return row.reduce(updateState(neighbourCells,index),[]);
  }
}

const nextGenerationState = function(rows,columns,aliveCells, iteration) {
  let board = createInitialBoard(rows,columns,aliveCells);
  for(let counter = 0; counter < iteration; counter++) {
    let neighbourCells = getNeighbourCellState.bind(null,rows,columns,board)
    board = board.map(updateRow(neighbourCells));
  }
  return board;
}

const getAliveCellIndex = function(board) {
  let aliveIndexes = [];
  for(let row = 0; row<board.length; row++) {
    for(let column = 0; column<board[row].length; column++) {
      board[row][column]==1 && aliveIndexes.push([row,column]);
    }
  }
  return aliveIndexes;
}

const relativeCurrGeneration = function(topLeftBound) {
  return function(generation, aliveCellIndex) {
    generation.push([aliveCellIndex[0]-topLeftBound[0],aliveCellIndex[1]-topLeftBound[1]]);
    return generation;
  }
}

const relativeNextGeneration = function(topLeftBound) {
  return function(generation, aliveCellIndex) {
    generation.push([aliveCellIndex[0]+topLeftBound[0],aliveCellIndex[1]+topLeftBound[1]]);
    return generation;
  }
}

const nextGeneration = function(currGeneration,bounds) {
  currGeneration = currGeneration.reduce(relativeCurrGeneration(bounds.topLeft),[]);
  let rows = (bounds.bottomRight[0] - bounds.topLeft[0]) + 1;
  let columns = (bounds.bottomRight[1] - bounds.topLeft[1]) + 1;
  let nextGenerationWorld = nextGenerationState(rows, columns, currGeneration, 1);
  let nextGenAliveCells = getAliveCellIndex( nextGenerationWorld );
  return nextGenAliveCells.reduce(relativeNextGeneration( bounds.topLeft ), []);
}

module.exports = { nextGeneration,
  createInitialBoard,
  findNeighbourCells,
  getNeighbourCellState,
  nextGenerationState,
  canBeAlive,
  canBeDead,
  isStateSame,
  boardGenerator,
  filterNeighbours,
  createAliveCells };
