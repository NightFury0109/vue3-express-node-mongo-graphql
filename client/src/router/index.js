import { createRouter, createWebHashHistory } from "vue-router";
import Home from "../pages/Home.vue";
import Login from "../pages/Login.vue";
import Register from '../pages/Register.vue';
import Article from '../pages/Article.vue';
import ArticleView from '../pages/ArticleView.vue';
import ResetPassword from '../pages/ResetPassword.vue';

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
  },
  {
    path: '/article/:articleId',
    component: ArticleView
  },
  {
    path: '/resetPassword/:userId/:token',
    component: ResetPassword
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;