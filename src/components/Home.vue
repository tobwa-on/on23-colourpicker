<template>
  <div class="container mt-4">
    <div class="row justify-content-center">
      <div class="col-md-8 col-lg-6">
        <!-- Header -->
        <div class="header text-center ">
          <h2> Home</h2>
        </div>

        <div class="content d-flex flex-column align-items-center">
          <div class="inhalt">
            <div v-if="collections.length > 0 && lastPalette" class="last-palette mb-4" @click="goToPaletteDetails(lastPalette.id)">
              <p class="mb-2">Last modified collection:</p>
              <h4 class="palette-title">{{ lastPalette.name }}</h4>
              <div class="palette-preview d-flex">
                <div
                    v-for="(color, index) in lastPalette.colors"
                    :key="index"
                    class="color-box"
                    :style="{ backgroundColor: color }"
                ></div>
              </div>
              <p class="palette-note mdi mdi-arrow-right">Click to view palette details</p>
            </div>

            <div class="text-center button-container flex-grow-1 d-flex align-items-center">
              <button class="btn btn-primary scalable-button flex-grow-1" @click="goToColourPicker">
                <span class="mdi mdi-image-filter-center-focus icon-large"></span>
                <span class="btn-text">Tap here to open the camera</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, computed, onMounted, inject} from 'vue';
import router from "../router/index.js";

import {fetchCollections} from "../services/CollectionService.js";

const theme = inject('theme');

const collections = ref([]);
const loadCollections = async () => {
  try {
    collections.value = await fetchCollections();
  } catch (error) {
    console.error("Error loading collections:", error);
  }
};

const lastPalette = computed(() => {
  if (collections.value.length > 0) {
    const sortedCollections = [...collections.value].sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
    return sortedCollections[0];
  }
  return null;
});

const goToColourPicker = () => {
  router.push('/colourpicker');
};

const goToPaletteDetails = async (id) => {
  await router.push(`/palette-details/${id}`);
};

onMounted(() => {
  loadCollections();
});
</script>
<style scoped>
.header h2 {
  font-size: 2rem;
}

.content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: calc(100vh - 180px);
}

.last-palette {
  cursor: pointer;
  padding: 20px;
  border: 1px solid lightgrey;
  border-radius: 10px;
  transition: transform 0.3s;
  height:30vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.inhalt {
  width:100%;
}

.palette-title {
  font-size: 1.5rem;
}

.palette-preview {
  margin-bottom: 10px;
  display: flex;
  border-radius: 8px;
}

.color-box {
   flex: 1;
   height: 40px;
}

.palette-note {
  font-size: 0.9rem;
  color: #888;
}

/* Button-Styling */
.scalable-button {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
  border-radius: 10px;
  height:35vh
}

.icon-large {
  font-size: 2.5rem;
}
</style>

