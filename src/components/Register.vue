<template>
  <div class="auth-container">
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
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { registerUser } from '../../firebase';
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
    await registerUser(email.value, password.value);
    await router.push('/home');
  } catch (err) {
    error.value = err.message;
  }
};
</script>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #f8f9fa;
  padding: 20px;
}

.card {
  width: 100%;
  max-width: 400px;
  border-radius: 10px;
}
</style>
