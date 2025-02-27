<template>
  <button @click="logout">Logout</button>
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
button {
  background-color: #ff4d4d;
  color: white;
  border: none;
  padding: 10px 16px;
  font-size: 16px;
  cursor: pointer;
  border-radius: 5px;
}

button:hover {
  background-color: #cc0000;
}
</style>
