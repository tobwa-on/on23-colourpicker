<template>
  <div :class="['auth-container', theme]">
    <div class="card shadow-sm p-4">
      <h2 class="text-center mb-4">Register</h2>
      <form @submit.prevent="register">
        <div class="mb-3">
          <label for="email" class="form-label">Email</label>
          <input type="email" v-model="email" class="form-control" required />
        </div>
        <div class="mb-3">
          <label for="password" class="form-label">Password</label>
          <input type="password" v-model="password" class="form-control" required />
        </div>
        <div class="mb-3">
          <label for="confirmPassword" class="form-label">Confirm Password</label>
          <input type="password" v-model="confirmPassword" class="form-control" required />
        </div>
        <button type="submit" class="btn btn-success w-100">Register</button>
        <div v-if="error" class="text-danger text-center mt-2">{{ error }}</div>
      </form>
      <p class="text-center mt-3">
        Already have an account? <router-link to="/login">Login here</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, getCurrentInstance, inject } from 'vue';
import { registerUser } from '../../firebase';
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const error = ref('');
const router = useRouter();
const { proxy } = getCurrentInstance();
const theme = inject('theme');

const register = async () => {
  error.value = "";

  if (password.value !== confirmPassword.value) {
    error.value = "Passwords do not match.";
    proxy.$showToastMessage('error', error.value);
    return;
  }

  if (!isValidPassword(password.value)) {
    error.value = "The password must be at least 8 characters long and contain a number, a special character, and upper and lower case letters.";
    proxy.$showToastMessage('error', error.value);
    return;
  }

  try {
    // Versuche den Benutzer zu registrieren
    await registerUser(email.value, password.value);
    proxy.$showToastMessage('success', 'Registration successful');
    await router.push('/home');
  } catch (err) {
    // Fehler prüfen und entsprechende Nachrichten anzeigen
    switch (err.code) {
      case "auth/email-already-in-use":
        error.value = "This e-mail address is already in use.";
        break;
      case "auth/invalid-email":
        error.value = "Please enter a valid e-mail address.";
        break;
      case "auth/weak-password":
        error.value = "The password is too weak. Please use a secure password with at least 8 characters, a number, a special character, and upper and lower case letters.";
        break;
      default:
        error.value = "An unknown error has occurred. Please try again later.";
        break;
    }
    proxy.$showToastMessage('error', error.value);
  }
};


const isValidPassword = (password) => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  return regex.test(password);
};

</script>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  padding: 20px;
}

.auth-container.light {
  background: #ffffff;
}

.auth-container.dark {
  background:  #212529;
}

.card {
  width: 100%;
  max-width: 400px;
  border-radius: 10px;
}
</style>
