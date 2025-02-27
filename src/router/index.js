import { createRouter, createWebHistory } from 'vue-router';
import Login from '../components/Login.vue';
import Register from '../components/Register.vue';
import HomeView from "../views/HomeView.vue";
import PaletteView from "../views/PaletteView.vue";
import SettingsView from "../views/SettingsView.vue";
import {auth} from "../../firebase.js";

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
        path: '/home',
        name: 'Home',
        component: HomeView,
        // Auth-Guard: Nur zugänglich, wenn der Benutzer eingeloggt ist
        meta: { requiresAuth: true }
    },
    {
        path: '/palettes',
        name: 'Palette',
        component: PaletteView,
        // Auth-Guard: Nur zugänglich, wenn der Benutzer eingeloggt ist
        meta: { requiresAuth: true }
    },
    {
        path: '/settings',
        name: 'Settings',
        component: SettingsView,
        // Auth-Guard: Nur zugänglich, wenn der Benutzer eingeloggt ist
        meta: { requiresAuth: true }
    },
    {
        // Catch-All Route für alle unbekannten Routen
        path: '/:pathMatch(.*)*',
        redirect: '/home'  // Umleiten zur Login-Seite bei nicht gefundenem Pfad
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;
