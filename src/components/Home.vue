<template>
  <div class="container mt-4">
    <div class="header-section">
      <h1 class="title">Colour Palette</h1>
      <button class="info-icon btn-outline-secondary" @click="showTutorial"> ❓ </button>
    </div>

    <div v-if="showTutorialPopup" class="overlay"></div>

    <div v-if="showTutorialPopup" class="overlay" @click="closeTutorialPopup">
      <div class="tutorial-popup">
        <h2 class="bold">Was muss ich tun?</h2>
        <ol>
          <li>Foto aufnehmen oder auswählen</li>
          <li>Farbe auswählen</li>
          <li>Farbe in Palette speichern</li>
        </ol>
        <button class="btn btn-danger" @click="closeTutorialPopup">Schließen</button>
      </div>
    </div>

    <div class="btn-group w-100 mt-4">
      <button class="btn btn-primary btn-lg" @click="triggerCamera">📷 Foto aufnehmen</button>
      <button class="btn btn-secondary btn-lg" @click="triggerGallery">🖼️ Galerie öffnen</button>
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
          class="img-fluid rounded flat"
          @click="getColorAtClick"
          @touchstart="getColorAtTouch"
      ></canvas>
    </div>

    <!-- Overlay Background when the popup is visible -->
    <div v-if="selectedColor" class="overlay"></div>

    <div v-if="selectedColor" class="color-popup">
      <div class="color-info">
        <!-- Farbfeld -->
        <div class="color-swatch" :style="{ backgroundColor: selectedColor }"></div>
        <div class="color-code">
          <p><strong>Farbcodes:</strong></p>
          <p>Hex: {{ selectedColor }}</p>
          <p>RGB: {{ rgbColor }}</p>
        </div>
      </div>
      <div class="button-group">
        <button class="btn btn-success"  @click="confirmColor">Bestätigen</button>
        <button class="btn btn-danger" @click="resetColor">Abbrechen</button>
      </div>
    </div>



    <div v-if="showFinalDialog" class="final-dialog">
      <p>Farbe gespeichert!</p>
      <button class="btn btn-primary" @click="closeFinalDialog">OK</button>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue';

const cameraInput = ref(null);
const galleryInput = ref(null);
const canvas = ref(null);
const selectedColor = ref(null);
const rgbColor = ref(null);
const showFinalDialog = ref(false);
const showTutorialPopup = ref(false);

const imgData = ref(null);

const triggerCamera = () => cameraInput.value.click();
const triggerGallery = () => galleryInput.value.click();

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file && file.type.startsWith('image/')) {
    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = () => {
      const ctx = canvas.value.getContext('2d');
      const maxWidth = 800;
      const maxHeight = 500;
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
  selectedColor.value = rgbToHex(colorAtClick.r, colorAtClick.g, colorAtClick.b);
  rgbColor.value = hexToRgbString(selectedColor.value);
};

// RGB in Hex umwandeln
const rgbToHex = (r, g, b) => {
  return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1).toUpperCase()}`;
};

const hexToRgbString = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${r}, ${g}, ${b})`;
};

const confirmColor = () => {
  showFinalDialog.value = true;
  selectedColor.value = null;
  rgbColor.value = null;
};

function resetColor() {
  selectedColor.value = null;
  rgbColor.value = null;
}
const closeFinalDialog = () => showFinalDialog.value = false;

// Tutorial popup control
const showTutorial = () => {
  showTutorialPopup.value = true;
};

const closeTutorialPopup = () => {
  showTutorialPopup.value = false;
};
</script>

<style scoped>
/* Header Section Styling */
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

.info-icon {
  border: none; /* Kein Rahmen */
  font-size: 1.4rem; /* Größe des Fragezeichens */
  padding: 10px; /* Padding für mehr Klickfläche */
  border-radius: 20%; /* Runde Ecken, damit es wie ein Kreis aussieht */
}

.btn-group {
  width: 100%;
  display: flex;
  flex-direction: row; /* Buttons nebeneinander */
  gap: 10px; /* Abstand zwischen den Buttons */
  justify-content: space-between; /* Buttons gleichmäßig verteilen */
}

/* Canvas zentrieren */
.mt-3 {
  display: flex;
  justify-content: center;
}

canvas {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
  cursor: crosshair;
}

.img-fluid {
  max-width: 100%;
  height: auto;
  margin-top: 10px;
}

.tutorial-popup {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  max-width: 300px;
  margin: 20px auto;
  text-align: left; /* Text linksbündig */
}

.tutorial-popup h2 {
  font-weight: bold;
  margin-bottom: 15px;
  font-size: 1.5rem; /* größere Schrift für Titel */
}

.tutorial-popup ol {
  padding-left: 20px;
  margin-bottom: 15px;
}

.tutorial-popup li {
  margin-bottom: 10px; /* Abstand zwischen den Listenelementen */
  font-size: 1.1rem; /* Schriftgröße anpassen */
}

.color-popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 20px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.4);
  border-radius: 15px;
  z-index: 101;
  width: 350px;
  text-align: center;
}

.color-info {
  display: flex;
  align-items: center;
  gap: 30px;
}

.color-swatch {
  width: 100px;
  height: 100px;
  border-radius: 5px;
  margin-bottom: 30px;

}

.color-code {
  text-align: left;
  display: flex;
  flex-direction: column;
  justify-content: center;
  line-height: 0.8; /* Zeilenhöhe verringern für den Text */
  margin-bottom: 20px;
}

.button-group {
  display: flex;
  justify-content: space-between;
  gap: 15px;
}

.color-popup .btn {
  width: 45%;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 100;
}

.final-dialog {
  background: white;
  padding: 20px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  z-index: 101;
  margin-top: 10px;
}

.btn {
  font-size: 0.8rem;
}
</style>
