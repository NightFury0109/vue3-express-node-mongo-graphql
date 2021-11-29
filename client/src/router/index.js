import { createRouter, createWebHashHistory } from "vue-router";
import Home from "../pages/Home.vue";
import Login from "../pages/Login.vue";
import Register from '../pages/Register.vue';
import Article from '../pages/Article.vue';

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
  },
  {
    path: '/article',
    component: Article
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;