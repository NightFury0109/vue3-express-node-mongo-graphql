import { createRouter, createWebHashHistory } from "vue-router";
import Home from "../pages/Home.vue";
import Login from "../pages/Login.vue";
import Register from '../pages/Register.vue';

const routes = [
  {
    path: "/",
    component: Home,
  },
  {
    path: "/login",
    component: Login,
  },
  {
    path: '/register',
    component: Register
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;