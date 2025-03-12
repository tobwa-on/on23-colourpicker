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
              <span>{{ hexColor }}</span><br/>
              <span>{{ color }}</span>
            </div>
          </div>
        </div>
      </div>
      <!-- Add Colour Button -->
      <div class="add-colour-button-container">
        <button class="btn btn-primary add-colour-button mdi mdi-plus" @click="saveCurrentColor"></button>
      </div>
    </div>

    <div v-if="isPaletteModalOpen" class="modal-overlay">
      <div :class="['modal-content', theme]">
        <h3>Add selected colour to a palette</h3>
        <!-- Color preview and current hex code -->
        <div class="color-preview">
          Selected colour:
          <div class="color-box" :style="{ backgroundColor: savedColor }"></div>
          <div class="color-text">{{ savedHexColor }}</div>
        </div>

        <div
            v-for="(palette, index) in palettes"
            :key="palette.id || index"
            class="palette-card"
            @click="addColour(palette.id)"
        >
          <div class="palette-header mt-2">
            <h5>{{ palette.name }}</h5>
          </div>
          <div class="palette-body">
            <!-- Wenn die Palette Farben enthält -->
            <template v-if="palette.colors && palette.colors.length > 0">
              <div
                  v-for="(color, idx) in palette.colors"
                  :key="idx"
                  class="color-box"
                  :style="{ backgroundColor: color }"
              ></div>
            </template>
            <!-- Wenn die Palette leer ist -->
            <template v-else>
              <div class="color-box empty-box"></div>
            </template>
          </div>
        </div>

        <div class="modal-buttons">
          <button class="btn btn-secondary mdi mdi-close" @click="closePaletteModal">Cancel</button>
          <!-- TODO -->
          <button class="btn btn-primary mdi mdi-plus" @click="closePaletteModal">New Palette</button>
        </div>
      </div>
    </div>


  </div>
</template>

<script setup>
import {ref, onMounted, onBeforeUnmount, inject} from 'vue';
import {fetchPalettes, addColor} from '../services/Palettes.js';

const video = ref(null);
const canvas = ref(null);

const color = ref('rgb(0,0,0)');
const hexColor = ref('#000000');
const savedColor = ref('rgb(0,0,0)');
const savedHexColor = ref('#000000');
const theme = inject('theme');
const isPaletteModalOpen = ref(false);
const palettes = ref([]);
const textColor = ref()

// Kamera starten und Live-Stream abspielen
const startCamera = async () => {
  try {
    const constraints = {video: {facingMode: "environment"}};
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
  if (!canvas.value || !video.value) return; // Sicherheitscheck, wenn canvas noch nicht geladen ist

  const ctx = canvas.value.getContext('2d');
  if (!ctx) return;

  // Setzen der Canvas-Größe basierend auf dem Video
  canvas.value.width = video.value.videoWidth;
  canvas.value.height = video.value.videoHeight;

  // Zeichnen des aktuellen Frames vom Video auf das Canvas
  ctx.drawImage(video.value, 0, 0, canvas.value.width, canvas.value.height);

  // Farbe der Mitte extrahieren
  const pixel = ctx.getImageData(canvas.value.width / 2, canvas.value.height / 2, 1, 1);
  const data = pixel.data;

  // Farbcode in RGB und als Hex festlegen
  const rgbColor = `rgb(${data[0]}, ${data[1]}, ${data[2]})`;
  color.value = rgbColor;
  hexColor.value = rgbToHex(data[0], data[1], data[2]);

  // Dynamische Textfarbe anpassen (Hell oder Dunkel)
  const brightness = 0.2126 * data[0] + 0.7152 * data[1] + 0.0722 * data[2];
  textColor.value = brightness < 128 ? 'white' : 'black';
}


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

.modal-buttons {
  display: flex;
  width: 100%;
  gap: 10px; /* Optional: Abstand zwischen den Buttons */
  margin-top: 20px; /* Optional: Abstand nach oben */
}

.modal-buttons .btn {
  flex: 1;
  margin: 0;
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
}

.palette-list {
  max-height: 350px; /* Set a max height for the list */
  overflow-y: auto; /* Enable vertical scrolling */
  margin-bottom: 20px;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* Internet Explorer 10+ */
}

.modal-content .btn {
  padding: 10px 20px;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  border: none;
  color: #ffffff;
}

.modal-content {
  background-color: #6c757d;
  color: #ffffff;
}

.palette-body {
  display: flex;
  width: 100%;
  gap: 5px;
}

.palette-body .color-box {
  flex: 1;
  height: 40px;
}


.palette-body .color-box.empty-box {
  flex: 1;
  height: 40px;
  border: 1px solid grey;
  background-color: transparent;
}

</style>