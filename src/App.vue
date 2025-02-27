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
  auth.onAuthStateChanged(user => {
    if (!user) {
      router.push('/login');
    }
  });
});
</script>