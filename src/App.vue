<template>
  <div id="app">
    <!-- Main Content -->
    <router-view />
    <BottomNavbar v-if="showNavbar" />
    <!-- Box based on theme -->
    <div :class="['theme-box', theme]" ref="themeBox"></div>
  </div>
</template>

<script setup>
import { provide, onMounted, computed, ref, nextTick, onUnmounted } from 'vue';
import '@mdi/font/css/materialdesignicons.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { auth } from '../firebase'; // Firebase auth importieren
import { useRouter, useRoute } from 'vue-router';
import BottomNavbar from "./components/BottomNavbar.vue"; // Vue Router verwenden

const theme = ref('light');
const themeBox = ref(null);

const toggleTheme = () => {
  theme.value = theme.value === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-bs-theme', theme.value);
  
  localStorage.setItem('theme', theme.value);
};

const adjustBoxHeight = () => {
  const navbar = document.querySelector('.navbar');
  if (navbar && themeBox.value) {
    const navbarHeight = navbar.offsetHeight;
    themeBox.value.style.height = `calc(${navbarHeight}px)`;
  }
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

  nextTick(adjustBoxHeight);
  window.addEventListener('resize', adjustBoxHeight);
});

onUnmounted(() => {
  window.removeEventListener('resize', adjustBoxHeight);
});
</script>

<style scoped>
.form-check-input {
  cursor: pointer;
}
.theme-box {
  width: 100%;
  overflow: auto;
}
.theme-box.light {
  background-color: #ffffff;
}
.theme-box.dark {
  background-color: #000000;
}
</style>
