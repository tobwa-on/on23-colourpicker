<template>
  <div class="register">
    <h2>Register</h2>
    <form @submit.prevent="register">
      <div>
        <label for="email">Email</label>
        <input type="email" v-model="email" required />
      </div>
      <div>
        <label for="password">Password</label>
        <input type="password" v-model="password" required />
      </div>
      <div>
        <label for="confirmPassword">Confirm Password</label>
        <input type="password" v-model="confirmPassword" required />
      </div>
      <button type="submit">Register</button>
      <div v-if="error" class="error">{{ error }}</div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { registerUser} from '../../firebase'; // Firebase auth importieren
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const error = ref('');
const router = useRouter();

const register = async () => {
  if (password.value !== confirmPassword.value) {
    error.value = "Passwords do not match!";
    return;
  }

  try {
    // Neues Benutzerkonto erstellen
    await registerUser(email.value, password.value);
    await router.push('/dashboard'); // Erfolgreiche Registrierung, Weiterleitung zum Dashboard
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
