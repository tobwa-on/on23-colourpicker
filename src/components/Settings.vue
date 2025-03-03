<template>
  <div class="container mt-4">
    <div class="header-section">
      <h1 class="title">Settings</h1>
      <button class="info-icon btn btn-danger" @click="logout"> Logout</button>
    </div>

    <div class="card mt-4">
      Hallo hier kommen einstellungen
    </div>
  </div>
</template>

<script setup>
import {getAuth, signOut} from 'firebase/auth';

const auth = getAuth();

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
