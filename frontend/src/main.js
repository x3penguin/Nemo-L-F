import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import './assets/styles/index.css';

// Setup axios interceptors for authentication
import './services/api';

const app = createApp(App);


app.use(router);
app.use(store);

//Vue.config.globalProperties.$googleMapsApiKey = 'YOUR_GOOGLE_MAPS_API_KEY';

app.mount('#app');