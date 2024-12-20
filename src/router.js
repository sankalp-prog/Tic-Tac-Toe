import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/pages/SessionDashboard.vue'),
  },
  {
    path: '/game/:sessionId',
    name: 'Game',
    component: () => import('@/pages/TicTacToe.vue'),
    props: true,
  },
];

let router = createRouter({
  history: createWebHistory('/TicTacToe'),
  routes,
});

export default router;
