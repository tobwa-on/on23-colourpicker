<template>
  <div :class="['auth-container', theme]">
    <div class="card shadow-sm p-4">
      <h2 class="text-center mb-4">Login</h2>
      <form @submit.prevent="login">
        <div class="mb-3">
          <label for="email" class="form-label">Email</label>
          <input type="email" v-model="email" class="form-control" required />
        </div>
        <div class="mb-3">
          <label for="password" class="form-label">Password</label>
          <input type="password" v-model="password" class="form-control" required />
        </div>
        <button type="submit" class="btn btn-primary w-100">Login</button>
        <div v-if="error" class="text-danger text-center mt-2">{{ error }}</div>
      </form>
      <p class="text-center mt-3">
        Don't have an account? <router-link to="/register">Register here</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, getCurrentInstance, inject } from 'vue';
import { auth } from '../../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('');
const error = ref('');
const router = useRouter();
const { proxy } = getCurrentInstance();
const theme = inject('theme');

const login = async () => {
  error.value = "";
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value);
    if (userCredential.user) {
      await router.push('/home');
    }
  } catch (err) {
    switch (err.code) {
      case "auth/invalid-credential":
      case "auth/user-not-found":
      case "auth/wrong-password":
        error.value = "Invalid e-mail or password. Please try again.";
        proxy.$showToastMessage('error', error.value);
        break;
      case "auth/too-many-requests":
        error.value = "Too many failed attempts. Please try again later.";
        proxy.$showToastMessage('error', error.value);
        break;
      case "auth/user-disabled":
        error.value = "Your account has been deactivated. Please contact support.";
        proxy.$showToastMessage('error', error.value);
        break;
      case "auth/invalid-email":
        error.value = "Please enter a valid e-mail address.";
        proxy.$showToastMessage('error', error.value);
        break;
      case "auth/missing-password":
        error.value = "Please enter your password.";
        proxy.$showToastMessage('error', error.value);
        break;
      default:
        error.value = "An unknown error has occurred. Please try again later.";
        proxy.$showToastMessage('error', error.value);
        break;
    }
   
  }
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
  background: #212529;
}

.card {
  width: 100%;
  max-width: 400px;
  border-radius: 10px;
}
</style>
