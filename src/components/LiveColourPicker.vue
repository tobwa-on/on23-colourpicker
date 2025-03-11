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
          <div class="color-text ">
            <span>{{hexColor}}</span><br/>
            <span>{{color}}</span>
          </div></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, inject } from 'vue';

const video = ref(null);
const canvas = ref(null);

const color = ref('rgb(0,0,0)');
const hexColor = ref('#000000');
const theme = inject('theme');

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
});

// Bei Verlassen der Seite Stream stoppen
onBeforeUnmount(() => {
  const stream = video.value.srcObject;
  const tracks = stream?.getTracks();
  tracks?.forEach(track => track.stop());
});
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
</style>
