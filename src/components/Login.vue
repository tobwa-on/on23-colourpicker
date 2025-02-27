<template>
  <div class="login">
    <h2>Login</h2>
    <form @submit.prevent="login">
      <div>
        <label for="email">Email</label>
        <input type="email" v-model="email" required />
      </div>
      <div>
        <label for="password">Password</label>
        <input type="password" v-model="password" required />
      </div>
      <button type="submit">Login</button>
      <div v-if="error" class="error">{{ error }}</div>
    </form>
    <p>Don't have an account? <router-link to="/register">Register here</router-link></p> <!-- Link zur Register-Seite -->
  </div>
</template>


<script setup>

import {onMounted, ref} from 'vue';
import {auth, signInUser} from '../../firebase';
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('');
const error = ref('');
const router = useRouter();

onMounted(() => {
  auth.onAuthStateChanged(user => {
    if (user) {
      router.push('/home');
    }
  });
});


const login = async () => {
  try {
    await signInUser(email.value, password.value);
    await router.push('/home'); // Erfolgreiches Login, Weiterleitung zum Dashboard
  } catch (err) {
    error.value = err.message; // Fehlerbehandlung
  }
};
</script>

<style scoped>
.error {
  color: red;
}
</style>
