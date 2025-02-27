<template>
  <div id="app">
    <router-view />
    <BottomNavbar v-if="showNavbar" />
  </div>
</template>

<script setup>
import '@mdi/font/css/materialdesignicons.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { onMounted, computed } from 'vue';
import { auth } from '../firebase'; // Firebase auth importieren
import { useRouter, useRoute } from 'vue-router';
import BottomNavbar from "./components/BottomNavbar.vue"; // Vue Router verwenden

const router = useRouter();
const route = useRoute(); // Aktuelle Route abrufen

// Navbar nur anzeigen, wenn die aktuelle Route nicht "/login" oder "/register" ist
const showNavbar = computed(() => !['/login', '/register'].includes(route.path));

onMounted(() => {
  auth.onAuthStateChanged(user => {
    if (!user) {
      router.push('/login');
    }
  });
});
</script>
