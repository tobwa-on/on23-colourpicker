<template>
  <div id="app">
    <router-view />
    <BottomNavbar />
  </div>
</template>

<script setup>
import '@mdi/font/css/materialdesignicons.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { onMounted } from 'vue';
import { auth } from '../firebase'; // Firebase auth importieren
import { useRouter } from 'vue-router';
import BottomNavbar from "./components/BottomNavbar.vue"; // Vue Router verwenden

const router = useRouter(); // Router-Instanz

onMounted(() => {
  auth.onAuthStateChanged(user => {
    if (!user) {
      router.push('/login');
    }
  });
});
</script>