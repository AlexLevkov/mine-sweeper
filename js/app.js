('use strict');

const GAME_START = ' 🚩';
const GAME_LOSE = ' 🏴';
const GAME_WIN = ' 🏁';
const MINE = '💣';
const FLAG = '🚩';

let isDebug;
let gBoard;
let gLevel;
let gGame;
let gTimer;
let gGameArr;
let gFirstClick;
let gLives;
let gHints;
let gFlags;
let gSafeClicks;
let gIsHint;
let gIsSafeClick;
let gIsPlayerPutMines;
let gIsBoardManual;
let gIsTutorial;
let gIsGameReset;

function init() {
   // Updating the model
   setGameValues();
   // Updating the DOM
   renderBoard(gBoard, '.board-container');
   renderInstrc('Click any cell to begin');
   renderStatus();
   // default, beginning in tutorial
   if (!gIsTutorial && !gIsGameReset) tutorial(part = 1);
}

// Setting the game values at the beginning of the game loop
function setGameValues() {
   gFirstClick = gTimer = gIsHint = gIsSafeClick = gIsPlayerPutMines = gIsBoardManual = false
   gGame = { isOn: true, shownCount: 14, markedCount: 2, secsPassed: 0 };
   gLives = 1; gHints = 3; gFlags = 2; gSafeClicks = 3;
   gGameArr = [];
   if (!gLevel) gLevel = 4;
   gBoard = buildBoard(gLevel);
}

// This function renders the model (gBorad) to the DOM
function renderBoard(mat, selector) {
   let strHTML = '<tbody>';
   let cellDisplay;
   for (let i = 0; i < mat.length; i++) {
      strHTML += '<tr>';
      for (let j = 0; j < mat[0].length; j++) {
         let cell = mat[i][j];
         let className = `cell cell${i}-${j}`;
         if (cell.isShown) {
            className += ' open-cell';
            if (cell.isMine) {
               cellDisplay = '💣';
            } else if (cell.isFlag) {
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
   let elContainer = document.querySelector(selector);
   elContainer.innerHTML = strHTML;
}

// Rendering the game's instructions
function renderInstrc(text) {
   let elGameStatus = document.querySelector('.game-status')
   elGameStatus.innerHTML = text
}

// This function is updating the tutorial values and rendering them to the DOM:
function tutorial(part) {
   let elGameStatus = document.querySelector('.game-tutorial');

   let part_1_txt = `<p>Welcome to the mine sweeper game! If you are familiar with the rules click any cell in the table below to start playing or <span class="trl-btn" onclick=tutorial(2)>continue the tutorial</span></p>`;
   let part_2_txt = `<p>The board is no longer hidden and is filled with cells that include mines and cells with a number inside.    The number represent the amount of mines in the surrounding neighbor cells.    <span class="trl-btn" onclick=tutorial(3)>continue</span></p>`
   let part_3_txt = `<p>By pressing the left click you reveal the content of the cell, if it is a mine you lose one life. Cells that you suspect to be mines should be marked by a flag using the right click. You win by revealing all the safe cells and putting flags on all the mine cells. <span class="trl-btn" onclick=tutorial(4)>continue</span></p>`;
   let part_4_txt = `<p>You can press "Undo" to take one step back, create a preplanned game by choosing "Manual Mode", get a peek by pressing the "Hints" button and open cells without losing lives with the "Safe Click" button. <span class="trl-btn" onclick=gameLvl(4)>Got it, Lets Play</span></p>`;

   switch (part) {
      case 1:
         gIsTutorial = true;
         gLevel = 4;
         document.querySelector('#game-level-1').checked = true;
         gBoard = buildBoard(gLevel);
         renderBoard(gBoard, '.board-container');
         toggleGreyOutBtns(0, 'add');
         toggleGreyOutInputs('add');
         updateMenu();
         renderFlags();
         elGameStatus.innerHTML = part_1_txt;
         break;
      case 2:
         putMinesOnBoard({ i: 1, j: 1 });
         setMinesNegsCount(gBoard);
         for (let i = 0; i < gBoard.length; i++) {
            for (let j = 0; j < gBoard.length; j++)
               gBoard[i][j].isShown = true;
         };
         renderBoard(gBoard, '.board-container');
         let elBoard = document.querySelector('tbody');
         elBoard.style.opacity = 0.3;
         setTimeout(function () { elBoard.style.opacity = 1; }, 300);
         elGameStatus.innerHTML = part_2_txt;
         break;
      case 3:
         elGameStatus.innerHTML = part_3_txt;
         break;
      case 4:
         gIsTutorial = false
         elGameStatus.innerHTML = part_4_txt;
         break;
      default:
         break;
   }

}

// This function is receiving the game level from the player in the DOM 
// The user can choose by clicking one of the three game levels: Beginner(4) Medium(8) Expert(12)
function gameLvl(lvl) {
   gIsGameReset = true
   init()
   if (!gIsTutorial) {
      // this is activated after the end of the tutorial 'got it, let's play'
      document.querySelector('#game-level-1').checked = true;
      let elGameTutorialStatus = document.querySelector('.game-tutorial')
      elGameTutorialStatus.innerHTML = ''
   }

   if (lvl) { gLevel = lvl; } // the level (lvl) selected by the user is now the global level (gLevel)
   gBoard = buildBoard(gLevel);
   renderBoard(gBoard, '.board-container');
   // this switch allows to create the needed victory conditions 
   updateMenu();
   renderFlags();
   renderInstrc('Click any cell to begin');

   let elTimer = document.querySelector('.timer span');
   elTimer.innerHTML = `00:00`;
   clearInterval(gTimer);

   toggleGreyOutBtns(0, 'remove')
   toggleGreyOutInputs('remove')
   gIsGameReset = false
}

// Rendering and updating the game's flags
function renderFlags(action = 'none') {
   if (action === 'remove-flag') {
      gFlags--
   }
   if (action === 'add-flag') {
      gFlags++
   }
   let elFlags = document.querySelector('.Flags')
   elFlags.innerText = `${gFlags} ${FLAG}`
}

// This function is activated after a left click on a cell
// The function reveals the content inside
function cellClicked(event, elCell, i, j) {
   console.log('gIsTutorial:', gIsTutorial)
   if (gIsTutorial) {
      gIsTutorial = !gIsTutorial
      document.querySelector('.game-tutorial').innerHTML = ''
      toggleGreyOutBtns(0, 'remove')
      resetGame()
   }

   let cell = gBoard[i][j];

   // return if game over, celled was already clicked or has a flag on it
   if (!gGame.isOn || cell.isShown || cell.isFlag) {
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
      gFirstClick = true;
      putMinesOnBoard({ i, j });
      setMinesNegsCount(gBoard);
      toggleGreyOutInputs('add')
   }
   // setting game timer
   if (!gTimer) {
      setTimer();
   }
   // copying this step using a deep clone copy
   let clone = JSON.parse(JSON.stringify(gBoard));
   gGameArr.push(clone);

   // if the hint is activated uses the ShowNgsOnHint function to see the area
   if (gIsHint) {
      gIsHint = false;
      ShowNgsOnHint(gBoard, i, j);
      changeCursor('pointer')
      return;
   }

   cell.isShown = true;
   elCell.classList.remove('clicked')
   let manualBtn = document.querySelector('.manual-btn')
   manualBtn.classList.add('na')

   // if the cell is a mine calling to gameOver() for possible lose
   // also allowing safe click to be activated
   if (cell.isMine) {
      cell.isShown = true;
      if (gLives > 1 || gIsSafeClick) {
         renderCell({ i, j }, FLAG);
      } else {
         renderCell({ i, j }, MINE);
      }
      elCell.classList.add('blink_me');
      elCell.style.backgroundColor = 'crimson';
      let elGameLives = document.querySelector('.game-lives');
      elGameLives.classList.add('blink_me');
      elGameLives.style.color = 'crimson';
      elGameLives.style.fontWeight = 'bold';

      renderFlags('remove-flag')
      // will stop in case of game-over
      let timeOut = setTimeout(() => {
         elCell.classList.remove('blink_me');
         elCell.style.backgroundColor = 'teal';
      }, 1200)

      //must always run:
      setTimeout(() => {
         elGameLives.classList.remove('blink_me');
         elGameLives.style.color = 'white';
         elGameLives.style.fontWeight = 'normal';
      }, 1200)

      if (gIsSafeClick) {
         gLives++;
         gIsSafeClick = false;
         if (gSafeClicks >= 0) {
            let elSafeClicksValue = document.querySelector('.safe-click');
            elSafeClicksValue.innerText = gSafeClicks;
            let elSafeClicksBtn = document.querySelector('.safe-btn');
            elSafeClicksBtn.style.color = 'white';
         }
      }
      gLives--; // updating lives for player
      gGame.markedCount--; // updating game conditions for victory: one less falg is needed
      gGame.shownCount++; // updating game conditions for victory: one more shown cell has
      checkVictory(); // maybe the last cell is a mine and the player has enough life for victory
      renderLives() // updating the lives on the DOM
      if (!gLives) {
         clearTimeout(timeOut)
         gameOver(); // conditions for lose
      }
      return;
   } else {
      gIsSafeClick = false;
      let elSafeClicksBtn = document.querySelector('.safe-btn');
      elSafeClicksBtn.style.color = 'white';
   }
   // rendering the newly opened cell with the number of negs
   let cellValue = cell.minesAroundCount ? cell.minesAroundCount : ' ';
   renderCell({ i, j }, cellValue);
   // opening the area around the cell incase the cell has no mine around him
   if (cellValue === ' ') OpenArea(i, j, gBoard);
   // calling to checkVictory() for possible victory after the cell is shown
   checkVictory();
}

// Marking the cells with a flag
function cellMarked(event, elCell, i, j) {
   // return if game over
   if (!gGame.isOn || gIsTutorial) {
      return;
   }
   // setting game timer
   if (!gTimer) {
      setTimer();
   }
   let cell = gBoard[i][j];
   // flag toggle on/off
   if (!cell.isShown) {
      // to prevent marking shown cells: mine or negs
      if (cell.isFlag) {
         // removing flag from cell
         cell.isFlag = false;
         renderCell({ i, j }, ' ', 'transparent');
         let elCell = document.querySelector(`.cell${i}-${j}`);
         // elCell.style.backgroundColor = 'transparent';
         elCell.classList.add('clicked')
         renderFlags('add-flag')
         let clone = JSON.parse(JSON.stringify(gBoard));
         gGameArr.push(clone);
         return;
      } else {
         // putting flag on cell and checking for victory
         let elCell = document.querySelector(`.cell${i}-${j}`);
         // elCell.style.backgroundColor = 'transparent';
         elCell.classList.remove('clicked')
         cell.isFlag = true;
         renderCell({ i, j }, FLAG);
         renderFlags('remove-flag')
         let clone = JSON.parse(JSON.stringify(gBoard));
         gGameArr.push(clone);
         checkVictory();
         return;
      }
   }
}

// Finding the index of the first clicked coord in the mineCoords
function getFirstClickedCellIdx(firstCoord, coords) {
   for (let k = 0; k < coords.length; k++) {
      if (coords[k].i === firstCoord.i && coords[k].j === firstCoord.j) return k;
   }
   return -1;
}

// Opening an area around a cell with no neighbor mines with recursion
function OpenArea(rowIdx, colIdx, mat) {
   let elCell = document.querySelector(`.cell${rowIdx}-${colIdx}`);
   elCell.classList.remove('clicked')
   for (let i = rowIdx - 1; i <= rowIdx + 1; i++) {
      if (i < 0 || i > mat.length - 1) continue;
      for (let j = colIdx - 1; j <= colIdx + 1; j++) {
         if (j < 0 || j > mat[0].length - 1) continue;
         if (i === rowIdx && j === colIdx) continue;
         if (mat[i][j].isShown) continue; // not checking shown empty cells
         let cell = mat[i][j];
         let cellDisplay;
         if (cell.isFlag) {
            cell.isFlag = false;
            renderFlags('add-flag')
         }
         cell.isShown = true; // updating model
         cellDisplay = cell.minesAroundCount === 0 ? ' ' : cell.minesAroundCount;
         renderCell({ i, j }, cellDisplay); // updating dom

         if (cellDisplay === ' ') {
            let elCell = document.querySelector(`.cell${i}-${j}`);
            elCell.classList.remove('clicked')
            OpenArea(i, j, gBoard); // recursion
         }
      }
   }
   return;
}

// Counting the neighbor mines around a cell
function countMinesNeg(mat, rowIdx, colIdx) {
   let ngMinesCnt = 0;
   for (let i = rowIdx - 1; i <= rowIdx + 1; i++) {
      if (i < 0 || i > mat.length - 1) continue;
      for (let j = colIdx - 1; j <= colIdx + 1; j++) {
         if (j < 0 || j > mat[0].length - 1) continue;
         if (i === rowIdx && j === colIdx) continue;
         let cell = mat[i][j];
         if (cell.isMine) {
            ngMinesCnt++;
         }
      }
   }
   return ngMinesCnt;
}

// Updating each element (game cell) in the gBoard for number of neighbor mines
function setMinesNegsCount(board) {
   for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[0].length; j++) {
         let cell = gBoard[i][j];
         cell.minesAroundCount = countMinesNeg(gBoard, i, j);
      }
   }
}

// Putting mines randomly on the board
function putMinesOnBoard(firstCellCoord) {
   // creating coords according to game level
   let mineCoords = createCoordArr(gLevel);
   let mineNum;

   // the switch selects the amount of mines regarding the game's level
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
   // firstCellCoord is sent once, after the first left click of the game
   // firstCellCoord is removed out of the mineCoords array to prevent the player
   // hitting a mine on first click
   let firstClickIndex = getFirstClickedCellIdx(firstCellCoord, mineCoords);
   mineCoords.splice(firstClickIndex, 1);

   // placing the mines on the board
   for (let k = 0; k < mineNum; k++) {
      let coord = drawNum(mineCoords);
      gBoard[coord.i][coord.j].isMine = true;
   }
}

// Setting a timer when the game starts
function setTimer() {
   let elGameStatus = document.querySelector('.game-status')
   elGameStatus.innerText = 'Game On'
   let elTimer = document.querySelector('.timer span');
   // let start = new Date().getTime();
   let start = Date.now()
   gTimer = setInterval(function () {
      gGame.secsPassed = (new Date() - start) / 1000; // change to [S] from [MS]

      let seconds = Math.floor(gGame.secsPassed % 60)
      if (seconds < 10) seconds = '0' + seconds

      let minutes = Math.floor(gGame.secsPassed / 60)
      if (minutes < 10) minutes = '0' + minutes

      elTimer.innerHTML = `${minutes}:${seconds}`;
   }, 200);
}

// The function is activated when player loses
function gameOver() {
   clearInterval(gTimer);
   showAllmines();
   gGame.isOn = false;
   let elIcon = document.querySelector('h2 span');
   elIcon.innerText = GAME_LOSE;
   let elGameStatus = document.querySelector('.game-status')
   elGameStatus.innerText = 'Game Over'
   toggleGreyOutBtns(0, 'add')
   toggleGreyOutInputs('add')
}

// Reset is activated by user from the DOM "New Game"
function resetGame() {
   clearInterval(gTimer);
   gIsGameReset = true
   gIsTutorial = false
   gIsGameReset = false;
   flashBoard()
   gameLvl();
}

// Checking conditions for victory! 🏆
function checkVictory() {
   let checkIsShowed = 0;
   let CheckIsMarked = 0;
   for (let i = 0; i < gBoard.length; i++) {
      for (let j = 0; j < gBoard.length; j++) {
         if (gBoard[i][j].isShown === true) {
            checkIsShowed++;
         }
         if (gBoard[i][j].isFlag === true) {
            CheckIsMarked++;
         }
      }
   }
   // For victory all the bomb containing cells must be marked with a flag
   // And all empty cells must be clicked/shown
   if (
      checkIsShowed === gGame.shownCount &&
      CheckIsMarked === gGame.markedCount
   ) {
      clearInterval(gTimer);
      gGame.isOn = false;
      let elStatus = document.querySelector('h2 span');
      elStatus.innerText = GAME_WIN;
      let elCell = document.querySelector('table');
      elCell.classList.add('blink_me');
      saveHighestSore(gGame.secsPassed, gLevel);
      elGameStatus = document.querySelector('.game-status')
      elGameStatus.innerText = 'Victory'
      toggleGreyOutBtns(0, 'add')
      toggleGreyOutInputs('add')
   }
}

//Updating the highest score (after end game)
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
         if (score < +localStorage.lvl1BestScore) {
            localStorage.lvl1BestScore = score.toFixed(1);
         }
         break;
      case 8:
         if (score < +localStorage.lvl2BestScore) {
            localStorage.lvl2BestScore = score.toFixed(1);
         }
         break;
      case 12:
         if (score < +localStorage.lvl3BestScore) {
            localStorage.lvl3BestScore = score.toFixed(1);
         }
         break;
   }
}

// Shows all mines when player loses
function showAllmines() {
   for (let i = 0; i < gBoard.length; i++) {
      for (let j = 0; j < gBoard.length; j++) {
         let cell = gBoard[i][j];
         if (cell.isMine) {
            cell.isShown = true;
            let elCell = document.querySelector(`.cell${i}-${j}`);
            elCell.style.backgroundColor = 'Crimson';
            elCell.classList.add('blink_me');
            elCell.innerText = MINE;
         }
      }
   }
}

// Selecting all the cells in the area for hint
function ShowNgsOnHint(mat, rowIdx, colIdx) {
   for (let i = rowIdx - 1; i <= rowIdx + 1; i++) {
      if (i < 0 || i > mat.length - 1) continue;
      for (let j = colIdx - 1; j <= colIdx + 1; j++) {
         if (j < 0 || j > mat[0].length - 1) continue;
         let cell = mat[i][j];
         if (cell.isShown) continue;
         let cellDisplay = cell.isMine ? '💣' : cell.minesAroundCount;
         renderCell({ i, j }, cellDisplay);
         setTimeForHint(i, j);
         let elCell = document.querySelector(`.cell${i}-${j}`);
         elCell.classList.add('clicked')
      }
   }
   return;
}

// Updating the hint counter on the DOM and allowing the player to open a location
function hintOn() {
   // hint has already been clicked // no more hints
   if (!gHints || !gGame.isOn || gIsHint) return;
   gIsHint = true;
   gHints--;
   let elHint = document.querySelector('.hint');
   changeCursor('help')
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

// Stoping the hints after 1 sec
function setTimeForHint(i, j) {
   setTimeout(function () {
      renderCell({ i, j }, ' ', 'transparent');
   }, 1000);
}

// Updating the menu the best scores of the game (at the start)
function updateMenu() {
   let elBestScore = document.querySelector('.best-score');
   let score;

   if (gLevel === 4) { gFlags = gGame.markedCount = 2; gLives = 1; score = 'lvl1BestScore' }
   if (gLevel === 8) { gFlags = gGame.markedCount = 12; gLives = 2; score = 'lvl2BestScore' }
   if (gLevel === 12) { gFlags = gGame.markedCount = 30; gLives = 3; score = 'lvl3BestScore' }

   gGame.shownCount = gLevel * gLevel - gGame.markedCount;

   if (!localStorage[score] || localStorage[score] === 'Infinity') {
      elBestScore.innerText = 'No Best Score Yet'
   }
   else {
      elBestScore.innerText = localStorage[score] + ' Seconds'
   }
   renderLives()
}

// Going back game one step after click from player
function unDo() {
   if (!gGame.isOn || !gGameArr.length) return
   gBoard = gGameArr.pop();
   renderBoard(gBoard, '.board-container');
}

// Allowing the player to click on mine without losing a life
function safeClick() {
   if (gSafeClicks <= 0 || !gGame.isOn || gIsSafeClick) {
      return;
   }
   gIsSafeClick = true;
   gSafeClicks--;
   let elSafeClicksValue = document.querySelector('.safe-click');
   elSafeClicksValue.innerText = gSafeClicks;
   let elSafeClicksBtn = document.querySelector('.safe-btn');
   elSafeClicksBtn.style.color = 'crimson';
}

// Allows the player to place mines at the beginning of the game
function activatePlayerPutMines() {
   if (gIsBoardManual || !gGame.isOn || gTimer) return; // already on manual mode
   if (!gIsPlayerPutMines) {
      // during the mine placing
      gFlags = 0;
      gGame.shownCount = gBoard.length ** 2;
      gGame.markedCount = 0;
      gIsPlayerPutMines = true;
      let elBtn = document.querySelector('.manual-btn');
      elBtn.innerText = `Mines Are Set`;
      let elGameStatus = document.querySelector('.game-status')
      elGameStatus.innerText = 'Place Mines On Board And Then Press The "Mines Are Set" Button'
      let cellArr = document.querySelectorAll('.cell')
      cellArr.forEach(el => el.style.cursor = 'cell')
      toggleGreyOutBtns(3, 'add')
      elGameStatus.classList.add('blink_me');
      elGameStatus.style.color = 'red'
      elGameStatus.style.font = 'bold'
      setTimeout(() => {
         elGameStatus.classList.remove('blink_me');
         elGameStatus.style.color = 'white'
      }, 1500)
   } else {
      // After putting the mines on the board
      renderBoard(gBoard, '.board-container');
      setMinesNegsCount(gBoard);
      gIsPlayerPutMines = false;
      gIsBoardManual = true;
      let elBtn = document.querySelector('.manual-btn');
      elBtn.innerText = `Manual Mode`;
      elBtn.style.color = `crimson`;
      let elGameStatus = document.querySelector('.game-status')
      elGameStatus.innerText = 'Mines are set - click any cell to begin game'
      toggleGreyOutBtns(null, 'remove')
   }
}

// Activated from left click when gIsPlayerPutMines mode is true
// Placing manually the mines on the board
function manualyPutMines(i, j) {
   gBoard[i][j].isMine = true;
   gGame.shownCount--;
   gGame.markedCount++;
   renderCell({ i, j }, '💣', 'crimson');
   renderFlags('add-flag')
}

// Rendering the 'lives' how many times the user can fail before game over
function renderLives() {
   let elLiveLeft = document.querySelector('.lives');
   elLiveLeft.innerText = ''

   for (let i = 0; i < gLives; i++) {
      elLiveLeft.innerText += '❤️'
   }
   if (gLives === 0) {
      elLiveLeft.innerText = ' 0'
   }
}

// Rendering the game's status after reset
function renderStatus() {
   let elGameStatusIcon = document.querySelector('h2 span');
   elGameStatusIcon.innerText = GAME_START;
   let elCell = document.querySelector('table');
   elCell.classList.remove('blink_me');
   let elLiveLeft = document.querySelector('.lives');
   elLiveLeft.innerText = '❤️';
   let elHint = document.querySelector('.hint');
   elHint.innerText = '| Hints: ❔❔❔';
   let elSafeClicksBtn = document.querySelector('.safe-click');
   elSafeClicksBtn.innerText = gSafeClicks;
   elManualBtn = document.querySelector('.manual-btn');
   elManualBtn.innerText = 'Manual Mode'
   elManualBtn.style.color = 'white'
   let elBestScore = document.querySelector('.best-score');
   if (!localStorage.lvl1BestScore) {
      elBestScore.innerText = 'No Best Score Yet';
   } else {
      elBestScore.innerText = localStorage.lvl1BestScore + ' Seconds';
   }
}

// Toggling the game inputs availability
function toggleGreyOutInputs(action) {
   let elArr = document.querySelectorAll(".level")
   if (action === 'add') {
      elArr.forEach(el => el.classList.add('na'))
   }
   if (action === 'remove') {
      elArr.forEach(el => el.classList.remove('na'))
   }
}

// Toggling the game buttons availability
function toggleGreyOutBtns(ignoreIdx, action) {
   let elArr = document.querySelectorAll('button')
   if (action === 'add') {
      elArr.forEach((el, idx) => {
         if (idx === ignoreIdx) return
         el.classList.add('na')
      })
   }
   if (action === 'remove') {
      elArr.forEach((el, idx) => {
         if (idx === ignoreIdx) return
         el.classList.remove('na')
      })
   }
}

// This function is flashing the board when game begins
function flashBoard() {
   document.querySelector('.board-container').style.backgroundColor = '#014b4b'
   setTimeout(function () {
      document.querySelector('.board-container').style.backgroundColor = '#001f1f'
   }, 450)
}

// Changing the cursor according to the game stage
function changeCursor(type) {
   let cellArr = document.querySelectorAll('.cell')
   cellArr.forEach(el => el.style.cursor = type)
}

// Prevents the context menu from opening after right click
function removeRightClick() {
   let elBorad = document.querySelector('.board-container')
   elBorad.addEventListener("contextmenu", (e) => {
      e.preventDefault()
   })
}

// Debugging function for the developer
function deBug() {
   isDebug = !isDebug;
   // document.querySelector('.debug').innerText = isDebug
}
