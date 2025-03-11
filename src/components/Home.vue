<template>
  <div class="container mt-4">
    <div class="header-section">
      <h1 class="title">Colour Picker</h1>
    </div>

    <div class="button-container">
      <button class="btn btn-primary" @click="triggerCamera">
        <span class="mdi mdi-camera icon-large"></span>
        <span class="btn-text">Click here to open the camera</span>
      </button>
      <button class="btn btn-secondary mt-4" @click="triggerGallery">
        <span class="mdi mdi-image icon-large"></span>
        <span class="btn-text">Click here to choose a picture</span>
      </button>
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
  </div>
</template>

<script setup>
import { ref } from 'vue';
import router from "../router/index.js";

const cameraInput = ref(null);
const galleryInput = ref(null);
const canvas = ref(null);

const triggerCamera = () => {
  router.push('/colourpicker');
}

</script>

<style scoped>
.header-section {
  text-align: center;
}

.button-container {
  display: flex;
  flex-direction: column;
  justify-content: space-evenly; /* Verteilt die Buttons gleichmäßig über die gesamte Höhe */
  align-items: center;
  height: 70vh;               /* Nimmt die gesamte Bildschirmhöhe ein */
  padding: 20px;
  box-sizing: border-box;      /* Stellt sicher, dass Padding nicht die Höhe beeinflusst */
}

.btn {
  display: flex;
  flex-direction: column;      /* Icons und Text untereinander anordnen */
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 35vh;
  padding: 20px;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s ease;
}

.icon-large {
  font-size: 3rem;
  margin-bottom: 10px;
}

.btn-text {
  font-size: 1.1rem;
}

.btn-primary {
  background-color: #007aff;
  color: #ffffff;
}

.btn-secondary {
  background-color: #f0f0f0;
  color: #333333;
}

canvas {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
  cursor: crosshair;
}

</style>
