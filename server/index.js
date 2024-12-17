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

let winningSquares = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function checkForWin(playerMarker) {
  for (let winningSquare of winningSquares) {
    let [a, b, c] = winningSquare;
    let squareA = squares[a];
    let squareB = squares[b];
    let squareC = squares[c];
    if (squareA.value === playerMarker && squareB.value === playerMarker && squareC.value === playerMarker) {
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
    if (checkForWin(users[req.params.id])) {
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
  // check to see that if player reloads he should still be playing that char
  if (!users[req.params.id]) {
    users[Number(req.params.id)] = Object.keys(users).length === 0 ? 'X' : 'O';
  }
});

app.get('/api/resetGame', (req, res) => {
  result = undefined;

  squares = [
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

  winningSquares = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
});

// Random sessionId as key and then the player info of that session as an object as the value
// end goal: sessions = {1234567: {71: 'X', 72: 'O'}}
const sessions = {};
app.get('/api/createSessionId/:id/:sessionId', (req, res) => {
  // generate a 6 digit session id if sessionId is not provided
  const sessionId = req.params.sessionId ? req.params.sessionId : Math.floor(100000 + Math.random() * 900000);
  const userId = req.params.id;
  if (!req.params.sessionId) {
    // add first player
    sessions[sessionId] = { [userId]: 'X' };
    // return the sessionId
    return res.send(sessionId);
  } else if (req.params.sessionId && sessions[sessionId] && Object.keys(sessions[sessionId]).length < 2) {
    // add second player
    sessions[sessionId][req.params.id] = 'O';
  } else {
    return res.send('Error: more than 2 players detected');
  }
});

app.listen(8000, () => {
  console.log('Backend listening on port 8000');
});
