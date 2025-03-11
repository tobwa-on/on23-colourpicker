<template>
  <div class="container mt-4">
    <div class="header-section">
      <router-link to="/home">
        <button class="btn btn-lg mdi mdi-arrow-left m-0 p-0"></button>
      </router-link>

      <h1 class="title">Colour Picker</h1>
    </div>

    <!-- Video Livestream in einer Box -->
    <div class="video-container">
      <video ref="video" autoplay playsinline></video>
      <div class="target-dot"></div>
      <canvas ref="canvas"></canvas>
      <!-- Farbcode anzeigen -->
      <div class="color-info" :class="theme">
        <div :class="['color-display-box', theme]">
          <div class="mx-auto d-flex align-items-center gap-2">
            <div class="color-box" :style="{ backgroundColor: color }"></div>
            <div class="color-text">
              <span>{{hexColor}}</span><br/>
              <span>{{color}}</span>
            </div>
          </div>
        </div>
      </div>
      <!-- Add Colour Button -->
      <div class="add-colour-button-container">
        <button class="btn btn-primary add-colour-button" @click="saveCurrentColor">Add Colour</button>
      </div>
    </div>

    <!-- Modal for displaying palette names -->
    <div v-if="isPaletteModalOpen" class="modal-overlay">
      <div :class="['modal-content', theme]">
        <h2>Select a Palette</h2>
        <!-- Color preview and hex code -->
        <div class="color-preview">
          <div class="color-box" :style="{ backgroundColor: savedColor }"></div>
          <div class="color-text">{{ savedHexColor }}</div>
        </div>
        <div class="palette-list">
          <button v-for="palette in palettes" :key="palette.id" class="btn btn-palette btn-secondary my-1" @click="addColour(palette.id)">
            {{ palette.name }}
          </button>
        </div>
        <button class="btn btn-primary" @click="closePaletteModal">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, inject } from 'vue';
import { fetchPalettes, addColor } from '../services/Palettes.js';

const video = ref(null);
const canvas = ref(null);

const color = ref('rgb(0,0,0)');
const hexColor = ref('#000000');
const savedColor = ref('rgb(0,0,0)');
const savedHexColor = ref('#000000');
const theme = inject('theme');
const isPaletteModalOpen = ref(false);
const palettes = ref([]);

// Kamera starten und Live-Stream abspielen
const startCamera = async () => {
  try {
    const constraints = { video: { facingMode: "environment" } };
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    video.value.srcObject = stream;
  } catch (error) {
    console.error("Fehler beim Starten der Kamera:", error);
  }
};

// Konvertiere RGB in Hex
const rgbToHex = (r, g, b) => {
  return (
    "#" +
    [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')
  ).toUpperCase();
};

// Live-Farbe extrahieren
const extractColor = () => {
  const ctx = canvas.value.getContext('2d');
  canvas.value.width = video.value.videoWidth;
  canvas.value.height = video.value.videoHeight;
  
  // Zeichnen des aktuellen Frames vom Video auf das Canvas
  ctx.drawImage(video.value, 0, 0, canvas.value.width, canvas.value.height);

  // Farbe der Mitte extrahieren
  const pixel = ctx.getImageData(canvas.value.width / 2, canvas.value.height / 2, 1, 1);
  const data = pixel.data;

  // Farbcode in RGB und als Hex
  const rgbColor = `rgb(${data[0]}, ${data[1]}, ${data[2]})`;
  color.value = rgbColor;
  hexColor.value = rgbToHex(data[0], data[1], data[2]);

  // Dynamische Textfarbe anpassen (Hell oder Dunkel)
  const brightness = 0.2126 * data[0] + 0.7152 * data[1] + 0.0722 * data[2];
  textColor.value = brightness < 128 ? 'white' : 'black';
};

// Live-Update alle 100ms
onMounted(() => {
  startCamera();
  setInterval(extractColor, 100);
  loadPalettes();
});

// Bei Verlassen der Seite Stream stoppen
onBeforeUnmount(() => {
  const stream = video.value.srcObject;
  const tracks = stream?.getTracks();
  tracks?.forEach(track => track.stop());
});

// Load palettes
const loadPalettes = async () => {
  try {
    palettes.value = await fetchPalettes();
  } catch (error) {
    console.error('Error loading palettes:', error);
  }
};

const saveCurrentColor = () => {
  savedColor.value = color.value;
  savedHexColor.value = hexColor.value;
  openPaletteModal();
};

const openPaletteModal = () => {
  isPaletteModalOpen.value = true;
};

const closePaletteModal = () => {
  isPaletteModalOpen.value = false;
};

const addColour = async (paletteId) => {
  try {
    await addColor(paletteId, savedHexColor.value);
    closePaletteModal();
  } catch (error) {
    console.error('Error adding color to palette:', error);
  }
};
</script>

<style scoped>
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  margin-top: 10px;
  margin-bottom: 20px;
}

.header-section .title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  margin: 0;
  padding: 0;
}

.video-container {
  position: relative;
  display: flex;
  justify-content: center;
  border: 2px solid #007aff;
  border-radius: 10px;
  overflow: hidden;
  max-width: 800px;
  margin: auto;
}

video {
  width: 100%;
  height: auto;
  border-radius: 10px;
}

canvas {
  display: none;
}

.color-info {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  text-align: left;
  width: calc(100% - 20px); 
}

.color-display-box {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: 12px;
  border: 1px solid #ddd;
  width: 100%;
}
.color-display-box.light {
  background-color: #f8f9fa;
  border: 1px solid #ced4da;
}
.color-display-box.dark {
  background-color: #343a40;
  border: 1px solid #495057;
}

.color-box {
  width: 40px;
  height: 40px;
  border-radius: 5px;
  border: 1px solid #000;
}

.color-text {
  font-size: 1rem;
  line-height: 1.5;
}

.target-dot {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 15px;
  height: 15px;
  background-color: white;
  border-radius: 50%;
  opacity: 0.6;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.add-colour-button-container {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 20px); 
}

.add-colour-button {
  width: 100%;
  padding: 10px;
  border-radius: 12px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: #ffffff;
  padding: 20px;
  border-radius: 10px;
  width: 90%;
  max-width: 400px;
  text-align: center;
}

.modal-content.light {
  background-color: #ffffff;
  color: #000000;
}

.modal-content.dark {
  background-color: #1e1e1e;
  color: #ffffff;
}

.modal-content h2 {
  margin-bottom: 20px;
}

.color-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
}

.color-preview .color-box {
  width: 40px;
  height: 40px;
  border-radius: 5px;
  border: 1px solid #000;
}

.palette-list {
  max-height: 200px; /* Set a max height for the list */
  overflow-y: auto; /* Enable vertical scrolling */
  margin-bottom: 20px;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none;  /* Internet Explorer 10+ */
}

.palette-list::-webkit-scrollbar {
  display: none; /* Safari and Chrome */
}

.btn-palette {
  border-radius: 5px;
  width: 100%;	
  cursor: pointer;
  transition: background-color 0.3s ease;
  background-color: #f0f0f0; /* Grey background */
  border: 1px solid #ccc;
  color: #333;
}

.btn-palette:hover {
  background-color: #e0e0e0;
}

.modal-content .btn {
  padding: 10px 20px;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  border: none;
  background-color: #007aff;
  color: #ffffff;
}

.modal-content .btn-secondary {
  background-color: #6c757d;
  color: #ffffff;
}
</style>