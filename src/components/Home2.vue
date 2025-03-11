<template>
  <div class="container mt-4">
    <div class="header-section">
      <h1 class="title">Colour Picker</h1>
    </div>

    <!-- Video Livestream in einer Box -->
    <div class="video-container">
      <video ref="video" autoplay playsinline></video>
      <canvas ref="canvas"></canvas>
    </div>

    <!-- Farbcode anzeigen -->
    <div class="color-info">
      <p>Aktuelle Farbe: 
        <span :style="{ backgroundColor: color, color: textColor }">{{ color }}</span>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

const video = ref(null);
const canvas = ref(null);

const color = ref('rgb(0,0,0)');
const textColor = ref('white');  // Dynamische Textfarbe für den Farbcode

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
  text-align: center;
}

.video-container {
  position: relative;
  display: flex;
  justify-content: center;
  margin-top: 20px;
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
  text-align: center;
  font-size: 1.2rem;
  margin-top: 20px;
}

.color-info span {
  padding: 10px;
  border-radius: 5px;
  font-weight: bold;
}
</style>
