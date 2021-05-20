'use strict';

// TODO
function buildBoard(size) {
  var board = [];
  for (var i = 0; i < size; i++) {
    board[i] = [];
    for (var j = 0; j < size; j++) {
      board[i][j] = {
        minesAroundCount: 0, //TODO function,
        isShown: false,
        isMine: false, //TODO function
        isMarked: false, //TODO function
        isFlaged: false,
      };
    }
  }
  return board;
}

// TODO
function renderCell(location, value) {
  // Select the elCell and set the value
  var elCell = document.querySelector(`.cell${location.i}-${location.j}`);
  elCell.innerHTML = value;
  elCell.style.backgroundColor = 'teal';
  // elCell.classList.add('blink_me');

  //if (gBoard[i][j].isFlag)
}

// TODO // #09 Creating an array of nums
function createCoordArr(size) {
  var coords = [];
  for (var i = 0; i < size; i++) {
    for (var j = 0; j < size; j++) {
      coords.push({ i, j });
    }
  }
  return coords;
}

// #10 returning a random number
function drawNum(nums) {
  var idx = getRandomInt(0, nums.length - 1);
  var num = nums[idx];
  nums.splice(idx, 1);
  return num;
}

// #03 getting a random Integer
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}

// FIX remove later!
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

//////////////////////////////////////////////////////////////////////////

/* Table of Contents

#01 Counting neighboures around cell
#02 Returning a copied mat
#03 Getting a random Integer
#04 Getting a random color
#05 Playing a sound
#06 Returning a matrix
#07 Returning the class name for a specific cell
#08 Setting a timer in the dom using time interval
#09 Creating an array of nums
#10 Returning a random number
#11 Returning a formated time, ex: 08:11:19
#12 Supporting function to sort nums in array
#13 Supporting function to sort strings in array
#14 returns a sum of an array
#15 returns an average of an array
#16 printMat - renders a table
#17 renderCell - render a cell
  
  




// #01 counting neighboures around cell
function countMinesNeg(mat, rowIdx, colIdx) {
  var Ng = 'Ng';
  var NgsCnt = 0;
  for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
    if (i < 0 || i > mat.length - 1) continue;
    for (var j = colIdx - 1; j <= colIdx + 1; j++) {
      if (j < 0 || j > mat[0].length - 1) continue;
      if (i === rowIdx && j === colIdx) continue;
      var cell = mat[i][j];
      if (cell === Ng) NgsCnt++;
    }
  }
  return NgsCnt;
}

// #02 returning a copied mat
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

// #03 getting a random Integer
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}

// #04 getting a random color
function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// #05 Playing a sound
function playSound() {
  var sound = new Audio('folder/name.mp3');
  sound.play();
}

// #06 Returning a matrix
function createMat(ROWS, COLS) {
  var mat = [];
  for (var i = 0; i < ROWS; i++) {
    var row = [];
    for (var j = 0; j < COLS; j++) {
      row.push('');
    }
    mat.push(row);
  }
  return mat;
}

// #07 Returning the class name for a specific cell
function getClassName(location) {
  // {i:2,j:7}
  var cellClass = 'cell-' + location.i + '-' + location.j; // 'cell-2-7'
  return cellClass;
}

// #08 Setting a timer in the dom using time interval
function setTimer() {
  var start = new Date().getTime();

  // gTimer = setInterval(function () {
  //   var diff = (new Date() - start) / 1000; ;
  //   var elTimer= document.querySelector('.timer')
  //   diff = diff.toFixed(1);
  //   elTimer.innerHTML = `${diff}`;

  // }, 100);
}

// #09 Creating an array of nums
function createNumsArr(size) {
  var nums = [];
  for (var i = 1; i <= size; i++) {
    nums.push(i);
  }
  return nums;
}

// #10 returning a random number
function drawNum(nums) {
  var idx = getRandomInt(0, nums.length);
  var num = nums[idx];
  nums.splice(idx, 1);
  return num;
}

// #11 Returning a formated time, ex: 08:11:19
function getTime() {
  return new Date().toString().split(' ')[4];
}

// #12 Supporting function to sort nums in array
function compareNums(a, b) {
  return a - b;
}

// #13 Supporting function to sort strings in array
function compareStrings(a, b) {
  var a = a.toUpperCase();
  var b = b.toUpperCase();
  if (a < b) {
    return -1;
  }
  if (a > b) {
    return 1;
  }
  return 0;
}

// #14 Returns a sum of an array
function getSumArray(arr) {
  var sum = 0;
  for (var i = 0; i < arr.length; i++) {
    sum += arr[i];
  }
  return sum;
}

// #15 Returns an average of an array
function getAvgArray(arr) {
  var avg;
  var sum = 0;
  for (var i = 0; i < arr.length; i++) {
    sum += arr[i];
  }
  avg = sum / arr.length;
  return avg;
}

function printMat(mat, selector) {
  var strHTML = '<table border="0"><tbody>';
  for (var i = 0; i < mat.length; i++) {
    strHTML += '<tr>';
    for (var j = 0; j < mat[0].length; j++) {
      var cell = mat[i][j];
      var className = 'cell cell' + i + '-' + j;
      strHTML += '<td class="' + className + '"> ' + cell + ' </td>';
    }
    strHTML += '</tr>';
  }
  strHTML += '</tbody></table>';
  var elContainer = document.querySelector(selector);
  elContainer.innerHTML = strHTML;
}
// location such as: {i: 2, j: 7}

// functionrenderBoard(board) {
//     varelBoard= document.querySelector('.board');
//     varstrHTML= '';
//     for(vari= 0; i< board.length; i++) {
//     strHTML+= '<tr>\n';
//     for(varj = 0; j < board[0].length; j++) {
//     varcurrCell= board[i][j];
//     varcellClass= 'cell-'+ i+ '-'+ j + ' ';
//     strHTML+= '\t<td class="cell '+ cellClass+'" onclick="moveTo('+ i+ ','+ j + ')" >\n';
//     strHTML+= currCell;
//     strHTML+= '\t</td>\n';
//     }
//     strHTML+= '</tr>\n';
//     }
//     elBoard.innerHTML= strHTML;
//     }



*/
