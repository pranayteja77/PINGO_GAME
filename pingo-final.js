let numbers = [], playerMarks = [], computerMarks = [];
let playerLines = new Set(), letterIndex = 0;
let turn = "player", gameOver = false;
const letters = ["P", "I", "N", "G", "O"];

function startGame() {
  numbers = shuffle(Array.from({ length: 25 }, (_, i) => i + 1));
  playerMarks = [];
  computerMarks = [];
  playerLines.clear?.();
  playerLines = new Set();
  letterIndex = 0;
  gameOver = false;
  turn = "player";
  document.getElementById("status").innerText = "Your Turn";
  document.getElementById("winner").innerText = "";
  document.getElementById("computer-section").style.display = "none";
  renderBoard();
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

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
    letter.innerText = "";
    rowLetters.appendChild(letter);

    const col = document.createElement("div");
    col.innerText = "";
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

function handleClick(value, cell) {
  if (gameOver || turn !== "player") return;
  if (playerMarks.includes(value) || computerMarks.includes(value)) return;

  playerMarks.push(value);
  markCell(cell, "player");

  setTimeout(() => {
    const available = numbers.filter(n => !playerMarks.includes(n) && !computerMarks.includes(n));
    const comp = available[Math.floor(Math.random() * available.length)];
    computerMarks.push(comp);
    const cell2 = [...document.querySelectorAll(".cell")].find(c => +c.innerText === comp);
    if (cell2) markCell(cell2, "computer");

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
      // Animate the strike effect
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
  const rowLetters = document.getElementById("row-letters");
  const colLetters = document.getElementById("col-letters");
  const diagLeft = document.getElementById("diag-left");
  const diagRight = document.getElementById("diag-right");
  const letter = letters[letterIndex] || "";

  // Clear previous letters if needed
  if (letterIndex === 0) {
    rowLetters.innerHTML = '';
    colLetters.innerHTML = '';
    diagLeft.innerText = '';
    diagRight.innerText = '';
    
    // Create letter containers
    for (let i = 0; i < 5; i++) {
      const rowLetter = document.createElement('div');
      rowLetter.className = 'letter';
      rowLetters.appendChild(rowLetter);
      
      const colLetter = document.createElement('div');
      colLetter.className = 'letter';
      colLetters.appendChild(colLetter);
    }
  }

  letterIndex++;

  if (index >= 0 && index < 5) {
    // Row completion (right side)
    rowLetters.children[index].innerText = letter;
  } 
  else if (index >= 5 && index < 10) {
    // Column completion (above)
    colLetters.children[index-5].innerText = letter;
  } 
  else if (index === 10) {
    // Diagonal ↘ (top-left corner)
    diagLeft.innerText = letter;
    diagLeft.style.left = "-25px";
    diagLeft.style.top = "0";
  } 
  else if (index === 11) {
    // Diagonal ↙ (top-right corner)
    diagRight.innerText = letter;
    diagRight.style.right = "-25px";
    diagRight.style.top = "0";
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

window.onload = startGame;