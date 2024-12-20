<template>
  <div>
    <button @click="createSession">Create Session</button>
    <button class="joinSession btn" @click="createSession">Join Session</button>
    <input type="text" v-model="joinSessionId" />
    <!-- <TicTacToe /> -->
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

let id;
if (localStorage.userId) {
  id = localStorage.userId;
} else {
  id = Math.floor(Math.random() * 100);
  localStorage.userId = id;
}

let joinSessionId = ref();
let sessionId;

async function updateUsers() {
  const response = await fetch(`http://localhost:8000/api/users/${id}/${sessionId}`);
  const data = await response.text();
  sessionId = data;
}

async function createSession() {
  sessionId = joinSessionId.value || 0;
  await updateUsers();
  console.log(sessionId);
  router.push({ name: 'Game', params: { sessionId: sessionId } });
}
</script>

<style scoped></style>
