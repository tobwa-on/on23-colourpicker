<template>
  <div class="container mt-4">
    <div class="row justify-content-center">
      <div class="col-md-8 col-lg-6 position-relative">
        <div class="theme-toggle">
          <input
              type="checkbox"
              id="themeToggle"
              class="d-none"
              @change="toggleTheme"
              :checked="theme === 'dark'"
          />
          <label for="themeToggle" class="toggle-label">
            <span class="toggle-icon sun">
              <i class="mdi mdi-weather-sunny"></i>
            </span>
            <span class="toggle-icon moon">
              <i class="mdi mdi-weather-night"></i>
            </span>
            <span class="toggle-slider"></span>
          </label>
        </div>

        <!-- Header -->
        <div class="header text-center mb-5">
          <h2>Settings</h2>
        </div>

        <div
            :class="['option-container p-3 mb-3 d-flex align-items-center justify-content-between', theme === 'dark' ? 'bg-dark-mode' : 'bg-light-mode']"
            @click="openGuide"
        >
          <span class="option-text">Guide</span>
          <i class="icon-large mdi mdi-information"></i>
        </div>

        <!-- Logout-Sektion -->
        <div class="content">
          <div class="mb-4">
            <button class="btn btn-danger w-100" @click="logout">
              <i class="mdi mdi-logout"></i> Logout
            </button>
          </div>
        </div>

        <!-- Footer -->
        <div class="footer text-center text-muted mt-auto">
          &copy; 2025 ON23
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import {getAuth, signOut} from 'firebase/auth';
import {inject} from 'vue';

const auth = getAuth();
const theme = inject('theme');
const toggleTheme = inject('toggleTheme');

const logout = async () => {
  try {
    await signOut(auth);
    console.log('Logged out successfully');
  } catch (error) {
    console.error('Error during logout:', error);
  }
};

</script>
<style scoped>
.theme-toggle {
  top: 10px;
  right: 10px;
  width: 60px;
  height: 30px;
  z-index: 2;
  position: absolute;
}
.toggle-label {
  display: block;
  position: relative;
  width: 100%;
  height: 100%;
  background: #e0e0e0;
  border-radius: 50px;
  cursor: pointer;
  transition: background 0.3s;
  padding: 0 5px;
}
.toggle-label .toggle-icon {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.2rem;
  transition: opacity 0.3s;
}
.toggle-label .sun {
  left: 8px;
  color: #f39c12;
}
.toggle-label .moon {
  right: 8px;
  color: #95a5a6;
}
.toggle-slider {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 24px;
  height: 24px;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: left 0.3s;
}
.theme-toggle input:checked + .toggle-label .toggle-slider {
  left: calc(100% - 27px);
}
.theme-toggle input:checked + .toggle-label .sun {
  opacity: 0.5;
}
.theme-toggle input:not(:checked) + .toggle-label .moon {
  opacity: 0.5;
}

.header h2 {
  font-size: 2rem;
}

.content {
  margin-bottom: 20px;
}

.footer {
  font-size: 0.9rem;
  color: #888;
  margin-top: auto;
}
.option-container {
  border-radius: 12px;
  cursor: pointer;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2); /* X-Achse, Y-Achse, Unschärfe, Schattenfarbe */
}

.bg-light-mode {
  background-color: #f4f5f4; /* Weiß für Light Mode */
}

/* Styling für Dark Mode */
.bg-dark-mode {
  background-color: #424242;
}

.bg-light-mode:hover {
  background-color: rgba(0, 123, 255, 0.1);
}

.bg-dark-mode:hover {
  background-color: rgba(76, 175, 247, 0.1); /* Leichte Hervorhebung im Dark Mode */
}

/* Text-Styling */
.option-text {
  font-size: 1.2rem;
  font-weight: 500;
}

/* Icon-Styling */
.icon-large {
  font-size: 1.5rem;
  transition: color 0.3s ease;
}

.btn {
  height: 50px;
}

</style>

