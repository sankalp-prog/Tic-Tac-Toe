<template>
  <section>
    <h1>Tic Tac Toe</h1>
    <h2>SessionId: {{ sessionId }}</h2>
    <div id="grid">
      <div class="square" v-for="square in squares" :key="square.id" @click="playerInput(square.id)">
        {{ square.value }}
      </div>
    </div>
    <div v-if="result === 'player'">You Win</div>
    <div v-else-if="result === 'opponent'">Opponent wins</div>
    <div v-else-if="result === 'draw'">It's a Draw</div>
    <button @click="resetGame">Reset Game</button>
  </section>
</template>

<script>
let userId;
if (localStorage.userId) {
  userId = localStorage.userId;
} else {
  userId = Math.floor(Math.random() * 100);
  localStorage.userId = userId;
}
export default {
  props: ['sessionId'],
  mounted() {
    setInterval(async () => {
      if (this.sessionId == 0) {
        return;
      }
      const response = await fetch(`/api/updateBoard/${this.sessionId}`);
      const data = await response.json();
      this.squares = data.squares;
      if (data.result) {
        if (data.result == userId) {
          this.result = 'player';
        } else if (data.result === 'Draw') {
          this.result = 'draw';
        } else {
          this.result = 'opponent';
        }
      }
    }, 1000);
  },
  data() {
    return {
      playerTurn: userId,
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
    };
  },
  methods: {
    async playerInput(squareId) {
      // Check for player to do nothing if he clicks on a pre-populated square.
      if (this.result !== '') {
        return;
      }
      const backendData = await this.testBackend(squareId);
      this.char = backendData;
      if (this.squares[squareId].value === '') {
        // below line not required but reduces latency in frontend
        this.squares[squareId].value = this.char;
      }
    },

    async testBackend(squareId) {
      const response = await fetch(`/api/squares/${userId}/${this.sessionId}?selectedSquareId=${squareId}`);
      const data = await response.text();
      return data;
    },

    async resetGame() {
      await fetch(`/api/resetGame/${this.sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });
      console.log('hello');
      this.result = '';
    },
  },
};
</script>

<style scoped>
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
