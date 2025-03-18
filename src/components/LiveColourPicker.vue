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

    <div v-if="isCollectionModalOpen" class="modal-overlay">
      <div :class="['modal-content', theme]">
        <h3>Add selected colour to a collection</h3>
        <!-- Color preview and current hex code -->
        <div class="color-preview">
          <span >Selected colour:</span>
          <div class="color-box" :style="{ backgroundColor: savedColor }"></div>
          <div class="color-text">{{ savedHexColor }}</div>
        </div>

        <div class="collection-list">
          <div
              v-for="(collection, index) in collections"
              :key="collection.id || index"
              class="collection-card"
              @click="addColour(collection.id)"
          >
            <div class="collection-header mt-2">
              <h5>{{ collection.name }}</h5>
            </div>
            <div class="collection-body">
              <template v-if="collection.colors && collection.colors.length > 0">
                <div
                    v-for="(color, idx) in collection.colors"
                    :key="idx"
                    class="color-box"
                    :style="{ backgroundColor: color }"
                ></div>
              </template>
              <template v-else>
                <div class="color-box empty-box"></div>
              </template>
            </div>
          </div>

        </div>
        <div class="modal-footer modal-buttons">
          <button class="btn btn-secondary mdi mdi-close" @click="closeCollectionModal">Cancel</button>
          <button class="btn btn-primary mdi mdi-plus" @click="openModal">New Collection</button>
        </div>
      </div>
    </div>

    <CreateCollectionModal
        :isOpen="isModalOpen"
        :theme="theme"
        @close="closeModal"
        @submit="createNewCollection"
    />
  </div>
</template>

<script setup>
import {inject, onBeforeUnmount, onMounted, ref, getCurrentInstance} from 'vue';
import {addColor, createCollection, fetchCollections} from '../services/CollectionService.js';
import CreateCollectionModal from "./CreateCollectionModal.vue";
import CollectionDetail from "./CollectionDetail.vue";

const video = ref(null);
const canvas = ref(null);
const isModalOpen = ref(false);

const color = ref('rgb(0,0,0)');
const hexColor = ref('#000000');
const savedColor = ref('rgb(0,0,0)');
const savedHexColor = ref('#000000');
const theme = inject('theme');
const isCollectionModalOpen = ref(false);
const collections = ref([]);
const textColor = ref()

const { proxy } = getCurrentInstance(); // Get the proxy instance

const startCamera = async () => {
  try {
    const constraints = {video: {facingMode: "environment"}};
    video.value.srcObject = await navigator.mediaDevices.getUserMedia(constraints);
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
  loadCollections();
});

// Bei Verlassen der Seite Stream stoppen
onBeforeUnmount(() => {
  const stream = video.value.srcObject;
  const tracks = stream?.getTracks();
  tracks?.forEach(track => track.stop());
});

const loadCollections = async () => {
  try {
    const fetchedCollections = await fetchCollections();
    collections.value = fetchedCollections.sort((a, b) =>
        a.name.localeCompare(b.name)
    );
  } catch (error) {
    console.error('Error loading collections:', error);
  }
};

const saveCurrentColor = () => {
  savedColor.value = color.value;
  savedHexColor.value = hexColor.value;
  openCollectionModal();
};

const openCollectionModal = () => {
  isCollectionModalOpen.value = true;
};

const closeCollectionModal = () => {
  isCollectionModalOpen.value = false;
};


const openModal = () => {
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

const createNewCollection = async (collectionName) => {
  await createCollection(collectionName, [], proxy.$showToastMessage);
  await loadCollections();
  closeModal();
}

const addColour = async (collectionId) => {
  try {
    await addColor(collectionId, savedHexColor.value, proxy.$showToastMessage);

    const targetCollection = collections.value.find(
        (collection) => collection.id === collectionId
    );
    if (targetCollection) {

      targetCollection.colors = targetCollection.colors || [];
      targetCollection.colors.push(savedHexColor.value);
    }
    closeCollectionModal();
  } catch (error) {
    console.error('Error adding color to collection:', error);
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
  border-radius: 8px;
  overflow: hidden;
  max-width: 800px;
  margin: auto;
  height: calc(100vh - 180px);
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
  width: 50px;
  height: 50px;

}

.collection-body {
  border-radius: 8px;
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
  width: calc(100% - 15px);
}

.add-colour-button {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  height:72px
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
  margin-bottom: 20px;
}

.color-preview .color-box {
  width: 40px;
  height: 40px;
  border-radius: 8px;
}

.collection-list {
  max-height: 300px; /* Set a max height for the list */
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

.collection-body {
  display: flex;
  overflow: hidden;
}

.collection-body .color-box {
  flex: 1;
  height: 40px;
}


.collection-list::-webkit-scrollbar {
  display: none; /* Safari and Chrome */
}

.empty-box {
  border: 1px solid grey;
  border-radius: 8px;
  background-color: transparent;
}

</style>