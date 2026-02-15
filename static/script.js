const boardDiv = document.getElementById("board");
const statusMessage = document.getElementById("statusMessage");
const replayBtn = document.getElementById("replayBtn");

let cells = [];
let gameOver = false;

// Create board
for (let i = 0; i < 42; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.dataset.column = i % 7;
    cell.addEventListener("click", makeMove);
    boardDiv.appendChild(cell);
    cells.push(cell);
}

function makeMove(event) {

    if (gameOver) return;

    const column = event.target.dataset.column;

    fetch("/move", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ column: column })
    })
    .then(response => response.json())
    .then(data => {

        updateBoard(data.board);

        if (data.status) {
            statusMessage.innerText = data.status;
            gameOver = true;
            return;
        }

        if (data.ai_turn) {
            setTimeout(() => {
                fetch("/ai_move", {
                    method: "POST"
                })
                .then(response => response.json())
                .then(aiData => {

                    updateBoard(aiData.board);

                    if (aiData.status) {
                        statusMessage.innerText = aiData.status;
                        gameOver = true;
                    }
                });
            }, 1000);
        }
    });
}

function updateBoard(board) {
    for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 7; c++) {
            let value = board[r][c];
            let index = (5 - r) * 7 + c;

            if (value === 0) {
                cells[index].style.backgroundColor = "lightblue";
            } else if (value === 1) {
                cells[index].style.backgroundColor = "red";
            } else if (value === 2) {
                cells[index].style.backgroundColor = "yellow";
            }
        }
    }
}

// Replay button
replayBtn.addEventListener("click", () => {

    fetch("/reset", {
        method: "POST"
    })
    .then(response => response.json())
    .then(data => {
        updateBoard(data.board);
        statusMessage.innerText = "";
        gameOver = false;
    });
});
