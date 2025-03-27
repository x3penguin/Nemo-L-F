import { createStore } from 'vuex';
import { auth } from './auth.module';
import { items } from './items.module';
import { notifications } from './notifications.module';
// import { logistics } from './logistics.module';

export default createStore({
  modules: {
    auth,
    items,
    notifications
  }
});