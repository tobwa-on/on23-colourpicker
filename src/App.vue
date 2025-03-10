<template>
  <div id="app">
    <!-- Main Content -->
    <router-view />
    <BottomNavbar v-if="showNavbar" />
  </div>
</template>

<script setup>
import { provide, onMounted, computed, ref } from 'vue';
import '@mdi/font/css/materialdesignicons.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { auth } from '../firebase'; // Firebase auth importieren
import { useRouter, useRoute } from 'vue-router';
import BottomNavbar from "./components/BottomNavbar.vue"; // Vue Router verwenden

const theme = ref('light');

const toggleTheme = () => {
  theme.value = theme.value === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-bs-theme', theme.value);
  
  localStorage.setItem('theme', theme.value);
};


provide('theme', theme);
provide('toggleTheme', toggleTheme);

// Navbar nur anzeigen, wenn die aktuelle Route nicht "/login" oder "/register" ist
const router = useRouter();
const route = useRoute();
const showNavbar = computed(() => !['/login', '/register'].includes(route.path));

onMounted(() => {
  auth.onAuthStateChanged(user => {
    if (!user) {
      router.push('/login');
    }
  });

  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    theme.value = savedTheme;
    document.documentElement.setAttribute('data-bs-theme', savedTheme);
  } else {
    document.documentElement.setAttribute('data-bs-theme', theme.value);
  }
});
</script>

<style scoped>
.form-check-input {
  cursor: pointer;
}
</style>
