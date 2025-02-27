<template>
  <div class="container text-center mt-4">
    <h1>Foto aufnehmen oder auswählen</h1>

    <div class="btn-group">
      <!-- Kamera öffnen -->
      <button class="btn btn-primary" @click="triggerCamera">📷 Foto aufnehmen</button>

      <!-- Galerie öffnen -->
      <button class="btn btn-secondary" @click="triggerGallery">🖼️ Galerie öffnen</button>
    </div>

    <!-- Verstecktes Input-Element für Kamera -->
    <input
      ref="cameraInput"
      type="file"
      accept="image/*"
      capture="environment"
      class="d-none"
      @change="handleFileChange"
    />

    <!-- Verstecktes Input-Element für Galerie -->
    <input
      ref="galleryInput"
      type="file"
      accept="image/*"
      class="d-none"
      @change="handleFileChange"
    />

    <!-- Bildvorschau -->
    <div v-if="photo" class="mt-3">
      <h3>Vorschau:</h3>
      <img :src="photo" alt="Aufgenommenes oder ausgewähltes Foto" class="img-fluid rounded shadow" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const photo = ref('');
const cameraInput = ref(null);
const galleryInput = ref(null);

// Kamera-Button triggert das Kamera-Input-Feld
const triggerCamera = () => {
  if (cameraInput.value) cameraInput.value.click();
};

// Galerie-Button triggert das Galerie-Input-Feld
const triggerGallery = () => {
  if (galleryInput.value) galleryInput.value.click();
};

// Bild verarbeiten und Vorschau anzeigen
const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file && file.type.startsWith('image/')) {
    photo.value = URL.createObjectURL(file);
  }
};
</script>

<style scoped>
.btn-group {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.img-fluid {
  max-width: 100%;
  height: auto;
  margin-top: 10px;
}
</style>
