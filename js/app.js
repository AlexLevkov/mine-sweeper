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
var gFirstClick;
var gLives;
var gHints;
var gIsHint;
var gGameArr;

function init() {
  gGame = { isOn: true, shownCount: 14, markedCount: 2, secsPassed: 0 };
  gTimer = false;
  gFirstClick = false;
  gLevel = 4;
  gLives = 3;
  gHints = 3;
  gIsHint = false;
  gGameArr = [];
  //
  gBoard = buildBoard(gLevel); // updating the model
  renderBoard(gBoard, '.board-container'); // updating the DOM
  //
  var elGameStatusIcon = document.querySelector('h2 span');
  elGameStatusIcon.innerText = GAME_START;
  var elCell = document.querySelector(`table`);
  elCell.classList.remove('blink_me');
  var elLiveLeft = document.querySelector('.lives');
  elLiveLeft.innerText = ' ' + gLives;
  var elHint = document.querySelector('.hint');
  elHint.innerText = '| Hints: ❔❔❔';
  var elBestScore = document.querySelector('.best-score');
  elBestScore.innerText = localStorage.lvl1BestScoreTime;
}

// this function is receiving the game level from an event in the DOM
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
      elBestScore.innerText = localStorage.lvl1BestScoreTime;

      break;
    case 8:
      gGame.shownCount = 8 * 8 - 12;
      gGame.markedCount = 12;
      elBestScore.innerText = localStorage.lvl2BestScoreTime;
      break;
    case 12:
      gGame.shownCount = 12 * 12 - 30;
      gGame.markedCount = 30;
      elBestScore.innerText = localStorage.lvl3BestScoreTime;
      break;
  }
}

// This function render the model (gBorad) to the DOM
function renderBoard(mat, selector) {
  var strHTML = '<tbody>';
  var cellDisplay = ' ';
  for (var i = 0; i < mat.length; i++) {
    strHTML += '<tr>';
    for (var j = 0; j < mat[0].length; j++) {
      var className = `cell cell${i}-${j}`;
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

  // making sure the first click is not a mine
  // the mine setting happens after the click
  if (!gFirstClick) {
    // gBoard[0][1].isMine = true;
    // gBoard[0][0].isMine = true;
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

  // copying this step
  var newMat = copyMat(gBoard);
  gameStepArr(newMat);

  var cell = gBoard[i][j];

  // stoping if right mouse key was pressed
  if (cell.isFlag) return;

  // using hint

  if (gIsHint) {
    ShowNgsOnHint(gBoard, i, j);
    gIsHint = false;
    return;
  }

  // cell defintion in line 107
  cell.isShown = true;

  // calling to gameOver() for possible lose if the cell is a mine
  if (cell.isMine) {
    // adding color to the clicked mine
    renderCell({ i, j }, '💣');
    checkVictory(); // maybe its the last cell and player still has life
    gLives--; // updating lives for player
    gGame.markedCount--; // updating game conditions for victory
    gGame.shownCount++; // updating game conditions for victory

    var elLiveLeft = document.querySelector('.lives');
    elLiveLeft.innerText = ' ' + gLives;
    if (!gLives) gameOver();
    return;
  }

  // rendering the newly opened cell
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
  // right mouse key pressed - flag toggle on/off
  if (!cell.isShown) {
    // to prevent marking shown cells
    if (cell.isFlag) {
      // removing flag from cell
      cell.isFlag = false;
      renderCell({ i, j }, ' ');
      var elCell = document.querySelector(`.cell${i}-${j}`);
      elCell.style.backgroundColor = 'transparent';
      return;
    } else {
      // putting flag on cell
      cell.isFlag = true;
      renderCell({ i, j }, FLAG);
      if (gGame.markedCount === 0 && gGame.shownCount === 0) alert('!');
      checkVictory();
      return;
    }
  }
  checkVictory();
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
  // firstCellCoord is removed out of the mineCoords array
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
    gGame.secsPassed = (new Date() - start) / 1000; //% 1000;
    gGame.secsPassed = gGame.secsPassed.toFixed(1);
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
    var elCell = document.querySelector(`table`);
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
  if (!gHints) return;

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
  console.log('i', i);
  console.log('j', j);

  setTimeout(function () {
    renderCell({ i, j }, ' ', 'transparent');
  }, 1000);
}

//updating the highest score
function saveHighestSore(score, gLevel) {
  switch (gLevel) {
    case 4:
      if (score < localStorage.lvl1BestScoreTime) {
        localStorage.lvl1BestScoreTime = score;
      }
      break;
    case 8:
      if (score < localStorage.lvl2BestScoreTime) {
        localStorage.lvl2BestScoreTime = score;
      }
      break;
    case 12:
      if (score < localStorage.lvl3BestScoreTime) {
        localStorage.lvl3BestScoreTime = score;
      }
      break;
  }
}

// going back game steps after click from player - NOT FINISHED
function unDo() {
  gBoard = gGameArr.pop();
  console.log('gBoard', gBoard);
  renderBoard(gBoard, '.board-container');
}

// collecting all the game steps
function gameStepArr(mat) {
  gGameArr.push(mat);
}
