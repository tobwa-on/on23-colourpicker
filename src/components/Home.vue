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
      <canvas ref="canvas" class="img-fluid rounded shadow" @click="getColorAtClick" @touchstart="getColorAtTouch"></canvas>
    </div>

    <!-- Farbcode Ausgabe -->
    <p v-if="colorCode" class="mt-3">Farbcode: <span :style="{ color: colorCode }">{{ colorCode }}</span></p>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const cameraInput = ref(null);
const galleryInput = ref(null);
const canvas = ref(null);
const imgData = ref(null); // Store image data for color extraction
const colorCode = ref(''); // Store the extracted color code

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
      const maxWidth = 800; // Maximalbreite des Bildes
      const maxHeight = 600; // Maximalhöhe des Bildes
      let width = img.width;
      let height = img.height;

      // Bild skalieren, wenn nötig
      if (width > maxWidth || height > maxHeight) {
        const scale = Math.min(maxWidth / width, maxHeight / height);
        width *= scale;
        height *= scale;
      }

      // Canvas-Größe an die Bildgröße anpassen
      canvas.value.width = width;
      canvas.value.height = height;

      // Berechnung der Offsets, um das Bild mittig zu positionieren
      const offsetX = (canvas.value.width - width) / 2;
      const offsetY = (canvas.value.height - height) / 2;

      // Canvas leeren und Bild zeichnen
      ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);
      ctx.drawImage(img, offsetX, offsetY, width, height);

      // Store image data for later extraction
      imgData.value = ctx.getImageData(0, 0, canvas.value.width, canvas.value.height);
    };
  }
};


// Funktion zum Extrahieren der Farbe des angeklickten Pixels (Klick-Event)
const getColorAtClick = (event) => {
  const rect = canvas.value.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  extractColor(x, y);
};

// Funktion zum Extrahieren der Farbe des angeklickten Pixels (Touch-Event)
const getColorAtTouch = (event) => {
  const touchEvent = event.changedTouches ? event.changedTouches[0] : event; // Handle touch events
  const rect = canvas.value.getBoundingClientRect();
  const x = touchEvent.clientX - rect.left;
  const y = touchEvent.clientY - rect.top;

  extractColor(x, y);
};

// Funktion zur Extraktion der Farbe aus den Pixeln
const extractColor = (x, y) => {
  if (!imgData.value) return; // Keine Bilddaten vorhanden

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

// Funktion zur Umwandlung von RGB-Werten in einen Hex-Farbcode
const rgbToHex = (r, g, b) => {
  return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1).toUpperCase()}`;
};
</script>

<style scoped>
.container {
  margin-bottom: 150px;
}

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

canvas {
  border: 1px solid #ccc; /* Füge eine Grenze hinzu, um das Canvas sichtbar zu machen */
  background-color: #f0f0f0; /* Setze einen Hintergrund für das Canvas */
  max-width: 100%; /* Canvas maximal an die Breite des Containers anpassen */
  height: auto; /* Das Canvas behält das Seitenverhältnis */
  display: block;
  margin: 0 auto; /* Zentriert das Canvas */
}
</style>
