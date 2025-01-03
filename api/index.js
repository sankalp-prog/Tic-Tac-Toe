require('dotenv').config()
const express = require('express');
const cors = require('cors');
const pg = require('pg');

const app = express();

app.use(cors());

const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

db.connect();
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
    return sessionSquares[winningTriple[0]] === playerMarker && sessionSquares[winningTriple[1]] === playerMarker && sessionSquares[winningTriple[2]] === playerMarker;
  });
}

const createRandomSessionId = () => String(Math.floor(1000000 + Math.random() * 900000));

app.get('/api/createSession/:userId', (req, res) => {
  const userId = Number(req.params.userId);
  const gameId = createRandomSessionId();
  // 'player_turn = true' for when it's playerX's turn to play.
  db.query('INSERT INTO game (game_id, squares, playerX, player_turn) VALUES ($1, $2, $3, $4)', [gameId, '_________', userId, true], (err) => {
    if (err) {
      console.error('Error executing query', err.stack);
    }
  });
  return res.send(gameId);
});

app.get('/api/joinSession/:userId/:sessionId', async (req, res) => {
  const sessionId = Number(req.params.sessionId);
  const userId = Number(req.params.userId);
  const queryResult = await db.query('SELECT * FROM game WHERE game_id = $1', [sessionId]);
  const gameSession = queryResult ? queryResult.rows[0] : null;

  // check to see if sessionId already exists in db
  if (!gameSession || (gameSession.playero && gameSession.playerx)) {
    // 400: Bad Request
    return res.sendStatus(400);
  }

  db.query('UPDATE game SET playero = $1 WHERE game_id = $2', [userId, sessionId], (err) => {
    if (err) {
      console.error('Error executing playero update query', err.stack);
    }
  });
  // it sometimes thinks I'm sending a status and crashes the server so sending as string
  // also IDK why I'm sending something back
  return res.send(String(sessionId));
});


function formatSquares(compressedString) {
  const squares = [];
  compressedString.split('').forEach((value, i) => {
    squares.push({ id: i, value: value == '_' ? '' : value });
  });
  return squares;
}

app.get('/api/updateBoard/:sessionId', async (req, res) => {
  const sessionId = Number(req.params.sessionId);
  const queryResult = await db.query('SELECT result, squares FROM game WHERE game_id = $1', [sessionId]);
  const gameData = queryResult?.rows[0] || null;
  const squares = formatSquares(gameData.squares);
  return res.json({ result: gameData.result, squares: squares });
});

const isBoardFull = (squares) => !squares.includes('_');

app.get('/api/squares/:userId/:sessionId', async (req, res) => {
  const userId = Number(req.params.userId);
  const sessionId = Number(req.params.sessionId);
  const queryResult = await db.query('SELECT * FROM game WHERE game_id = $1', [sessionId]);
  const gameData = queryResult.rows[0] || null;
  const player = gameData.player_turn == true ? gameData.playerx : gameData.playero;
  const playerChar = player == gameData.playerx ? 'X' : 'O';

  if (player != userId) {
    return res.sendStatus(403);
  }
  console.log('before change: ', gameData);
  // Adding the char of the player to the square
  const squareId = Number(req.query.selectedSquareId);

  if (gameData.squares[squareId] != '_') {
    return res.send('square taken');
  }
    gameData.squares = gameData.squares.substring(0, squareId) + playerChar + gameData.squares.substring(squareId + 1);

    // format the squares like before adding db so that below code works like usual
    // const squares = formatSquares(gameData.squares);

    // check for winning
    if (checkForWin(playerChar, gameData.squares)) {
      // X = 1, O = 2
      gameData.result = playerChar == 'X' ? 1 : 2;
    } else if (isBoardFull(gameData.squares)) {
      // Draw = 3
      gameData.result = 3;
    }
    // Toggling to the other players turn 
    gameData.player_turn = !gameData.player_turn;

    console.log('after change: ', gameData);
    db.query('UPDATE game SET squares = $1, player_turn = $2, result = $3 WHERE game_id = $4', [gameData.squares, gameData.player_turn, gameData.result, sessionId]);
    return res.send(playerChar);
});

// checked below route on browser by swithing method to GET -
app.post('/api/resetGame/:sessionId', (req, res) => {
  const sessionId = Number(req.params.sessionId);
  db.query('UPDATE game SET squares = $1, player_turn = true, result = null WHERE game_id = $2', ['_________', sessionId]);
  return res.sendStatus(200);
});

app.listen(8000, () => {
  console.log('Backend listening on port 8000');
});
