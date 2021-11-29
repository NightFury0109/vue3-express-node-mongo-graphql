import { createStore } from 'vuex';

import { user } from './user';
import { article } from './article';

const store = createStore({
  modules: {
    user,
    article
  }
});

export default store;
