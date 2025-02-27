<template>
  <div :class="['container', { 'dark-mode': isDarkMode }]">
    <div class="row justify-content-center mt-5">
      <div class="col-md-8">
        <div class="d-flex justify-content-between mb-4">
          <h3 class="fw-bold">Settings</h3>
          <div class="form-check form-switch">
            <input
                class="form-check-input"
                type="checkbox"
                id="darkModeSwitch"
                v-model="isDarkMode"
            />
            <label class="form-check-label" for="darkModeSwitch">
              Dark Mode
            </label>
          </div>
        </div>

        <div class="mb-4">
          <Logout />
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
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
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
/* Dark Mode styles */
.dark-mode {
  background-color: #121212;
  color: white;
}

.dark-mode .card {
  background-color: #1e1e1e;
  color: white;
}

.dark-mode .form-control {
  background-color: #333;
  color: white;
  border: 1px solid #555;
}

.dark-mode .form-check-input:checked {
  background-color: #007bff;
}

.dark-mode .form-check-label {
  color: white;
}
</style>
