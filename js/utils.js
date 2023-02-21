'use strict';
// utils functions

function buildBoard(size) {
   let board = [];
   for (let i = 0; i < size; i++) {
      board[i] = [];
      for (let j = 0; j < size; j++) {
         board[i][j] = {
            minesAroundCount: 0,
            isShown: false,
            isMine: false,
            isMarked: false,
            isFlag: false,
         };
      }
   }
   return board;
}

function renderCell(location, value, color = 'teal') {
   let elCell = document.querySelector(`.cell${location.i}-${location.j}`);
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
   let coords = [];
   for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
         coords.push({ i, j });
      }
   }
   return coords;
}

function drawNum(nums) {
   let idx = getRandomInt(0, nums.length - 1);
   let num = nums[idx];
   nums.splice(idx, 1);
   return num;
}

function getRandomInt(min, max) {
   min = Math.ceil(min);
   max = Math.floor(max);
   return Math.floor(Math.random() * (max - min) + min);
}

function copyMat(mat) {
   let newMat = [];
   for (let i = 0; i < mat.length; i++) {
      newMat[i] = [];
      for (let j = 0; j < mat[0].length; j++) {
         newMat[i][j] = mat[i][j];
      }
   }
   return newMat;
}

// a board for the developer to see mines and ngs count on a console.table
function specialBoard(gBoard) {
   let arr = [];
   for (let i = 0; i < gBoard.length; i++) {
      arr[i] = [];
      for (let j = 0; j < gBoard.length; j++) {
         arr[i][j] = gBoard[i][j].isMine ? MINE : gBoard[i][j].minesAroundCount;
      }
   }
   return arr;
}


let animateButton = function (e) {
   e.preventDefault;
   //reset animation
   // e.target.classList.remove('animate');
   e.target.classList.add('animate');
   setTimeout(function () {
      e.target.classList.remove('animate');
   }, 700);
};

let bubblyButtons = document.getElementsByClassName("bubbly-button");
for (let i = 0; i < bubblyButtons.length; i++) {
   bubblyButtons[i].addEventListener('click', animateButton, false);
}