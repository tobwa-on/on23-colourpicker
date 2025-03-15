<template>
  <nav :class="['navbar fixed-bottom nav-modern', theme === 'dark' ? 'bg-dark' : 'bg-light']">
    <div class="container-fluid d-flex justify-content-around">
      <router-link to="/collections" class="nav-item" active-class="active">
        <i class="mdi mdi-palette"></i>
        <span>Colors</span>
      </router-link>

      <router-link to="/home" class="nav-item" active-class="active">
        <i class="mdi mdi-home"></i>
        <span>Home</span>
      </router-link>

      <router-link to="/settings" class="nav-item" active-class="active">
        <i class="mdi mdi-cog"></i>
        <span>Settings</span>
      </router-link>
    </div>
  </nav>
</template>

<script setup>
import {inject} from 'vue';

const theme = inject('theme'); // Erwartet "light" oder "dark"
</script>

<style scoped>
/* Moderner Hintergrund mit Blur */
.nav-modern {
  padding: 10px 0 30px 0;
  transition: background-color 0.3s ease;
}

.bg-dark.nav-modern {
  background-color: rgba(33, 37, 41, 0.9);
}

.bg-light.nav-modern {
  background-color: #FBFBFB;
}

.nav-item {
  text-align: center;
  color: #555;
  width: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  transition: transform 0.3s ease, color 0.3s ease;
}

.nav-item i {
  font-size: 24px;
  transition: background-color 0.3s ease, padding 0.3s ease;
}

.nav-item span {
  font-size: 12px;
  display: block;
}

/* Wenn nicht aktiv: einfacher Hover-Effekt */
.nav-item:hover:not(.active) {
  transform: translateY(-5px);
}

/* Dark Mode Anpassungen */
.bg-dark .nav-item {
  color: #ccc;
}

.bg-dark .nav-item.active {
  color: #4dabf7;
}

.bg-light .nav-item.active {
  color: #4dabf7;
}

</style>
