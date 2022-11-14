/* eslint-disable require-jsdoc */
'use strict';

// *****************************************************************************
// #region Constants and Variables

// Body refrence
const body = document.querySelector('body');

// Canvas references
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

// UI references
const restartButton = document.querySelector('#restart');
const undoButton = document.querySelector('#undo');
const playerTurnText = document.querySelector('#turn-text');
const winnerText = document.querySelector('#winner-text');

// Constants
const CELLS_PER_AXIS = 3;
const CELL_WIDTH = canvas.width/CELLS_PER_AXIS;
const CELL_HEIGHT = canvas.height/CELLS_PER_AXIS;

// Game objects
let grids;
let playerTurnX = true; // true for X turn, false for O turn
let validMove = false; // flag to indicate if move changed any tiles
let winner = ''; // stores the symbol representing the winner

// #endregion


// *****************************************************************************
// #region Game Logic

function startGame(startingGrid = []) {
  if (startingGrid.length === 0) {
    startingGrid = initializeGrid();
  }
  initializeHistory(startingGrid);
  playerTurnX = true;
  winner = '';
  winnerText.textContent = '';
  render(grids[0]);
}

function initializeGrid() {
  const newGrid = [];
  for (let i = 0; i < CELLS_PER_AXIS * CELLS_PER_AXIS; i++) {
    newGrid.push('');
  }
  return newGrid;
}

function initializeHistory(startingGrid) {
  grids = [];
  grids.push(startingGrid);
}

function rollBackHistory() {
  if (grids.length > 1) {
    grids = grids.slice(0, grids.length-1);
    playerTurnX = !playerTurnX;
    winner = '';
    winnerText.textContent = '';
  }
}

function render(grid) {
  let row;
  let col;
  ctx.beginPath();
  for (let i = 0; i < grid.length; i++) {
    row = (i % CELLS_PER_AXIS);
    col = Math.floor(i / CELLS_PER_AXIS);
    if (grid[i] == 'X') {
      ctx.moveTo(row * CELL_WIDTH + 20, col * CELL_HEIGHT + 20);
      ctx.lineTo((row + 1) * CELL_WIDTH -20, (col + 1) * CELL_HEIGHT - 20);
      ctx.moveTo(row * CELL_WIDTH + 20, (col + 1) * CELL_HEIGHT - 20);
      ctx.lineTo((row + 1) * CELL_WIDTH - 20, col * CELL_HEIGHT + 20);
      ctx.stroke();
    } else if (grid[i] == 'O') {
      // move the 'pen' to the start of the circle
      ctx.moveTo(row * CELL_WIDTH + CELL_WIDTH * 3/ 4,
          col * CELL_HEIGHT + CELL_HEIGHT / 2 );
      ctx.arc(row * CELL_WIDTH + CELL_WIDTH / 2,
          col * CELL_HEIGHT + CELL_HEIGHT / 2,
          CELL_WIDTH / 4, 0, 2 * Math.PI);
    } else {
      // Ensure tiles from undone moves and games are blank
      ctx.clearRect(row * CELL_WIDTH, col * CELL_HEIGHT,
          CELL_WIDTH, CELL_HEIGHT);
    }
  }
  for (let i = 1; i < 3; i++) {
    ctx.moveTo(i * CELL_WIDTH, 0);
    ctx.lineTo(i * CELL_WIDTH, 3 * CELL_HEIGHT);
    ctx.moveTo(0, i * CELL_HEIGHT);
    ctx.lineTo(3 * CELL_WIDTH, i * CELL_HEIGHT);
  }
  ctx.stroke();
  if (playerTurnX) {
    playerTurnText.textContent = 'X';
  } else {
    playerTurnText.textContent = 'O';
  }
}

function updateGridAt(mousePositionX, mousePositionY) {
  if (winner == '') {
    validMove = false;
    const gridCoordinates =
      convertCartesiansToGrid(mousePositionX, mousePositionY);
    const newGrid = grids[grids.length-1].slice();
    placeSymbol(newGrid, gridCoordinates);
    if (validMove) { // only do if a new symbol was placed
      grids.push(newGrid);
      playerTurnX = !playerTurnX;
      // Check for a winner
      winner = checkWin(newGrid, gridCoordinates);
      if (winner != '') {
        winnerText.textContent = `${winner} Wins!`;
      } else if (!newGrid.includes('')) {
        // All tiles filled with no winner
        winnerText.textContent = 'Tie Game!';
      }
    }
  }
}

function placeSymbol(grid, gridCoordinate) {
  if (grid[gridCoordinate.row * CELLS_PER_AXIS + gridCoordinate.column] == '') {
    validMove = true;
    if (playerTurnX) {
      grid[gridCoordinate.row * CELLS_PER_AXIS + gridCoordinate.column] = 'X';
    } else {
      grid[gridCoordinate.row * CELLS_PER_AXIS + gridCoordinate.column] = 'O';
    }
  }
}

function checkWin(grid, gridCoordinates) {
  // coordinates of the most recently placed symbol
  const row = gridCoordinates.row;
  const col = gridCoordinates.column;
  // check the row and column belonging to the symbol just placed
  if (grid[row * CELLS_PER_AXIS] != '' &&
      grid[row * CELLS_PER_AXIS] == grid[row * CELLS_PER_AXIS + 1] &&
      grid[row * CELLS_PER_AXIS] == grid[row * CELLS_PER_AXIS + 2]) {
    return grid[row * CELLS_PER_AXIS];
  }
  if (grid[0 + col] != '' &&
      grid[0 + col] == grid[CELLS_PER_AXIS + col] &&
      grid[0 + col] == grid[2 * CELLS_PER_AXIS + col]) {
    return grid[0 + col];
  }
  /* check the diagonals, since we'd have to check if the last placed
    tile was on a diagonal anyway */
  if (grid[4] != '' &&
      (grid[4] == grid[0] && grid[4] == grid[8]) ||
      (grid[4] == grid[2] && grid[4] == grid[6])) {
    return grid[4];
  }
  return '';
}

function restart() {
  // only restart if a move has been made to reduce calls to render()
  if (grids.length > 1) startGame(grids[0]);
}

// #endregion


// *****************************************************************************
// #region Event Listeners

canvas.addEventListener('mousedown', gridClickHandler);
function gridClickHandler(event) {
  updateGridAt(event.offsetX, event.offsetY);
}

restartButton.addEventListener('mousedown', restartClickHandler);
function restartClickHandler() {
  restart();
}

undoButton.addEventListener('mousedown', undoLastMove);
function undoLastMove() {
  rollBackHistory();
}

// Render new grid after handling canvas, undo, or rotate event listener
body.addEventListener('click', (event) => {
  if ((event.target == canvas && validMove) ||
      event.target == undoButton) {
    render(grids[grids.length-1]);
  }
});

// #endregion

// *****************************************************************************
// #region Helper Functions

// To convert canvas coordinates to grid coordinates
function convertCartesiansToGrid(xPos, yPos) {
  return {
    column: Math.floor(xPos/CELL_WIDTH),
    row: Math.floor(yPos/CELL_HEIGHT),
  };
}

// #endregion

// Start game
startGame();
