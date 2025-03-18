<template>
  <div class="container mt-4">
    <div class="row justify-content-center">
      <div class="col-md-8 col-lg-6 position-relative">
        <!-- Theme Toggle -->
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

        <!-- Option Containers -->
        <div
          :class="['option-container p-3 mb-3 d-flex align-items-center justify-content-between', theme === 'dark' ? 'bg-dark-mode' : 'bg-light-mode']"
          @click="openGuide"
        >
          <span class="option-text">Guide</span>
          <i class="icon-large mdi mdi-information"></i>
        </div>

        <div
          :class="['option-container p-3 mb-3 d-flex align-items-center justify-content-between', theme === 'dark' ? 'bg-dark-mode' : 'bg-light-mode']"
          @click="changePassword"
        >
          <span class="option-text">Change Password</span>
          <i class="icon-large mdi mdi-lock-reset"></i>
        </div>

        <div
          :class="['option-container p-3 mb-3 d-flex align-items-center justify-content-between', theme === 'dark' ? 'bg-dark-mode' : 'bg-light-mode']"
          @click="openDeleteAccountModal"
        >
          <span class="option-text">Delete Account</span>
          <i class="icon-large mdi mdi-delete"></i>
        </div>

        <!-- Logout-Sektion -->
        <div
          :class="['option-container p-3 mb-3 d-flex align-items-center justify-content-between', theme === 'dark' ? 'bg-dark-mode' : 'bg-light-mode', 'bg-danger']"
          @click="logout"
        >
          <span class="option-text text-white">Logout</span>
          <i class="icon-large mdi mdi-logout text-white"></i>
        </div>

        <!-- Footer -->
        <div class="footer text-center text-muted mt-auto">
          &copy; 2025 ON23
        </div>

        <!-- Change Password Modal -->
        <div v-if="showModal" class="modal-overlay">
          <div class="modal-content" :class="theme">
            <h3 class="modal-title">Change Password</h3>
            <form @submit.prevent="handleSubmit">
              <div class="modal-body">
                <input
                  v-model="currentPassword"
                  type="password"
                  class="form-control"
                  placeholder="Enter current password"
                  required
                />
                <div class="mb-3">
                  <input
                    v-model="newPassword"
                    type="password"
                    class="form-control"
                    placeholder="Enter new password"
                    required
                  />
                </div>
                <div class="mb-3">
                  <input
                    v-model="confirmPassword"
                    type="password"
                    class="form-control"
                    placeholder="Confirm new password"
                    required
                  />
                </div>
              </div>
              <div class="modal-footer modal-buttons mt-3">
                <button type="button" class="btn btn-secondary mdi mdi-close" @click="closePasswordModal">
                  Cancel
                </button>
                <button type="submit" class="btn btn-primary mdi mdi-check">
                  Save
                </button>
              </div>
            </form>

            <div v-if="isPasswordChanged" class="text-success">
              <p>Password successfully changed!</p>
            </div>
            <div v-if="errorMessage" class="text-danger">
              <p>{{ errorMessage }}</p>
            </div>
          </div>
        </div>

        <!-- Guide Modal -->
        <div v-if="showGuideModal" class="modal-overlay guideModal">
          <div class="modal-content" :class="theme">
            <h3 class="modal-title">Welcome to the Color Manager PWA!</h3>
            <div class="guide-modal-body">
              <p>
                <strong>Colors:</strong> In the "Colors" section, you'll find your color collections. You can create new collections and add colors to them. Additionally, you can edit, delete, or download your collections for use in design programs.
              </p>
              
              <p>
                <strong>Home:</strong> The "Home" tab lets you scan colors using your camera. Once scanned, you can add the colors directly to your collections, making it easy to save and organize your color palette.
              </p>
              
              <p>
                <strong>Settings:</strong> In the "Settings" tab, you can access the guide to help you navigate the app, switch between Dark Mode and Light Mode for a personalized experience, log out of your account, or change your password for better security.
              </p>   
            </div>
            <div class="modal-footer modal-buttons mt-3">
              <button type="button" class="btn btn-secondary mdi mdi-close" @click="closeGuideModal">
                Close
              </button>
            </div>
          </div>
        </div>

        <!-- Delete Account Modal -->
        <div v-if="showDeleteAccountModal" class="modal-overlay">
          <div class="modal-content" :class="theme">
            <h3 class="modal-title">Confirm Account Deletion</h3>
            <form @submit.prevent="handleDeleteAccount">
              <div class="modal-body">
                <input
                  v-model="password"
                  type="password"
                  class="form-control"
                  placeholder="Enter your password"
                  required
                />
              </div>
              <div class="modal-footer modal-buttons mt-3">
                <button type="button" class="btn btn-secondary mdi mdi-close" @click="closeDeleteAccountModal">
                  Cancel
                </button>
                <button type="submit" class="btn btn-danger mdi mdi-delete">
                  Delete
                </button>
              </div>
            </form>
            <div v-if="deleteErrorMessage" class="text-danger">
              <p>{{ deleteErrorMessage }}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, getCurrentInstance } from 'vue';
import { getAuth, signOut, updatePassword, reauthenticateWithCredential, EmailAuthProvider, deleteUser } from 'firebase/auth';
import { isLoggingOut } from '../services/CollectionService.js'; // Import the flag

const auth = getAuth();
const theme = inject('theme');
const toggleTheme = inject('toggleTheme');

const showModal = ref(false);
const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const isPasswordChanged = ref(false);
const errorMessage = ref('');

const showDeleteAccountModal = ref(false);
const password = ref('');
const deleteErrorMessage = ref('');

// Füge showGuideModal hinzu
const showGuideModal = ref(false);

// changePassword-Funktion, die das Modal öffnet
const changePassword = async () => {
  showModal.value = true;
};

const closePasswordModal = () => {
  showModal.value = false;
  currentPassword.value = '';
  newPassword.value = '';
  confirmPassword.value = '';
  errorMessage.value = '';
};

const handleSubmit = async () => {
  if (newPassword.value !== confirmPassword.value) {
    errorMessage.value = "Passwords do not match!";
    return;
  }

  if (!isValidPassword(newPassword.value)) {
    errorMessage.value = "The password must be at least 8 characters long and contain a number, a special character, and upper and lower case letters.";
    return;
  }

  const user = auth.currentUser;

  if (!user) {
    errorMessage.value = "You need to be logged in to change your password.";
    return;
  }

  const credential = EmailAuthProvider.credential(user.email, currentPassword.value);

  try {
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, newPassword.value);
    isPasswordChanged.value = true; // Zeige Erfolgsmeldung
    proxy.$showToastMessage('success', 'Password successfully changed');
    setTimeout(() => {
      isPasswordChanged.value = false; // Setze Erfolgsmeldung zurück
      closePasswordModal(); // Schließe das Modal und leere die Eingabefelder
    }, 1500); // Warte 2 Sekunden, bevor das Modal und die Erfolgsmeldung verschwinden
  } catch (error) {
    console.error("Error updating password:", error);
    errorMessage.value = "The current password you submitted is wrong. Please try again.";
  }
};

const isValidPassword = (password) => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  return regex.test(password);
};

const { proxy } = getCurrentInstance();

const logout = async () => {
  if (!auth.currentUser) {
    proxy.$showToastMessage('error', 'User is already logged out');
    return;
  }

  try {
    isLoggingOut.value = true; // Set the flag to true
    await signOut(auth);
  } catch (error) {
    proxy.$showToastMessage('error', 'Error during logout');
    console.error('Error during logout:', error);
  } finally {
    isLoggingOut.value = false; // Reset the flag
  }
};

// Öffnet das Guide Modal
const openGuide = () => {
  showGuideModal.value = true;
};

// Schließt das Guide Modal
const closeGuideModal = () => {
  showGuideModal.value = false;
};

const openDeleteAccountModal = () => {
  showDeleteAccountModal.value = true;
};

const closeDeleteAccountModal = () => {
  showDeleteAccountModal.value = false;
  password.value = '';
  deleteErrorMessage.value = '';
};

const handleDeleteAccount = async () => {
  const user = auth.currentUser;

  if (!user) {
    deleteErrorMessage.value = "You need to be logged in to delete your account.";
    return;
  }

  const credential = EmailAuthProvider.credential(user.email, password.value);

  try {
    await reauthenticateWithCredential(user, credential);
    await deleteUser(user);
    proxy.$showToastMessage('success', 'Account deleted successfully');
    await router.push('/login');
  } catch (error) {
    console.error("Error deleting account:", error);
    deleteErrorMessage.value = "The password you submitted is wrong. Please try again.";
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
  font-size: 1rem;
  font-weight: 500;
  border-radius: 6px; /* Ecken abrunden */
  padding: 8px 16px;
  transition: background-color 0.3s;
}

.btn-primary {
  background-color: #007bff;
  border: 1px solid #007bff;
}

.btn-primary:hover {
  background-color: #0056b3;
  border-color: #0056b3;
}

.btn-secondary {
  background-color: #6c757d;
  border: 1px solid #6c757d;
}

.btn-secondary:hover {
  background-color: #5a6268;
  border-color: #5a6268;
}

/* Modal Overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: #ffffff;
  padding: 30px;
  border-radius: 10px;
  width: 90%;
  max-width: 400px;
  text-align: center;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.modal-footer .btn {
  flex: 1;
  margin: 0;
}

input {
  border: 1px solid #ccc;
  padding: 8px;
  border-radius: 4px;
  outline: none;
  width: 100%;
  margin-top: 10px;
}

input:focus {
  border-color: #007bff;
  outline: 2px solid #007bff;
}

.modal-buttons {
  display: flex;
  width: 100%;
  gap: 10px;
}

.modal-buttons .btn {
  flex: 1;
  margin: 0;
}

.modal-content.light {
  background-color: #ffffff;
  color: #000000;
}

.modal-content.dark {
  background-color: #1e1e1e;
  color: #ffffff;
}

.scrollableBox{
  height: 45vh; /* Fixe Höhe festlegen */
  overflow-y: auto;
}

.guide-modal-body{
  height: 300px; /* Fixe Höhe festlegen */
  overflow-y: auto;
}
</style>
