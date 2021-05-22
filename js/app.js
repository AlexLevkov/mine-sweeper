('use strict');

const GAME_START = '😀';
const GAME_LOSE = '😒';
const GAME_WIN = '😎';
const MINE = '💣';
const FLAG = '🚩';

var gBoard;
var gLevel;
var gGame;
var gTimer;
var gGameArr;
var gFirstClick;
var gLives;
var gHints;
var gIsHint;
var gSafeClicks;
var gIsSafeClick;
var gIsPlayerPutMines;
var gIsBoardManual;

function init() {
  gGame = { isOn: true, shownCount: 14, markedCount: 2, secsPassed: 0 };
  gFirstClick = false;
  gTimer = false;
  gIsHint = false;
  gIsSafeClick = false;
  gIsPlayerPutMines = false;
  gIsBoardManual = false;
  gLevel = 4;
  gLives = 3;
  gHints = 3;
  gSafeClicks = 3;
  gGameArr = [];
  gBoard = buildBoard(gLevel); // updating the model
  renderBoard(gBoard, '.board-container'); // updating the DOM

  // updating the DOM
  var elGameStatusIcon = document.querySelector('h2 span');
  elGameStatusIcon.innerText = GAME_START;
  var elCell = document.querySelector('table');
  elCell.classList.remove('blink_me');
  var elLiveLeft = document.querySelector('.lives');
  elLiveLeft.innerText = ' ' + gLives;
  var elHint = document.querySelector('.hint');
  elHint.innerText = '| Hints: ❔❔❔';
  var elBestScore = document.querySelector('.best-score');
  elBestScore.innerText = localStorage.lvl1BestScore;
  var elSafeCliksBtn = document.querySelector('.safe-click');
  elSafeCliksBtn.innerText = gSafeClicks;
}

// this function is receiving the game level from the player in the DOM
// the user can choose by clicking one of the three game levels: Begginer(4) Medium(8) Expert(12)
function gameLvl(lvl) {
  var elBestScore = document.querySelector('.best-score');
  resetGame(); // if user decide to leave suddenly to another level
  gLevel = lvl;
  gBoard = buildBoard(gLevel);
  renderBoard(gBoard, '.board-container');

  // this switch allows to create the needed victory conditions
  switch (gLevel) {
    case 4:
      gGame.shownCount = 4 * 4 - 2;
      gGame.markedCount = 2;
      elBestScore.innerText = localStorage.lvl1BestScore;

      break;
    case 8:
      gGame.shownCount = 8 * 8 - 12;
      gGame.markedCount = 12;
      elBestScore.innerText = localStorage.lvl2BestScore;
      break;
    case 12:
      gGame.shownCount = 12 * 12 - 30;
      gGame.markedCount = 30;
      elBestScore.innerText = localStorage.lvl3BestScore;
      break;
  }
}

// This function render the model (gBorad) to the DOM
function renderBoard(mat, selector) {
  var strHTML = '<tbody>';
  var cellDisplay;
  for (var i = 0; i < mat.length; i++) {
    strHTML += '<tr>';
    for (var j = 0; j < mat[0].length; j++) {
      var cell = mat[i][j];
      var className = `cell cell${i}-${j}`;
      if (cell.isShown) {
        className += ' open-cell';
        if (cell.isMine) {
          cellDisplay = '💣';
        } else if (cell.isFlaged) {
          cellDisplay = '🚩';
        } else if (cell.minesAroundCount > 0) {
          cellDisplay = cell.minesAroundCount;
        } else {
          cellDisplay = ' ';
        }
      } else {
        cellDisplay = ' ';
      }

      strHTML += `<td oncontextmenu="cellMarked(event,this,${i},${j})" onclick="cellClicked(event,this,${i},${j})" class="${className}">${cellDisplay}</td>`;
    }
    strHTML += '</tr>';
  }
  strHTML += '</tbody>';
  var elContainer = document.querySelector(selector);
  elContainer.innerHTML = strHTML;
}

// this function is activated after left click on a cell
// the function reveals the content inside
function cellClicked(event, elCell, i, j) {
  // return if game over
  if (!gGame.isOn) {
    return;
  }

  // manual mode allowing the player to put the mines himself
  if (gIsPlayerPutMines) {
    manualyPutMines(i, j);
    return;
  }

  // making sure the first click is not a mine
  // the mine setting happens after the click
  if (!gFirstClick && !gIsBoardManual) {
    putMinesOnBoard({ i, j });
    setMinesNegsCount(gBoard);
    gFirstClick = true;
    // tools for the develepor to follow mines and ngs mines
    var helpMat = specialBoard(gBoard);
    console.table(helpMat);
    console.table(gBoard);
  }

  // setting game timer
  if (!gTimer) {
    setTimer();
  }

  // copying this step using a deep clone copy
  var clone = JSON.parse(JSON.stringify(gBoard));
  gGameArr.push(clone);

  var cell = gBoard[i][j];

  // stoping if the cell has a flag on it
  if (cell.isFlag) return;

  // if the hint is activated uses the ShowNgsOnHint function to see the area
  if (gIsHint) {
    ShowNgsOnHint(gBoard, i, j);
    gIsHint = false;
    return;
  }

  cell.isShown = true;

  // if the cell is a mine calling to gameOver() for possible lose
  // also allowing safe click to be activated
  if (cell.isMine) {
    cell.isShown = true;
    renderCell({ i, j }, '💣');
    if (gIsSafeClick) {
      gLives++;
      gIsSafeClick = false;
      if (gSafeClicks >= 0) {
        var elSafeCliksBtn = document.querySelector('.safe-click');
        elSafeCliksBtn.innerText = gSafeClicks;
      }
    }
    gLives--; // updating lives for player
    gGame.markedCount--; // updating game conditions for victory: one less falg is needed
    gGame.shownCount++; // updating game conditions for victory: one more shown cell has
    checkVictory(); // maybe the last cell is a mine and the player has enough life for victory
    var elLiveLeft = document.querySelector('.lives');
    elLiveLeft.innerText = ' ' + gLives; // updating the lives on the DOM
    if (!gLives) gameOver(); // condition for lose
    return;
  } else {
    gIsSafeClick = false;
  }

  // rendering the newly opened cell with the number of negs
  var cellValue = cell.minesAroundCount ? cell.minesAroundCount : ' ';
  renderCell({ i, j }, cellValue);

  // opeing the area around the cell incase the cell has no mine around him
  if (cellValue === ' ') OpenArea(i, j, gBoard);

  // calling to checkVictory() for possible victory after the cell is shown
  checkVictory();
}

// marking the cells with a flag
function cellMarked(event, elCell, i, j) {
  // return if game over
  if (!gGame.isOn) {
    return;
  }
  // setting game timer
  if (!gTimer) {
    setTimer();
  }
  var cell = gBoard[i][j];
  // flag toggle on/off
  if (!cell.isShown) {
    // to prevent marking shown cells: mine or negs
    if (cell.isFlag) {
      // removing flag from cell
      cell.isFlag = false;
      renderCell({ i, j }, ' ');
      var elCell = document.querySelector(`.cell${i}-${j}`);
      elCell.style.backgroundColor = 'transparent';
      return;
    } else {
      // putting flag on cell and checking for victory
      cell.isFlag = true;
      renderCell({ i, j }, FLAG);
      checkVictory();
      return;
    }
  }
}

// counting the neighbor mines around a cell
function countMinesNeg(mat, rowIdx, colIdx) {
  var ngMinesCnt = 0;
  for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
    if (i < 0 || i > mat.length - 1) continue;
    for (var j = colIdx - 1; j <= colIdx + 1; j++) {
      if (j < 0 || j > mat[0].length - 1) continue;
      if (i === rowIdx && j === colIdx) continue;
      var cell = mat[i][j];
      if (cell.isMine) {
        ngMinesCnt++;
      }
    }
  }
  return ngMinesCnt;
}

// updating each element (game cell) in the gBoard for number of neighbor mines
function setMinesNegsCount(board) {
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[0].length; j++) {
      var cell = gBoard[i][j];
      cell.minesAroundCount = countMinesNeg(gBoard, i, j);
    }
  }
}

// putting mines randomly on the board
function putMinesOnBoard(firstCellCoord) {
  // creating coords acording to game level
  var mineCoords = createCoordArr(gLevel);
  var mineNum;

  // the switch selects the amount of mines regarding the game level
  switch (gLevel) {
    case 4:
      mineNum = 2;
      break;
    case 8:
      mineNum = 12;
      break;
    case 12:
      mineNum = 30;
      break;
  }

  // firstCellCoord is sent once in the first left click of the game
  // firstCellCoord is removed out of the mineCoords array to prevent the player
  // hitting a mine on first click
  var firstClickIndex = getFirstClickedCellIdx(firstCellCoord, mineCoords);
  mineCoords.splice(firstClickIndex, 1);

  // placing the mines on the board
  for (var k = 0; k < mineNum; k++) {
    var coord = drawNum(mineCoords);
    gBoard[coord.i][coord.j].isMine = true;
  }
}

// finding the index of the first clicked coord in the mineCoords
function getFirstClickedCellIdx(coord, coords) {
  for (var i = 0; i < coords.length; i++) {
    if (coords[i].i === coord.i && coords[i].j === coord.j) return i;
  }
  return -1;
}

// opening an area around a cell with no neighbor mines
// using recursion
function OpenArea(rowIdx, colIdx, mat) {
  for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
    if (i < 0 || i > mat.length - 1) continue;
    for (var j = colIdx - 1; j <= colIdx + 1; j++) {
      if (j < 0 || j > mat[0].length - 1) continue;
      if (i === rowIdx && j === colIdx) continue;
      if (mat[i][j].isShown) continue; // not checking shown empty cells
      var cell = mat[i][j];
      var cellDisplay;
      if (cell.isFlag) {
        cell.isFlag = false;
      }
      cell.isShown = true; // updating model
      cellDisplay = cell.minesAroundCount === 0 ? ' ' : cell.minesAroundCount;
      renderCell({ i, j }, cellDisplay); // updating dom

      if (cellDisplay === ' ') {
        OpenArea(i, j, gBoard); // recursion
      }
    }
  }
  return;
}

// seting a timer when the game starts
function setTimer() {
  var elTimer = document.querySelector('.timer span');
  var start = new Date().getTime();

  gTimer = setInterval(function () {
    gGame.secsPassed = (new Date() - start) / 1000; // change to [S] from [MS]
    gGame.secsPassed = gGame.secsPassed.toFixed(1); // one place decimal accuracy, ex: 0.0
    elTimer.innerHTML = `${gGame.secsPassed}`;
  }, 100);
}

// the function is activated when player loses
function gameOver() {
  clearInterval(gTimer);
  showAllmines();
  gGame.isOn = false;
  var elStatus = document.querySelector('h2 span');
  elStatus.innerText = GAME_LOSE;
}

// reset is activated by user from the DOM
function resetGame() {
  clearInterval(gTimer);
  var elTimer = document.querySelector('.timer span');
  elTimer.innerHTML = `0.0`;
  init();
}

// checking conditons for victory! 🏆
function checkVictory() {
  var checkIsShowed = 0;
  var CheckIsmarked = 0;
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard.length; j++) {
      if (gBoard[i][j].isShown === true) {
        checkIsShowed++;
      }
      if (gBoard[i][j].isFlag === true) {
        CheckIsmarked++;
      }
    }
  }
  if (
    checkIsShowed === gGame.shownCount &&
    CheckIsmarked === gGame.markedCount
  ) {
    clearInterval(gTimer);
    gGame.isOn = false;
    var elStatus = document.querySelector('h2 span');
    elStatus.innerText = GAME_WIN;
    var elCell = document.querySelector('table');
    elCell.classList.add('blink_me');
    saveHighestSore(gGame.secsPassed, gLevel);
  }
}

// shows all mines when player loses
function showAllmines() {
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard.length; j++) {
      var cell = gBoard[i][j];
      if (cell.isMine) {
        cell.isShown = true;
        var elCell = document.querySelector(`.cell${i}-${j}`);
        elCell.style.backgroundColor = 'Crimson';
        elCell.classList.add('blink_me');
        elCell.innerText = MINE;
      }
    }
  }
}

// selecting all the cells in the area for hint
function ShowNgsOnHint(mat, rowIdx, colIdx) {
  for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
    if (i < 0 || i > mat.length - 1) continue;
    for (var j = colIdx - 1; j <= colIdx + 1; j++) {
      if (j < 0 || j > mat[0].length - 1) continue;
      var cell = mat[i][j];
      if (cell.isShown) continue;
      var cellDisplay = cell.isMine ? '💣' : cell.minesAroundCount;
      renderCell({ i, j }, cellDisplay);
      setTimeForHint(i, j);
    }
  }
  return;
}

// updating the hint counter on the DOM and allowing the player to open a location
function hintOn() {
  if (!gHints) return; // hint has already been clicked
  if (gIsHint) return; // no more hints

  gIsHint = true;
  gHints--;
  var elHint = document.querySelector('.hint');
  elHint.innerText = '| Hints: ❓❔❔';
  switch (gHints) {
    case 2:
      elHint.innerText = '| Hints: ❓❔❔';
      break;
    case 1:
      elHint.innerText = '| Hints: ❓❓❔';
      break;
    case 0:
      elHint.innerText = '| Hints: ❓❓❓';
      break;
  }
}

// stoping the hints after 1 sec
function setTimeForHint(i, j) {
  setTimeout(function () {
    renderCell({ i, j }, ' ', 'transparent');
  }, 1000);
}

//updating the highest score
function saveHighestSore(score, gLevel) {
  // default values for the highest score
  if (!localStorage.lvl1BestScore) {
    localStorage.lvl1BestScore = Infinity;
  }

  if (!localStorage.lvl2BestScore) {
    localStorage.lvl2BestScore = Infinity;
  }

  if (!localStorage.lvl3BestScore) {
    localStorage.lvl3BestScore = Infinity;
  }

  switch (gLevel) {
    case 4:
      if (score < localStorage.lvl1BestScore) {
        localStorage.lvl1BestScore = score;
      }
      break;
    case 8:
      if (score < localStorage.lvl2BestScore) {
        localStorage.lvl2BestScore = score;
      }
      break;
    case 12:
      if (score < localStorage.lvl3BestScore) {
        localStorage.lvl3BestScore = score;
      }
      break;
  }
}

// going back game one step after click from player
function unDo() {
  gBoard = gGameArr.pop();
  renderBoard(gBoard, '.board-container');
}

// allowing the player to click on mine without losing a life
function safeClick() {
  if (gSafeClicks <= 0) {
    console.log('no more safe clicks');
    return;
  }
  gIsSafeClick = true;
  gSafeClicks--;
  var elSafeCliksBtn = document.querySelector('.safe-click');
  elSafeCliksBtn.innerText = gSafeClicks;
}

// allows the player to place mines at the beginning of the game
function activatePlayerPutMines() {
  if (gIsBoardManual) return; // already on manual mode
  if (!gIsPlayerPutMines) {
    // during the mine placing
    gGame.shownCount = gBoard.length ** 2;
    gGame.markedCount = 0;
    gIsPlayerPutMines = true;
    var elBtn = document.querySelector('.manual');
    elBtn.innerText = `Mines are set`;
  } else {
    renderBoard(gBoard, '.board-container');
    setMinesNegsCount(gBoard);
    gIsPlayerPutMines = false;
    gIsBoardManual = true;
    var elBtn = document.querySelector('.manual');
    elBtn.innerText = `Manual is on`;
  }
}

// activated from left click when gIsPlayerPutMines mode is true
// placing manialy the mines on the board
function manualyPutMines(i, j) {
  gBoard[i][j].isMine = true;
  gGame.shownCount--;
  gGame.markedCount++;
  renderCell({ i, j }, '💣', 'crimson');
}
