const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());

let result;

let squares = [
  { id: 0, value: '' },
  { id: 1, value: '' },
  { id: 2, value: '' },
  { id: 3, value: '' },
  { id: 4, value: '' },
  { id: 5, value: '' },
  { id: 6, value: '' },
  { id: 7, value: '' },
  { id: 8, value: '' },
];

const winningSquares = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function check(char) {
  for (let winningSquare of winningSquares) {
    let [a, b, c] = winningSquare;
    let squareA = squares[a];
    let squareB = squares[b];
    let squareC = squares[c];
    if (squareA.value === char && squareB.value === char && squareC.value === char) {
      return true;
    }
  }
  return false;
}

// const users = {71: 'X', 72: 'O'};
const users = {};
let playerTurn;
app.get('/api/squares/:id', (req, res) => {
  if (playerTurn && playerTurn != req.params.id) {
    return;
  }
  // Adding the char of the player to the square
  const square = JSON.parse(req.query.selectedSquare);
  if (squares[square.id].value === '') {
    squares[square.id] = { id: square.id, value: users[req.params.id] };
    // check for winning
    if (check(users[req.params.id])) {
      result = req.params.id;
    } else if (!squares.find((square) => square.value === '')) {
      result = 'Draw';
    }
    // Very crude way of saying that it's now the opponents turn
    playerTurn = Object.keys(users).length === 2 ? Object.keys(users).find((user) => user != req.params.id) : Object.keys(users)[0];
    return res.send(users[req.params.id]);
  }
});

app.get('/api/updateBoard', (req, res) => {
  res.json({ squares: squares, result: result, playerTurn: playerTurn });
});

app.get('/api/users/:id', (req, res) => {
  if (Object.keys(users).length >= 2) {
    return;
  }
  if (!users[req.params.id]) {
    users[Number(req.params.id)] = Object.keys(users).length === 0 ? 'X' : 'O';
  }
  console.log(users);
});

app.listen(8000, () => {
  console.log('Backend listening on port 8000');
});
