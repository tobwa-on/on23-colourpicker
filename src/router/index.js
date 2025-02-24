import { createRouter, createWebHistory } from 'vue-router';
import Login from '../components/Login.vue';
import Dashboard from '../components/Dashboard.vue';
import Register from '../components/Register.vue'; // Register-Komponente importieren

const routes = [
    {
        path: '/login',
        name: 'Login',
        component: Login
    },
    {
        path: '/register',
        name: 'Register',
        component: Register // Register-Route hinzufügen
    },
    {
        path: '/dashboard',
        name: 'Dashboard',
        component: Dashboard
    },
    {
        // Catch-All Route für alle unbekannten Routen
        path: '/:pathMatch(.*)*',
        redirect: '/login'  // Umleiten zur Login-Seite bei nicht gefundenem Pfad
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;
