const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());

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

function checkForWin(playerMarker, sessionSquares) {
  for (let winningSquare of winningSquares) {
    let [a, b, c] = winningSquare;
    let squareA = sessionSquares[a];
    let squareB = sessionSquares[b];
    let squareC = sessionSquares[c];
    if (squareA.value === playerMarker && squareB.value === playerMarker && squareC.value === playerMarker) {
      return true;
    }
  }
  return false;
}

// Random sessionId as key and then the game info of that session as an object as the value
// end goal: sessions = {1234567: {users: {Id1: 'X', Id2: 'O'}, squares: squares, playerTurn: playerTurn, result: result}}
const sessions = {};
app.get('/api/users/:id/:sessionId', (req, res) => {
  // Objects will anyways convert Number to string
  let sessionId = req.params.sessionId == 0 ? String(Math.floor(1000000 + Math.random() * 900000)) : req.params.sessionId;
  /* sessionId = req.params.sessionId || String(Math.floor(1000000 + Math.random() * 900000)); 
     Above line doesn't work as if undefined is passed as query params it's passed as string 'undefined'
  */

  const userId = req.params.id;
  if (!sessions[sessionId]) {
    sessions[sessionId] = {};
    sessions[sessionId].users = {}
    sessions[sessionId].squares = JSON.parse(JSON.stringify(squares));
  }
  const session = sessions[sessionId];
  if (Object.keys(session.users).length >= 2) {
    return;
  }
  // check to see that if player reloads he should still be playing that char
  if (!session.users[userId]) {
    session.users[userId] = Object.keys(session.users).length === 0 ? 'X' : 'O';
  }
  console.log(sessions);
  return res.send(sessionId);
});

app.get('/api/updateBoard/:sessionId', (req, res) => {
  return res.json(sessions[req.params.sessionId]);
});

app.get('/api/squares/:id/:sessionId', (req, res) => {
  const session = sessions[req.params.sessionId];
  if (session.playerTurn && session.playerTurn != req.params.id) {
    return;
  }
  // Adding the char of the player to the square
  const square = JSON.parse(req.query.selectedSquare);
  if (session.squares[square.id].value === '') {
    session.squares[square.id] = { id: square.id, value: session.users[req.params.id] };
    // check for winning
    if (checkForWin(session.users[req.params.id], session.squares)) {
      session.result = req.params.id;
    } else if (!session.squares.find((square) => square.value === '')) {
      session.result = 'Draw';
    }
    // Very crude way of saying that it's now the opponents turn
    session.playerTurn = Object.keys(session.users).length === 2 ? Object.keys(session.users).find((user) => user != req.params.id) : Object.keys(session.users)[0];
    return res.send(session.users[req.params.id]);
  }
});

app.get('/api/resetGame/:sessionId', (req, res) => {
  const session = sessions[req.params.sessionId];
  session.squares = JSON.parse(JSON.stringify(squares));
  if (session.playerTurn) session.playerTurn = undefined;
  if (session.result) session.result = undefined;
});

// end goal: sessions = {1234567: {users: {Id1: 'X', Id2: 'O'}, squares: squares, playerTurn: playerTurn, result: result}}
// REALIZATION: the functionality is almost identical to that of the users route
// app.get('/api/createSessionId/:id/:sessionId', (req, res) => {
//   if (req.params.id) {
//     return;
//   }
//   // // generate a 6 digit session id if sessionId is not provided
//   let sessionId = req.params.sessionId || Math.floor(1000000 + Math.random() * 900000);
//   const userId = req.params.id;
//   sessions[sessionId] = {};
//   const session = sessions[sessionId];
//   if (!req.params.sessionId) {
//     // make a deep copy of squares and store it in sessions
//     session.squares = JSON.parse(JSON.stringify(squares));
//     // add first player
//     session.users = { [userId]: 'X' };
//     return res.send(sessionId);
//   } else if (req.params.sessionId && sessions[sessionId] && Object.keys(sessions[sessionId]).length < 2) {
//     // add second player
//     sessions[sessionId][userId] = 'O';
//   }
// });

app.listen(8000, () => {
  console.log('Backend listening on port 8000');
});
