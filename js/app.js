'use strict';
var isDebug = false;
// TODO make all the icons for diffrent parts of game

const GAME_START = '😀';
const GAME_LOSE = '😒';
const GAME_WIN = '😎';
const MINE = '💣';
const FLAG = '🚩';

var gBoard;
var gLevel = 4;
var gGame;
var gTimer;
var gFirstClick;

function init() {
  gGame = { isOn: true, shownCount: 14, markedCount: 2, secsPassed: 0 }; // TODO update dyncamic
  gTimer = false;
  gFirstClick = false;
  gBoard = buildBoard(gLevel);
  renderBoard(gBoard, '.board-container');
  var elStatus = document.querySelector('h2 span');
  elStatus.innerText = GAME_START;

  //manual zone////////////////////

  // gBoard[2][1].isMine = true;
  // gBoard[3][3].isMine = true;

  // gBoard[0][1].isMine = true;
  // gBoard[0][0].isMine = true;

  ////////////////////////////////

  // console.table(gBoard);
  renderBoard(gBoard, '.board-container');
  var helpMat = specialBoard(gBoard);
  // console.table(helpMat);
}

function gameLvl(lvl) {
  resetGame();
  gLevel = lvl;
  gBoard = buildBoard(gLevel);
  // gBoard[2][1].isMine = true;
  // gBoard[3][3].isMine = true;
  // putMinesOnBoard();
  renderBoard(gBoard, '.board-container');

  // setMinesNegsCount(gBoard);

  switch (gLevel) {
    case 4:
      gGame.shownCount = 4 * 4 - 2;
      gGame.markedCount = 2;
      break;
    case 8:
      gGame.shownCount = 8 * 8 - 12;
      gGame.markedCount = 12;
      break;
    case 12:
      gGame.shownCount = 12 * 12 - 30;
      gGame.markedCount = 30;
      break;
  }
}

// TODO explantation
function renderBoard(mat, selector) {
  // var a = 3;
  var strHTML = '<tbody>'; // FIX restore board properties
  for (var i = 0; i < mat.length; i++) {
    strHTML += '<tr>';
    for (var j = 0; j < mat[0].length; j++) {
      var cell = mat[i][j];
      var cellDisplay;

      if (cell.isShown) {
        if (cell.isMine) {
          cellDisplay = '💣';
        } else {
          cellDisplay = cell.minesAroundCount;
        }
      } else {
        cellDisplay = ' ';
      }

      var className = `cell cell${i}-${j}`;
      // var className = 'cell cell' + i + '-' + j;
      // strHTML += `<td class="${className}">${cell.minesAroundCount}</td>`;
      // strHTML += `<td ncontextmenu="cellClicked(event,this,${i},${j})" onclick="cellClicked(event,this,${i},${j})" class="${className}">${cellDisplay}</td>`;
      strHTML += `<td oncontextmenu="cellClicked(event,this,${i},${j})" onclick="cellClicked(event,this,${i},${j})" class="${className}">${cellDisplay}</td>`;
      // strHTML += `<td oncontextmenu="cellClicked(event,this,${i},${j})" class="${className}">${cellDisplay}</td>`;
      // strHTML += `<td class="${className}">${i}${j}</td>`;
      // console.log('i', i);
      // console.log('j', j);
      // console.log('cell.minesAroundCount', cell.minesAroundCount);
    }
    strHTML += '</tr>';
  }
  strHTML += '</tbody>';
  var elContainer = document.querySelector(selector);
  elContainer.innerHTML = strHTML;
}

function cellClicked(event, elCell, i, j) {
  // console.log('gGame.markedCount', gGame.markedCount);
  // console.log('gGame.shownCount', gGame.shownCount);
  var cell = gBoard[i][j];

  if (!gFirstClick) {
    putMinesOnBoard({ i, j });
    setMinesNegsCount(gBoard);
    gFirstClick = true;
    var helpMat = specialBoard(gBoard);
    console.table(helpMat);
  }

  if (!gGame.isOn) {
    return;
  }

  if (!gTimer) {
    setTimer();
  }

  // console.log(`--------------`);
  // console.log('event', event);

  // right mouse key pressed - flag toggle on/off
  if (event.pointerId === 0 && !cell.isShown) {
    // removing flag from cell
    if (cell.isFlag) {
      cell.isFlag = false;
      renderCell({ i, j }, ' ');
      var elCell = document.querySelector(`.cell${i}-${j}`);
      elCell.style.backgroundColor = 'transparent';
      return;
      Markedz;
      // putting flag on cell
    } else {
      // gGame.markedCount--;
      cell.isFlag = true;
      renderCell({ i, j }, FLAG);
      if (gGame.markedCount === 0 && gGame.shownCount === 0) alert('!');
      checkVictory();
      return;
    }
  }
  // console.log('elCell', elCell);
  // console.log('i', i);
  // console.log('j', j);
  // debugger;
  // gGame.shownCount--;

  if (cell.isFlag) return;

  if (gGame.markedCount === 0 && gGame.shownCount === 0) alert('!');
  cell.isShown = true;
  checkVictory();
  if (cell.isMine) {
    gameOver();
  }

  var cellValue = cell.isMine ? '💣' : cell.minesAroundCount;
  if (!cell.minesAroundCount && cellValue !== '💣') {
    cellValue = ' ';

    OpenArea(i, j, gBoard);
  }
  renderCell({ i, j }, cellValue);

  // TODO if mine
  // TODO if no ngs
}

// TODO explantation //DONE
function countMinesNeg(mat, rowIdx, colIdx) {
  // debugger;
  // var Ng = 'MINE';
  var ngMinesCnt = 0;
  for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
    if (i < 0 || i > mat.length - 1) continue;
    for (var j = colIdx - 1; j <= colIdx + 1; j++) {
      if (j < 0 || j > mat[0].length - 1) continue;
      if (i === rowIdx && j === colIdx) continue;
      var cell = mat[i][j];
      // console.log('--------------');
      // console.log('i', i);
      // console.log('j', j);
      // console.log('cell', cell);
      if (cell.isMine) {
        ngMinesCnt++;
      }
    }
  }
  return ngMinesCnt;
}

// TODO explantation //DONE
function setMinesNegsCount(board) {
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[0].length; j++) {
      var cell = gBoard[i][j];
      cell.minesAroundCount = countMinesNeg(gBoard, i, j);
    }
  }
}

// TODO
function putMinesOnBoard(firstCellCoord) {
  if (isDebug) debugger;
  var coords = createCoordArr(gLevel);
  // console.log('1numsForI', numsForI);

  var mineNum;

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

  var firstClickIndex = getFirstClickedCellIdx(firstCellCoord, coords);
  coords.splice(firstClickIndex, 1);
  // console.log('firstClickIndex', firstClickIndex);
  // console.log('coords', coords);

  for (var k = 0; k < mineNum; k++) {
    // console.log('mineNUm', mineNum);
    var coord = drawNum(coords);
    gBoard[coord.i][coord.j].isMine = true;
  }

  // console.log('2numsForI', numsForI);
}

function getFirstClickedCellIdx(coord, coords) {
  // console.log('coord', coord);
  for (var i = 0; i < coords.length; i++) {
    if (coords[i].i === coord.i && coords[i].j === coord.j) return i;
  }
  return -1;
}

function OpenArea(rowIdx, colIdx, mat) {
  for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
    if (i < 0 || i > mat.length - 1) continue;
    for (var j = colIdx - 1; j <= colIdx + 1; j++) {
      if (j < 0 || j > mat[0].length - 1) continue;
      if (i === rowIdx && j === colIdx) continue;
      var cell = mat[i][j];
      cell.isShown = true;
      checkVictory();
      cell.minesAroundCount =
        cell.minesAroundCount === 0 ? ' ' : cell.minesAroundCount;
      // gGame.shownCount--
      renderCell({ i, j }, cell.minesAroundCount);
    }
  }
}

function setTimer() {
  // if (gGame === false) return;
  // gTimer = true;
  var elTimer = document.querySelector('.timer span');
  var start = new Date().getTime();

  gTimer = setInterval(function () {
    gGame.secsPassed = (new Date() - start) / 1000; //% 1000;
    gGame.secsPassed = gGame.secsPassed.toFixed(1);
    elTimer.innerHTML = `${gGame.secsPassed}`;
  }, 100);
}

function gameOver() {
  clearInterval(gTimer);
  showAllmines();

  gGame.isOn = false;
  var elStatus = document.querySelector('h2 span');
  elStatus.innerText = GAME_LOSE;
}

function resetGame() {
  clearInterval(gTimer);
  console.log('RESET');
  var elTimer = document.querySelector('.timer span');
  elTimer.innerHTML = `0.0`;
  init();
}

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

  // console.log('checkIsShow', checkIsShowed);
  // console.log('CheckIsmarked', CheckIsmarked);
  // console.log('gGame.isShown', gGame.isShown);
  // console.log('gGame.isMarked', gGame.isMarked);

  if (
    checkIsShowed === gGame.shownCount &&
    CheckIsmarked === gGame.markedCount
  ) {
    clearInterval(gTimer);
    var elStatus = document.querySelector('h2 span');
    elStatus.innerText = GAME_WIN;
  }
}

function showAllmines() {
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard.length; j++) {
      var cell = gBoard[i][j];
      if (cell.isMine) {
        cell.isShown = true;
        var elCell = document.querySelector(`.cell${i}-${j}`);
        // elCell.style.backgroundColor = 'transparent';
        elCell.classList.add('blink_me');
        elCell.innerText = MINE;
      }
    }
  }
  // renderBoard(gBoard, '.board-container');
}
