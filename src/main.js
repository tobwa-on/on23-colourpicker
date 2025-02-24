import { createApp } from 'vue';
import App from './App.vue';
import router from './router'; // Router importieren

createApp(App)
    .use(router) // Router der Vue-Instanz hinzufügen
    .mount('#app');