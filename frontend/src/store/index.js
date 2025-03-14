import { createStore } from 'vuex';
import { auth } from './auth.module';
import { items } from './items.module';

export default createStore({
  modules: {
    auth,
    items
  }
});