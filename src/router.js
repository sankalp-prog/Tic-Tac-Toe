import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'Game',
    component: () => import('@/pages/TicTacToe.vue'),
  },
];

let router = createRouter({
  history: createWebHistory('/TicTacToe'),
  routes,
});

export default router;
