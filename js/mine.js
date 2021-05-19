'use strict';
// TODO make all the icons for diffrent parts of game

const NewGame = '😀';

const MINE = '💣';

var gBoard;
var gLevel = 4;
var gGame;
var gTimer;

function init() {
  gGame = { isOn: true, shownCount: 0, markedCount: 0, secsPassed: 0 };
  gTimer = false;
  gBoard = buildBoard(4);
  putMinesOnBoard();
  //manual zone////////////////////

  //

  // gBoard[2][1].isMine = true;
  // gBoard[3][3].isMine = true;

  // gBoard[0][1].isMine = true;
  // gBoard[0][0].isMine = true;

  ////////////////////////////////
  setMinesNegsCount(gBoard);
  console.table(gBoard);
  renderBoard(gBoard, '.board-container');
  var helpMat = specialBoard(gBoard);
  console.table(helpMat);
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
  if (!gTimer) {
    setTimer();
  }

  console.log(`--------------`);
  console.log('event', event);

  if (event.pointerId === 1) {
    console.log('left');
  }

  if (event.pointerId === 0) {
    console.log('right');
  }
  // console.log('elCell', elCell);
  // console.log('i', i);
  // console.log('j', j);
  // debugger;
  var cell = gBoard[i][j];
  cell.isShown = true;
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
function putMinesOnBoard() {
  var numsForI = createNumsArr(gLevel);
  var numsForJ = createNumsArr(gLevel);
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

  for (var k = 0; k < mineNum; k++) {
    // console.log('mineNUm', mineNum);
    var i = drawNum(numsForI);
    var j = drawNum(numsForJ);
    gBoard[i][j].isMine = true;
  }

  console.log('2numsForI', numsForI);
}

function OpenArea(rowIdx, colIdx, mat) {
  for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
    if (i < 0 || i > mat.length - 1) continue;
    for (var j = colIdx - 1; j <= colIdx + 1; j++) {
      if (j < 0 || j > mat[0].length - 1) continue;
      if (i === rowIdx && j === colIdx) continue;
      var cell = mat[i][j];
      cell.isShown = true;
      cell.minesAroundCount =
        cell.minesAroundCount === 0 ? ' ' : cell.minesAroundCount;
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
