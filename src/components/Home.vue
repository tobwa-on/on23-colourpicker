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

    <!-- Canvas für Bildanzeige -->
    <div class="mt-3">
      <canvas
        ref="canvas"
        class="img-fluid rounded shadow"
        @click="getColorAtClick"
        @touchstart="getColorAtTouch"
      ></canvas>
    </div>

    <!-- Farbcode Ausgabe -->
    <p v-if="colorCode" class="mt-3">
      Farbcode: <span :style="{ color: colorCode }">{{ colorCode }}</span>
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const cameraInput = ref(null);
const galleryInput = ref(null);
const canvas = ref(null);
const imgData = ref(null);
const colorCode = ref('');

// Kamera-Button triggert das Kamera-Input-Feld
const triggerCamera = () => {
  if (cameraInput.value) cameraInput.value.click();
};

// Galerie-Button triggert das Galerie-Input-Feld
const triggerGallery = () => {
  if (galleryInput.value) galleryInput.value.click();
};

// Bild verarbeiten und auf das Canvas zeichnen
const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file && file.type.startsWith('image/')) {
    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = () => {
      const ctx = canvas.value.getContext('2d');
      const maxWidth = 800;
      const maxHeight = 600;
      let width = img.width;
      let height = img.height;

      // Bild skalieren, falls es zu groß ist
      if (width > maxWidth || height > maxHeight) {
        const scale = Math.min(maxWidth / width, maxHeight / height);
        width *= scale;
        height *= scale;
      }

      // Canvas-Größe setzen und Bild zeichnen
      canvas.value.width = width;
      canvas.value.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      // Bilddaten speichern für spätere Extraktion
      imgData.value = ctx.getImageData(0, 0, canvas.value.width, canvas.value.height);
    };
  }
};

// Farbextraktion bei Klick (Desktop)
const getColorAtClick = (event) => {
  if (!canvas.value) return;

  const rect = canvas.value.getBoundingClientRect();
  const scaleX = canvas.value.width / rect.width;  // Verhältnis zwischen Canvas und angezeigter Größe
  const scaleY = canvas.value.height / rect.height;

  const x = (event.clientX - rect.left) * scaleX;
  const y = (event.clientY - rect.top) * scaleY;

  if (x >= 0 && x < canvas.value.width && y >= 0 && y < canvas.value.height) {
    extractColor(x, y);
  }
};

// Farbextraktion bei Touch (Mobile)
const getColorAtTouch = (event) => {
  if (!canvas.value) return;

  const touch = event.changedTouches[0];
  const rect = canvas.value.getBoundingClientRect();
  const scaleX = canvas.value.width / rect.width;
  const scaleY = canvas.value.height / rect.height;

  const x = (touch.clientX - rect.left) * scaleX;
  const y = (touch.clientY - rect.top) * scaleY;

  if (x >= 0 && x < canvas.value.width && y >= 0 && y < canvas.value.height) {
    extractColor(x, y);
  }
};

// Farbe aus Bilddaten extrahieren
const extractColor = (x, y) => {
  if (!imgData.value) return;

  const ctx = canvas.value.getContext('2d');
  const pixel = ctx.getImageData(x, y, 1, 1).data;

  const colorAtClick = {
    r: pixel[0],
    g: pixel[1],
    b: pixel[2],
    a: pixel[3],
  };

  // Farbcode in Hex umwandeln
  colorCode.value = rgbToHex(colorAtClick.r, colorAtClick.g, colorAtClick.b);
};

// RGB in Hex umwandeln
const rgbToHex = (r, g, b) => {
  return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1).toUpperCase()}`;
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
