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

// const users = {71: 'X', 72: 'O'};
const users = {};
app.get('/api/squares/:id', (req, res) => {
  if (Object.keys(users).length > 2) {
    res.send('Error: More than 2 Players detected.');
  }
  // First player to start will be assigned X , second player will be assigned O
  if (Object.keys(users).length !== 2) {
    users[req.params.id] = Object.keys(users).length === 0 ? 'X' : 'O';
  }
  // Adding the char of the player to the square
  console.log(req.query.selectedSquare)
  squares[req.query.selectedSquare.id] = {id: req.query.selectedSquare.id, value: users[req.params.id]};
  res.send(users[req.params.id]);
});

app.get('/api/updateBoard', (req, res) => {
  // console.log(squares);
  // console.log(users)
  res.json(squares);
});

app.listen(8000, () => {
  console.log('Backend listening on port 8000');
});
