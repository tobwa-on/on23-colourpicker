<template>
  <div class="container mt-4">
    <div class="header-section">
      <h1 class="title">Settings</h1>
    </div>

    <button class="info-icon btn btn-danger" @click="logout"> Logout</button>

    <div class="card mt-4">
      Hallo hier kommen einstellungen
    </div>

    <!-- Dark Mode Toggle Button -->
    <div class="form-check form-switch mt-4">
      <input
          class="form-check-input"
          type="checkbox"
          id="themeToggle"
          :checked="theme === 'dark'"
          @change="toggleTheme"
      />
      <label class="form-check-label" for="themeToggle">Dark Mode</label>
    </div>
  </div>
</template>

<script setup>
import {getAuth, signOut} from 'firebase/auth';
import {inject} from 'vue';

const auth = getAuth();
const theme = inject('theme');
const toggleTheme = inject('toggleTheme'); // Ensure toggleTheme is injected

const logout = async () => {
  try {
    await signOut(auth);
    console.log('Erfolgreich ausgeloggt');
  } catch (error) {
    console.error('Fehler beim Logout:', error);
  }
};
</script>

<style scoped>
.header-section {
  text-align: center;
}

.form-check-input {
  cursor: pointer;
}
</style>
