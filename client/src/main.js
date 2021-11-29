import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index';
import store from './store/index';

// import { apolloProvider } from './apollo.provider';

const app = createApp(App);

// app.use(apolloProvider);
app.use(store);
app.use(router);
app.mount('#app');
