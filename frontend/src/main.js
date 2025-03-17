import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import Vue from 'vue'
import './assets/styles/index.css';

// Setup axios interceptors for authentication
import './services/api';

const app = createApp(App);

app.use(router);
app.use(store);
app.mount('#app');

Vue.config.globalProperties.$googleMapsApiKey = 'YOUR_GOOGLE_MAPS_API_KEY';

new Vue({
    render: h => h(App),
  }).$mount('#app')