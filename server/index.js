const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());

const SQUARES = [
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

function checkForWin(playerMarker, sessionSquares) {
  return winningSquares.some((winningTriple) => {
    return sessionSquares[winningTriple[0]].value === playerMarker && sessionSquares[winningTriple[1]].value === playerMarker && sessionSquares[winningTriple[2]].value === playerMarker;
  });
}

const createRandomSessionId = () => String(Math.floor(1000000 + Math.random() * 900000));

// end goal: sessions = {1234567: {users: {Id1: 'X', Id2: 'O'}, squares: squares, playerTurn: playerTurn, result: result}}
const sessions = {};
app.get('/api/users/:id/:sessionId', (req, res) => {
  const sessionId = req.params.sessionId == 0 ? createRandomSessionId() : req.params.sessionId;

  const userId = req.params.id;
  if (!sessions[sessionId]) {
    sessions[sessionId] = {};
    sessions[sessionId].users = {};
    sessions[sessionId].squares = JSON.parse(JSON.stringify(SQUARES));
  }
  const session = sessions[sessionId];
  const userIdList = Object.keys(session.users);
  if (userIdList.length >= 2) {
    return;
  }
  // check to see that if player reloads he should still be playing that char
  if (!session.users[userId]) {
    session.users[userId] = userIdList.length === 0 ? 'X' : 'O';
  }
  console.log(sessions);
  return res.send(sessionId);
});

app.get('/api/updateBoard/:sessionId', (req, res) => {
  return res.json(sessions[req.params.sessionId]);
});

const isBoardFull = (squares) => !squares.find((square) => square.value === '');

app.get('/api/squares/:id/:sessionId', (req, res) => {
  const session = sessions[req.params.sessionId];
  const userIdList = Object.keys(session.users);
  if (session.playerTurn && session.playerTurn != req.params.id) {
    return;
  }
  // Adding the char of the player to the square
  const squareId = req.query.selectedSquareId;
  const square = session.squares[squareId];
  if (square.value === '') {
    square.value = session.users[req.params.id];
    // check for winning
    if (checkForWin(session.users[req.params.id], session.squares)) {
      session.result = req.params.id;
    } else if (isBoardFull(session.squares)) {
      session.result = 'Draw';
    }
    // Very crude way of saying that it's now the opponents turn
    session.playerTurn = userIdList.length === 2 ? userIdList.find((user) => user != req.params.id) : userIdList[0];
    return res.send(session.users[req.params.id]);
  }
});

app.post('/api/resetGame/:sessionId', (req, res) => {
  const session = sessions[req.params.sessionId];
  session.squares = JSON.parse(JSON.stringify(SQUARES));
  if (session.playerTurn) session.playerTurn = undefined;
  if (session.result) session.result = undefined;
  return;
});

app.listen(8000, () => {
  console.log('Backend listening on port 8000');
});
