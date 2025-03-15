<template>
  <div id="app">
    <!-- Toast Container -->
    <div v-if="showToast" class="toast-container position-fixed top-0 end-0 p-3">
      <div
        v-for="(toast, index) in toasts"
        :key="index"
        class="toast show"
        :class="['toast', `toast-${toast.type === 'danger' ? 'error' : toast.type}`]"
        data-bs-autohide="true"
        aria-live="assertive"
        aria-atomic="true"
        @click="removeToast(index)"
      >
        <div class="toast-header">
          <strong class="me-auto">{{ toast.type.charAt(0).toUpperCase() + toast.type.slice(1) }}</strong>
        </div>
        <div class="toast-body">
          {{ toast.message }}
        </div>
      </div>
    </div>
    <!-- Main Content -->
    <router-view />
    <BottomNavbar v-if="showNavbar" />
    <!-- Box based on theme -->
    <div :class="['theme-box', theme]" ref="themeBox"></div>
  </div>
</template>

<script setup>
import { provide, onMounted, computed, ref, nextTick, onUnmounted, getCurrentInstance } from 'vue';
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

const toasts = ref([]); // List of toasts
const showToast = ref(true); // Show toasts if true

const showToastMessage = (type, message) => {
  const newToast = { type, message };
  toasts.value.push(newToast);
  setTimeout(() => removeToast(0), 2000); // Remove toast after 5 seconds
};

const removeToast = (index) => {
  toasts.value.splice(index, 1); // Remove toast from list
};

// Make showToastMessage globally available
const app = getCurrentInstance().appContext.app;
app.config.globalProperties.$showToastMessage = showToastMessage;
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
  background-color: #212529;
}
.toast-container {
  z-index: 1050;
  width: 100%; /* Make the toast container full width */
  left: 0; /* Align the container to the left */
}
.toast {
  opacity: 1 !important; /* Ensure the toast is fully visible */
  background-color: transparent !important; /* Remove default background color */
  width: 100%; /* Make each toast full width */
}
.toast-success {
  background-color: #d4edda !important; /* Pastel green for body */
  color: #155724 !important; /* Dark green text */
}
.toast-success .toast-header {
  background-color: #28a745 !important; /* Bright green for header */
  color: white !important; /* White text */
}
.toast-error {
  background-color: #f8d7da !important; /* Pastel red for body */
  color: #721c24 !important; /* Dark red text */
}
.toast-error .toast-header {
  background-color: #dc3545 !important; /* Bright red for header */
  color: white !important; /* White text */
}
.toast-info {
  background-color: #d1ecf1 !important; /* Pastel blue for body */
  color: #0c5460 !important; /* Dark blue text */
}
.toast-info .toast-header {
  background-color: #17a2b8 !important; /* Bright blue for header */
  color: white !important; /* White text */
}
.toast-warning {
  background-color: #fff3cd !important; /* Pastel yellow for body */
  color: #856404 !important; /* Dark yellow text */
}
.toast-warning .toast-header {
  background-color: #ffc107 !important; /* Bright yellow for header */
  color: white !important; /* White text */
}
</style>
