<template>
  <div class="container mt-4">

    <div class="header-section">
      <h1 class="title">Settings</h1>
      <button class="info-icon btn btn-danger" @click="logout"> Logout</button>
    </div>

    <!-- Account Settings -->
    <div class="card mb-4">
      <div class="card-header">
        <h5 class="mt-2 ">Account Settings</h5>
      </div>
      <div class="card-body">
        <form @submit.prevent="saveSettings">
          <div class="mb-3">
            <label for="username" class="form-label">Username</label>
            <input
                type="text"
                class="form-control"
                id="username"
                v-model="username"
                required
            />
          </div>
          <div class="mb-3">
            <label for="email" class="form-label">Email</label>
            <input
                type="email"
                class="form-control"
                id="email"
                v-model="email"
                required
            />
          </div>
          <button type="submit" class="btn btn-primary">Save</button>
        </form>
      </div>
    </div>

    <!-- Notification Settings -->
    <div class="card mb-4">
      <div class="card-header">
        <h5 class="mt-2 ">Notification Settings</h5>
      </div>
      <div class="card-body">
        <div class="form-check">
          <input
              class="form-check-input"
              type="checkbox"
              id="emailNotifications"
              v-model="emailNotifications"
          />
          <label class="form-check-label" for="emailNotifications">
            Receive Email Notifications
          </label>
        </div>
        <div class="form-check mt-3">
          <input
              class="form-check-input"
              type="checkbox"
              id="smsNotifications"
              v-model="smsNotifications"
          />
          <label class="form-check-label" for="smsNotifications">
            Receive SMS Notifications
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted, watch} from 'vue';
import Logout from "./Logout.vue";

// Dark mode state
const isDarkMode = ref(false);

// User settings
const username = ref('');
const email = ref('');
const emailNotifications = ref(false);
const smsNotifications = ref(false);

// Watch dark mode and save to localStorage
watch(isDarkMode, (newVal) => {
  localStorage.setItem('darkMode', newVal);
});

// Load saved settings from localStorage
onMounted(() => {
  const savedMode = localStorage.getItem('darkMode');
  if (savedMode !== null) {
    isDarkMode.value = JSON.parse(savedMode);
  }
});

</script>

<style scoped>
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-size: 1.4rem;
  font-weight: bold;
  color: dimgrey;
}

</style>
