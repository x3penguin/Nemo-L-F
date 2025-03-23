import { createStore } from 'vuex';
import { auth } from './auth.module';
import { items } from './items.module';
import { notifications } from './notifications.module';

export default createStore({
  modules: {
    auth,
    items,
    notifications
  }
});