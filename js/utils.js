'use strict';
// utils functions

function buildBoard(size) {
  var board = [];
  for (var i = 0; i < size; i++) {
    board[i] = [];
    for (var j = 0; j < size; j++) {
      board[i][j] = {
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false,
        isFlaged: false,
      };
    }
  }
  return board;
}

function renderCell(location, value, color = 'teal') {
  var elCell = document.querySelector(`.cell${location.i}-${location.j}`);
  elCell.innerHTML = value;
  elCell.style.backgroundColor = color;
  if (gIsHint) {
    elCell.classList.add('blink_me');
    setTimeout(function () {
      elCell.classList.remove('blink_me');
    }, 1000);
  }
}

function createCoordArr(size) {
  var coords = [];
  for (var i = 0; i < size; i++) {
    for (var j = 0; j < size; j++) {
      coords.push({ i, j });
    }
  }
  return coords;
}

function drawNum(nums) {
  var idx = getRandomInt(0, nums.length - 1);
  var num = nums[idx];
  nums.splice(idx, 1);
  return num;
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}

function copyMat(mat) {
  var newMat = [];
  for (var i = 0; i < mat.length; i++) {
    newMat[i] = [];
    for (var j = 0; j < mat[0].length; j++) {
      newMat[i][j] = mat[i][j];
    }
  }
  return newMat;
}

// a board for the develepor to see mines and ngs count on a console.table
function specialBoard(gBoard) {
  var arr = [];
  for (var i = 0; i < gBoard.length; i++) {
    arr[i] = [];
    for (var j = 0; j < gBoard.length; j++) {
      arr[i][j] = gBoard[i][j].isMine ? MINE : gBoard[i][j].minesAroundCount;
    }
  }
  return arr;
}
