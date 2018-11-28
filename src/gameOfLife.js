const boardGenerator = function(rows, columns) {
  let board = new Array(rows).fill([]);
  return board.map(element => new Array(columns).fill("dead"));
}

const createAliveCells = function(cells, position) {
  cells[position[0]][position[1]] = "alive";
  return cells;
}

const isRealNeighbour = function(size) {
  return function(index) {
    return !(index < 0 || index >= size);
  }
}

const filterNeighbours = function(rows, columns) {
  return function(position) {
    return isRealNeighbour(rows)(position[0]) && isRealNeighbour(columns)(position[1]);
  }
}

const createInitialBoard = function(rows, columns, aliveCells) {
  let emptyBoard = boardGenerator(rows, columns);
  return aliveCells.reduce(createAliveCells, emptyBoard);
}

const findNeighbourCells = function(rows, columns, cell) {
  let neighbourCells = [ [cell[0], cell[1]-1], [cell[0],cell[1]+1] ];

  neighbourCells.push([cell[0]-1, cell[1]-1]);
  neighbourCells.push([cell[0]-1, cell[1]]);
  neighbourCells.push([cell[0]-1, cell[1]+1]);
  neighbourCells.push([cell[0]+1, cell[1]-1]);
  neighbourCells.push([cell[0]+1, cell[1]]);
  neighbourCells.push([cell[0]+1, cell[1]+1]);

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
  let cellState = { alive:[], dead:[]};
  let neighbours = findNeighbourCells(rows,columns, cell);
  return neighbours.reduce(extractCellState(board), cellState);
}

const canBeAlive = function(neighbourCellStates) {
  return neighbourCellStates["alive"].length == 3;
}

const canBeDead = function(neighbourCellStates) {
  let aliveCount = neighbourCellStates["alive"].length;
  return (aliveCount < 2 || aliveCount > 3);
}

const isStateSame = function(neighbourCellStates) {
  return !canBeAlive(neighbourCellStates) && !canBeDead(neighbourCellStates);
}

const updateState = function(neighbourCells, index){
  return function(initializer, cell, column){
    let neighbourCellStates = neighbourCells([index, column]);
    canBeAlive(neighbourCellStates) && initializer.push("alive");
    canBeDead(neighbourCellStates) && initializer.push("dead");
    isStateSame(neighbourCellStates) && initializer.push(cell);
    return initializer;
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
      board[row][column]=="alive" && aliveIndexes.push([row,column]);
    }
  }
  return aliveIndexes;
}

const nextGeneration = function(currGeneration,bounds) {
  let rows = (bounds.bottomRight[0]-bounds.topLeft[0])+1;
  let columns = (bounds.bottomRight[1]-bounds.topLeft[1])+1;
  let nextGenerationWorld = nextGenerationState(rows, columns, currGeneration,1);
  return getAliveCellIndex(nextGenerationWorld);
}

module.exports = { nextGeneration };
