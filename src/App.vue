<template>
  <section>
    <h1>Tic Tac Toe</h1>
    <div id="grid">
      <div class="square" v-for="square in squares" :key="square.id" @click="playerInput(square.id)">
        {{ square.value }}
      </div>
    </div>
    <div v-if="result === 'player'">Player wins</div>
    <div v-else-if="result === 'computer'">Computer wins</div>
    <div v-else-if="result === 'draw'">It's a Draw</div>
    <button @click="reset">Reset</button>
    <select @change="setDifficulty">
      <option value="random">Random</option>
      <option value="medium">Medium</option>
      <option value="impossible">Impossible</option>
    </select>
  </section>
</template>

<script>
export default {
  data() {
    return {
      difficulty: 'random',
      char: '',
      result: '',
      squares: [
        { id: 0, value: '' },
        { id: 1, value: '' },
        { id: 2, value: '' },
        { id: 3, value: '' },
        { id: 4, value: '' },
        { id: 5, value: '' },
        { id: 6, value: '' },
        { id: 7, value: '' },
        { id: 8, value: '' },
      ],
      winningSquares: [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
      ],
    };
  },
  methods: {
    setDifficulty(event) {
      this.difficulty = event.target.value;
    },
    chooseRandomSquare() {
      let selectedSquare;
      do {
        const num = Math.floor(Math.random() * 9);
        selectedSquare = this.squares[num];
      } while (selectedSquare.value !== '');
      return selectedSquare;
    },

    chooseBlockingSquare(char) {
      for (let winningSquaresTriple of this.winningSquares) {
        const numXs = winningSquaresTriple.filter((squareId) => this.squares[squareId].value === char).length;
        if (numXs != 2) {
          continue;
        }
        const emptySquareId = winningSquaresTriple.find((squareId) => this.squares[squareId].value === '');
        if (emptySquareId === undefined) {
          continue;
        }
        // Go one emptySquare
        return this.squares[emptySquareId];
      }
      return null;
    },

    chooseMiddleSquare() {
      return this.squares[4].value === '' ? this.squares[4] : null;
    },

    computeNext() {
      if (this.difficulty === 'random' || (this.difficulty === 'medium' && Math.random() < 0.2)) {
        return this.chooseRandomSquare();
      }
      let selectedSquare = this.chooseMiddleSquare();
      if (selectedSquare != null) {
        return selectedSquare;
      }
      selectedSquare = this.chooseBlockingSquare('O');
      if (selectedSquare != null) {
        return selectedSquare;
      }
      selectedSquare = this.chooseBlockingSquare('X');
      if (selectedSquare != null) {
        return selectedSquare;
      }
      return this.chooseRandomSquare();
    },

    computerInput() {
      if (this.result !== '') {
        return;
      }
      this.char = 'O';
      const selectedSquare = this.computeNext();
      selectedSquare.value = this.char;
      if (this.check()) {
        this.result = 'computer';
      }
    },

    playerInput(id) {
      // Check for player to do nothing if he clicks on a pre-populated square.
      if (this.result !== '') {
        return;
      }
      this.char = 'X';
      const selectedSquare = this.squares[id];
      if (selectedSquare.value === '') {
        selectedSquare.value = this.char;
        if (this.check()) {
          this.result = 'player';
        } else if (this.squares.find((square) => square.value === '')) {
          this.computerInput();
        } else {
          this.result = 'draw';
        }
      }
    },
    check() {
      for (let i = 0; i < this.winningSquares.length; i++) {
        let [a, b, c] = this.winningSquares[i];
        let squareA = this.squares[a];
        let squareB = this.squares[b];
        let squareC = this.squares[c];
        if (squareA.value === this.char && squareB.value === this.char && squareC.value === this.char) {
          return true;
        }
      }
      return false;
    },
    reset() {
      this.char = '';
      this.result = '';
      this.squares = [
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
    },
  },
};
</script>

<style>
#grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.square {
  border-style: solid;
  border-width: 2px;
  padding: 16px;
  text-align: center;
}
</style>
