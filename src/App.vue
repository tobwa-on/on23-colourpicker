<template>
  <div id="app">
    <router-view /> <!-- Der Bereich, in dem die Komponenten je nach Route geladen werden -->
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { auth } from '../firebase'; // Firebase auth importieren
import { useRouter } from 'vue-router'; // Vue Router verwenden

const router = useRouter(); // Router-Instanz

onMounted(() => {
  // Auth-Status überwachen und Navigation durchführen
  auth.onAuthStateChanged(user => {
    if (user) {
      // Wenn der Benutzer eingeloggt ist, zum Dashboard weiterleiten
      router.push('/dashboard');
    } else {
      // Wenn der Benutzer nicht eingeloggt ist, zur Login-Seite weiterleiten
      router.push('/login');
    }
  });
});
</script>