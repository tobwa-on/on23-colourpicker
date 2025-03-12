<template>
  <div class="container mt-4">
    <div class="header-section">
      <router-link :to="`/palette-details/${route.params.id}`">
        <button class="btn btn-lg mdi mdi-arrow-left m-0 p-0"></button>
      </router-link>
      <h1 class="title">Paint Canvas</h1>
      <button @click="saveCanvas" class="btn btn-lg mdi mdi-download m-0 p-0"></button>
    </div>
    <div class="canvas-container">
      <canvas ref="canvas" @touchstart="startPainting" @touchend="stopPainting" @touchmove="paint"></canvas>
    </div>
    <div class="palette-container">
      <div v-for="(color, index) in palette.colors" :key="index" class="color-box" :class="{ selected: color === selectedColor && !isEraserSelected }" :style="{ backgroundColor: color }" @click="selectColor(color)"></div>
      <div class="color-box eraser" :class="{ selected: isEraserSelected }" @click="selectEraser">
        <span class="mdi mdi-eraser"></span> <!-- Replace with an icon -->
      </div>
    </div>
    <div class="width-container">
      <input type="range" min="1" max="20" v-model="selectedWidth" />
      <span>{{ selectedWidth }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { fetchPaletteById } from '../services/Palettes.js';

const route = useRoute();
const canvas = ref(null);
const ctx = ref(null);
const painting = ref(false);
const selectedColor = ref('#000000');
const selectedWidth = ref(5);
const palette = ref({ colors: [] });
const isEraserSelected = ref(false);

const startPainting = (event) => {
  painting.value = true;
  paint(event);
};

const stopPainting = () => {
  painting.value = false;
  ctx.value.beginPath();
};

const paint = (event) => {
  if (!painting.value) return;

  const touch = event.touches[0];
  ctx.value.lineWidth = selectedWidth.value;
  ctx.value.lineCap = 'round';
  ctx.value.strokeStyle = selectedColor.value;

  ctx.value.lineTo(touch.clientX - canvas.value.offsetLeft, touch.clientY - canvas.value.offsetTop);
  ctx.value.stroke();
  ctx.value.beginPath();
  ctx.value.moveTo(touch.clientX - canvas.value.offsetLeft, touch.clientY - canvas.value.offsetTop);
};

const selectColor = (color) => {
  selectedColor.value = color;
  ctx.value.globalCompositeOperation = 'source-over'; // Reset to default
  isEraserSelected.value = false;
};

const selectEraser = () => {
  ctx.value.globalCompositeOperation = 'destination-out'; // Set to erase mode
  isEraserSelected.value = true;
};

const loadPalette = async () => {
  try {
    const paletteId = route.params.id;
    palette.value = await fetchPaletteById(paletteId);
    if (palette.value.colors.length > 0) {
      selectedColor.value = palette.value.colors[0]; // Set initial color
    }
  } catch (error) {
    console.error('Error loading palette:', error);
  }
};

const saveCanvas = async () => {
  const paletteId = route.params.id;
  const paletteData = await fetchPaletteById(paletteId);
  const paletteName = paletteData.name || 'palette';
  const imageName = `${paletteName} canvas.jpeg`;

  const handle = await window.showSaveFilePicker({
    suggestedName: imageName,
    types: [
      {
        description: 'JPEG Image',
        accept: { 'image/jpeg': ['.jpeg'] },
      },
    ],
  });

  const writable = await handle.createWritable();
  const blob = await new Promise((resolve) => canvas.value.toBlob(resolve, 'image/jpeg'));
  await writable.write(blob);
  await writable.close();
};

onMounted(() => {
  const containerWidth = document.querySelector('.container').clientWidth;
  canvas.value.width = containerWidth;
  canvas.value.height = window.innerHeight * 0.6;
  ctx.value = canvas.value.getContext('2d');
  loadPalette();
});
</script>

<style scoped>
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-section .title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  margin: 0;
  padding: 0;
}

.canvas-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

canvas {
  border: 1px solid #000;
  border-radius: 10px;
  max-width: 100%;
}

.palette-container {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 10px;
}

.color-box {
  width: 40px;
  height: 40px;
  border-radius: 5px;
  cursor: pointer;
}

.color-box.selected {
  border: 4px solid #000;
}

.color-box.eraser {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f0f0;
  border: 1px solid #000;
}

.color-box.eraser.selected {
  border: 4px solid #000;
}

.width-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
}

.width-container input[type="range"] {
  width: 150px;
}

.width-container span {
  font-size: 1rem;
}
</style>
