<template>
  <div>
    <button @click="createSession">Create Session</button>
    <button class="joinSession btn" @click="joinSession">Join Session</button>
    <input type="text" v-model="joinSessionId" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

let userId;
if (localStorage.userId) {
  userId = localStorage.userId;
} else {
  userId = Math.floor(Math.random() * 100);
  localStorage.userId = userId;
}

let joinSessionId = ref();
let sessionId;

async function createSession() {
  const response = await fetch(`/api/createSession/${userId}`);
  sessionId = await response.text();
  console.log('create session:');
  console.log(sessionId);
  router.push({ name: 'Game', params: { sessionId: sessionId } });
}

async function joinSession() {
  sessionId = joinSessionId.value;
  await fetch(`/api/joinSession/${userId}/${sessionId}`);
  console.log(sessionId);
  router.push({ name: 'Game', params: { sessionId: sessionId } });
}
</script>

<style scoped></style>
