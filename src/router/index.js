import { createRouter, createWebHistory } from 'vue-router';
import Login from '../components/Login.vue';
import Register from '../components/Register.vue';
import HomeView from "../views/HomeView.vue";
import CollectionView from "../views/CollectionView.vue";
import SettingsView from "../views/SettingsView.vue";
import PaletteDetail from '../components/CollectionDetail.vue';
import LiveColourPicker from "../components/LiveColourPicker.vue";

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
        path: '/colourpicker',
        name: 'Pick a Colour',
        component: LiveColourPicker,
        // Auth-Guard: Nur zugänglich, wenn der Benutzer eingeloggt ist
        meta: { requiresAuth: true }
    },
    {
        path: '/collections',
        name: 'Collections',
        component: CollectionView,
        // Auth-Guard: Nur zugänglich, wenn der Benutzer eingeloggt ist
        meta: { requiresAuth: true }
    },
    {
        path: '/palette-details/:id',
        name: 'Palette Details',
        component: PaletteDetail,
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
