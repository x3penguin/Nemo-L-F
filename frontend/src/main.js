import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import './assets/styles/index.css';

// Setup axios interceptors for authentication
import './services/api';

// Import Firebase configuration
import './firebase';

const app = createApp(App);

app.use(router);
app.use(store);
app.mount('#app');