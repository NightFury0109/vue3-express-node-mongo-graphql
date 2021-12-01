import { createApp } from 'vue'
import Notifications from '@kyvg/vue3-notification'

import App from './App.vue'
import router from './router/index';
import store from './store/index';

// import { apolloProvider } from './apollo.provider';

const app = createApp(App);

// app.use(apolloProvider);
app.use(Notifications)
app.use(store);
app.use(router);
app.mount('#app');
