let numbers = [], playerMarks = [], computerMarks = [];
let playerLines = new Set(), letterIndex = 0;
let turn = "player", gameOver = false;
const letters = ["P", "I", "N", "G", "O"];
let gameMode = "auto";
let timeLeft = 150; // 2:30 in seconds
let timerInterval;
let dragSrcEl = null;

// Reset game completely (back to mode selection)
function resetGame() {
  clearInterval(timerInterval);
  document.getElementById("game").style.display = "none";
  document.getElementById("mode-selection").style.display = "block";
  document.getElementById("computer-section").style.display = "none";
  document.getElementById("restart-btn").style.display = "none";
  document.getElementById("number-pool").style.display = "none";
}

// Mode Selection
function selectMode(mode) {
  gameMode = mode;
  document.getElementById("mode-selection").style.display = "none";
  document.getElementById("game").style.display = "block";
  document.getElementById("restart-btn").style.display = "block";
  startGame();
}

// Game Initialization
function startGame() {
  clearInterval(timerInterval);
  
  numbers = Array.from({ length: 25 }, (_, i) => i + 1);
  playerMarks = [];
  computerMarks = [];
  playerLines.clear?.();
  playerLines = new Set();
  letterIndex = 0;
  gameOver = false;
  turn = "player";
  timeLeft = 150;
  
  document.getElementById("status").innerText = gameMode === "manual" ? "Place your numbers (2:30)" : "Your Turn";
  document.getElementById("winner").innerText = "";
  document.getElementById("computer-section").style.display = "none";
  document.getElementById("timer").className = "";
  document.getElementById("timer").textContent = "Time Left: 2:30";
  
  if (gameMode === "auto") {
    numbers = shuffle([...numbers]);
    renderBoard();
    startTimer();
  } else {
    setupManualMode();
  }
}

// Manual Mode Setup
function setupManualMode() {
  const pool = document.getElementById("number-pool");
  pool.innerHTML = "";
  pool.style.display = "flex";
  
  // Create shuffled number tiles
  const shuffled = shuffle([...numbers]);
  shuffled.forEach(num => {
    const tile = document.createElement("div");
    tile.className = "number-tile";
    tile.textContent = num;
    tile.draggable = true;
    tile.dataset.value = num;
    
    tile.addEventListener("dragstart", handleDragStart);
    tile.addEventListener("dragend", handleDragEnd);
    
    pool.appendChild(tile);
  });
  
  // Create empty board
  const board = document.getElementById("player-board");
  board.innerHTML = "";
  
  for (let i = 0; i < 25; i++) {
    const cell = document.createElement("div");
    cell.className = "cell empty";
    cell.dataset.position = i;
    
    cell.addEventListener("dragover", handleDragOver);
    cell.addEventListener("dragenter", handleDragEnter);
    cell.addEventListener("dragleave", handleDragLeave);
    cell.addEventListener("drop", handleDrop);
    cell.addEventListener("click", handleCellClick);
    
    board.appendChild(cell);
  }
  
  startTimer();
}

// Timer Functions
function startTimer() {
  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();
    
    if (timeLeft <= 30) {
      document.getElementById("timer").classList.add("time-warning");
    }
    
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      if (gameMode === "manual") {
        const emptyCells = document.querySelectorAll(".cell.empty");
        if (emptyCells.length > 0) {
          autoCompleteBoard();
        } else {
          startGamePlay();
        }
      }
    }
  }, 1000);
}

function updateTimerDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  document.getElementById("timer").textContent = 
    `Time Left: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

// Auto-fill remaining numbers
function autoCompleteBoard() {
  const board = document.getElementById("player-board");
  const cells = board.querySelectorAll(".cell.empty");
  const pool = document.getElementById("number-pool");
  const availableTiles = [...pool.querySelectorAll(".number-tile:not(.placed)")];
  
  cells.forEach((cell, index) => {
    if (index < availableTiles.length) {
      const num = parseInt(availableTiles[index].dataset.value);
      cell.textContent = num;
      cell.classList.remove("empty", "highlight");
      availableTiles[index].classList.add("placed");
      numbers[parseInt(cell.dataset.position)] = num;
    }
  });
  
  startGamePlay();
}

function startGamePlay() {
  // Remove drag-drop event listeners
  const cells = document.querySelectorAll(".cell");
  cells.forEach(cell => {
    const newCell = cell.cloneNode(true);
    cell.replaceWith(newCell);
    newCell.onclick = () => handleClick(numbers[parseInt(newCell.dataset.position)], newCell);
  });
  
  // Hide number pool
  document.getElementById("number-pool").style.display = "none";
  document.getElementById("status").innerText = "Your Turn";
  
  // Initialize game
  turn = "player";
  gameOver = false;
  playerMarks = [];
  computerMarks = [];
}

// Drag and Drop Functions
function handleDragStart(e) {
  dragSrcEl = this;
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', this.innerHTML);
  setTimeout(() => this.classList.add('dragging'), 0);
}

function handleDragEnd() {
  this.classList.remove('dragging');
}

function handleDragOver(e) {
  if (e.preventDefault) e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  return false;
}

function handleDragEnter(e) {
  if (this.classList.contains("empty")) {
    this.classList.add("highlight");
  }
}

function handleDragLeave() {
  this.classList.remove("highlight");
}

function handleDrop(e) {
  if (e.stopPropagation) e.stopPropagation();
  
  if (dragSrcEl && this.classList.contains("empty")) {
    const num = parseInt(dragSrcEl.dataset.value);
    this.textContent = num;
    this.classList.remove("empty", "highlight");
    dragSrcEl.classList.add("placed");
    numbers[parseInt(this.dataset.position)] = num;
    
    // Check if board is complete
    if (document.querySelectorAll(".cell:not(.empty)").length === 25) {
      startGamePlay();
    }
  }
  return false;
}

function handleCellClick() {
  if (gameMode === "manual" && this.classList.contains("empty")) {
    const pool = document.getElementById("number-pool");
    const availableTile = pool.querySelector(".number-tile:not(.placed)");
    if (availableTile) {
      const num = parseInt(availableTile.dataset.value);
      this.textContent = num;
      this.classList.remove("empty");
      availableTile.classList.add("placed");
      numbers[parseInt(this.dataset.position)] = num;
      
      if (document.querySelectorAll(".cell:not(.empty)").length === 25) {
        startGamePlay();
      }
    }
  }
}

// Game Board Rendering
function renderBoard() {
  const board = document.getElementById("player-board");
  const rowLetters = document.getElementById("row-letters");
  const colLetters = document.getElementById("col-letters");
  const diagLeft = document.getElementById("diag-left");
  const diagRight = document.getElementById("diag-right");
  board.innerHTML = "";
  rowLetters.innerHTML = "";
  colLetters.innerHTML = "";
  diagLeft.innerText = "";
  diagRight.innerText = "";

  for (let i = 0; i < 5; i++) {
    const letter = document.createElement("div");
    letter.className = "letter";
    rowLetters.appendChild(letter);

    const col = document.createElement("div");
    col.className = "letter";
    colLetters.appendChild(col);
  }

  for (let i = 0; i < 25; i++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.innerText = numbers[i];
    cell.onclick = () => handleClick(numbers[i], cell);
    board.appendChild(cell);
  }
}

// Game Logic
function handleClick(value, cell) {
  if (gameOver || turn !== "player") return;
  if (playerMarks.includes(value) || computerMarks.includes(value)) return;

  playerMarks.push(value);
  markCell(cell, "player");

  setTimeout(() => {
    const available = numbers.filter(n => !playerMarks.includes(n) && !computerMarks.includes(n));
    if (available.length > 0) {
      const comp = available[Math.floor(Math.random() * available.length)];
      computerMarks.push(comp);
      const cell2 = [...document.querySelectorAll(".cell")].find(c => +c.innerText === comp);
      if (cell2) markCell(cell2, "computer");
    }

    checkLines(() => {
      if (!gameOver) {
        turn = "player";
        document.getElementById("status").innerText = "Your Turn";
      }
    });
  }, 500);
}

function markCell(cell, who) {
  if (cell.classList.contains("marked") || cell.classList.contains("computer")) {
    cell.classList.remove("marked", "computer");
    cell.classList.add("both");
  } else {
    cell.classList.add(who === "player" ? "marked" : "computer");
  }
}

function checkLines(callback) {
  const all = new Set([...playerMarks, ...computerMarks]);
  const board = [...document.querySelectorAll(".cell")];

  const lines = [
    ...[0, 1, 2, 3, 4].map(r => [0, 1, 2, 3, 4].map(c => r * 5 + c)), // rows
    ...[0, 1, 2, 3, 4].map(c => [0, 1, 2, 3, 4].map(r => r * 5 + c)), // columns
    [0, 6, 12, 18, 24], // diag ↘
    [4, 8, 12, 16, 20], // diag ↙
  ];

  let lineCompleted = false;

  for (let i = 0; i < lines.length; i++) {
    const indexes = lines[i];
    const nums = indexes.map(idx => numbers[idx]);
    if (nums.every(n => all.has(n)) && !playerLines.has(i)) {
      indexes.forEach((idx, j) => {
        setTimeout(() => {
          board[idx].classList.add("strike");
        }, j * 100);
      });
      
      displayLetter(i);
      lineCompleted = true;
      playerLines.add(i);
    }
  }

  if (playerLines.size >= 5 && !gameOver) {
    gameOver = true;
    clearInterval(timerInterval);
    document.getElementById("status").innerText = "";
    document.getElementById("winner").innerText = "🎉 You completed PINGO! You Win!";
    showComputerBoard();
    return;
  }

  if (lineCompleted) {
    document.getElementById("status").innerText = `🔔 Line complete → ${letters[letterIndex - 1]}`;
    setTimeout(callback, 1500);
  } else {
    callback();
  }
}

function displayLetter(index) {
  const rowLetters = document.getElementById("row-letters").children;
  const colLetters = document.getElementById("col-letters").children;
  const diagLeft = document.getElementById("diag-left");
  const diagRight = document.getElementById("diag-right");

  const letter = letters[letterIndex] || "";
  letterIndex++;

  if (index >= 0 && index < 5) {
    rowLetters[index].innerText = letter;
    rowLetters[index].style.transform = "scale(1.5)";
    setTimeout(() => rowLetters[index].style.transform = "scale(1)", 300);
  } 
  else if (index >= 5 && index < 10) {
    colLetters[index - 5].innerText = letter;
    colLetters[index - 5].style.transform = "scale(1.5)";
    setTimeout(() => colLetters[index - 5].style.transform = "scale(1)", 300);
  } 
  else if (index === 10) {
    diagLeft.innerText = letter;
    diagLeft.style.transform = "scale(1.5)";
    setTimeout(() => diagLeft.style.transform = "scale(1)", 300);
  } 
  else if (index === 11) {
    diagRight.innerText = letter;
    diagRight.style.transform = "scale(1.5)";
    setTimeout(() => diagRight.style.transform = "scale(1)", 300);
  }
}

function showComputerBoard() {
  const section = document.getElementById("computer-section");
  const board = document.getElementById("computer-board");
  section.style.display = "block";
  board.innerHTML = "";

  numbers.forEach(n => {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.innerText = n;
    if (playerMarks.includes(n) && computerMarks.includes(n)) cell.classList.add("both");
    else if (playerMarks.includes(n)) cell.classList.add("marked");
    else if (computerMarks.includes(n)) cell.classList.add("computer");
    board.appendChild(cell);
  });
}

// Utility Functions
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

window.onload = function() {
  document.getElementById("restart-btn").style.display = "none";
};