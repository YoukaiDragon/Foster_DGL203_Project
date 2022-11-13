"use strict"

// Tyson Foster
// Script for the floodfill game, copied from the module 1 Javascript course Assignment

// *****************************************************************************
// #region Constants and Variables

// Canvas references
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

// UI references
const restartButton = document.querySelector("#restart");
const colorSelectButtons = document.querySelectorAll(".color-select");
const playerScoreText = document.querySelector("#score");
const undoButton = document.querySelector("#undo");

// Constants
const CELL_COLORS = {
    white: [255, 255, 255],
    black: [0, 0, 0],
    red: [255, 0, 0],
    green: [0, 255, 0], 
    blue: [0, 0, 255]
}
const CELLS_PER_AXIS = 9;
const CELL_WIDTH = canvas.width/CELLS_PER_AXIS;
const CELL_HEIGHT = canvas.height/CELLS_PER_AXIS;
const MAXIMUM_SCORE = CELLS_PER_AXIS * CELLS_PER_AXIS;

// Game objects
let replacementColor = CELL_COLORS.white;
let grids;
let playerScore = 0;
let validMove = false;

//highlight the button for the starting colour
colorSelectButtons.forEach(button => {
    if (button.name == "white") { //this should match the colour name for replacementColor
        highlightButton(button);
    }
});


// #endregion


// *****************************************************************************
// #region Game Logic

function startGame(startingGrid = []) {
    if (startingGrid.length === 0) {
        startingGrid = initializeGrid();
    }
    initializeHistory(startingGrid);
    playerScore = MAXIMUM_SCORE;
    render(grids[0]);
}

function initializeGrid() {
    const newGrid = [];
    for (let i = 0; i < CELLS_PER_AXIS * CELLS_PER_AXIS; i++) {
        newGrid.push(chooseRandomPropertyFrom(CELL_COLORS));
    }
    return newGrid;
}

function initializeHistory(startingGrid) {
    grids = [];
    grids.push(startingGrid);
}   

function render(grid) {
    for (let i = 0; i < grid.length; i++) {
        ctx.fillStyle = `rgb(${grid[i][0]}, ${grid[i][1]}, ${grid[i][2]})`;
        ctx.fillRect((i % CELLS_PER_AXIS) * CELL_WIDTH, Math.floor(i / CELLS_PER_AXIS) * CELL_HEIGHT, CELL_WIDTH, CELL_HEIGHT);
    }
    playerScoreText.innerText = "Score: " + playerScore;
}

function updateGridAt(mousePositionX, mousePositionY) {
    const gridCoordinates = convertCartesiansToGrid(mousePositionX, mousePositionY);
    const newGrid = grids[grids.length-1].slice(); //Makes a copy of the most recent grid state
    validMove = false; //resets the flag to indicate if the grid has changed
    floodFill(newGrid, gridCoordinates, newGrid[gridCoordinates.row * CELLS_PER_AXIS + gridCoordinates.column])
    if(validMove) { //only run if a change was made to the grid
        grids.push(newGrid);
        updatePlayerScore();
        render(grids[grids.length-1]);
    }
}

function updatePlayerScore() {
    if (playerScore > 0) { playerScore--; }
}

function floodFill(grid, gridCoordinate, colorToChange) { 
    if (arraysAreEqual(colorToChange, replacementColor)) { return } //The current cell is already the selected color
    else if (!arraysAreEqual(grid[gridCoordinate.row * CELLS_PER_AXIS + gridCoordinate.column], colorToChange)) { return }  //The current cell is a different color than the initially clicked-on cell
    else {
        grid[gridCoordinate.row * CELLS_PER_AXIS + gridCoordinate.column] = replacementColor;
        validMove = true; //sets flag to confirm at least one move has been made
        floodFill(grid, {column: Math.max(gridCoordinate.column - 1, 0), row: gridCoordinate.row}, colorToChange);
        floodFill(grid, {column: Math.min(gridCoordinate.column + 1, CELLS_PER_AXIS - 1), row: gridCoordinate.row}, colorToChange);
        floodFill(grid, {column: gridCoordinate.column, row: Math.max(gridCoordinate.row - 1, 0)}, colorToChange);
        floodFill(grid, {column: gridCoordinate.column, row: Math.min(gridCoordinate.row + 1, CELLS_PER_AXIS - 1)}, colorToChange);
    }
    return
}

function restart() {
    startGame(grids[0]);
}

// #endregion


// *****************************************************************************
// #region Event Listeners

canvas.addEventListener("mousedown", gridClickHandler);
function gridClickHandler() {
    updateGridAt(event.offsetX, event.offsetY);
}

restartButton.addEventListener("mousedown", restartClickHandler);
function restartClickHandler() {
    restart();
}

colorSelectButtons.forEach(button => {
    button.addEventListener("mousedown", () => {
        replacementColor = CELL_COLORS[button.name];
        //change the button colours so that the button for the active colour is highlighted green
        let buttons = document.getElementsByClassName("color-select");
        for (let i = 0; i < buttons.length; i++) {
            if (buttons.item(i).name == button.name) {
                highlightButton(buttons.item(i));
            } else {
                //Reset the buttons colours so only one button is highlighted at a time
                unHighlightButton(buttons.item(i));
            }
        }
    })
});

undoButton.addEventListener("mousedown", rollBackHistory);
function rollBackHistory() {
    //Check to avoid rolling back the initial grid
    if(grids.length > 1) {
        grids.pop();
        playerScore++;
        render(grids[grids.length-1]);
    }
}

// #endregion


// *****************************************************************************
// #region Helper Functions

// To convert canvas coordinates to grid coordinates
function convertCartesiansToGrid(xPos, yPos) {
    return {
        column: Math.floor(xPos/CELL_WIDTH),
        row: Math.floor(yPos/CELL_HEIGHT)
    };
}

// To choose a random property from a given object
function chooseRandomPropertyFrom(object) {
    const keys = Object.keys(object);
    return object[keys[ Math.floor(keys.length * Math.random()) ]]; //Truncates to integer
};

// To compare two arrays
function arraysAreEqual(arr1, arr2) {
    if (arr1.length != arr2.length) { return false }
    else {
        for (let i = 0; i < arr1.length; i++) {
            if (arr1[i] != arr2[i]) {
                return false;
            }
        }
        return true;
    }
}

//to highlight a button
function highlightButton(button) {
    button.style.backgroundColor = "Green";
    button.style.color = "White";
}

//to remove the highlight from a button
function unHighlightButton(button) {
    button.style.backgroundColor = "";
    button.style.color = "Black";
}

// #endregion

//Start game
startGame();