<template>
  <div class="container mt-4">
    <div class="header-section">
      <h1 class="title m-0">My Collections</h1>
      <button class="btn add-btn mdi mdi-plus btn-lg" @click="openModal"></button>
    </div>

    <div class="palettes-container">
      <div
          v-for="(palette, index) in palettes"
          :key="palette.id || index"
          class="palette-card"
          @click="goToPaletteDetail(palette.id || index)"
      >
        <div class="palette-header">
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
    </div>

    <!-- Integration der ausgelagerten NewPaletteModal-Komponente -->
    <CreatePaletteModal
        :isOpen="isModalOpen"
        :theme="theme"
        @close="closeModal"
        @submit="handleSubmitNewPalette"
    />
  </div>
</template>
<script setup>
import { ref, inject, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { fetchPalettes, createPalette } from '../services/Palettes.js';
import CreatePaletteModal from './CreatePaletteModal.vue';

const theme = inject('theme');
const palettes = ref([]);
const router = useRouter();
const isModalOpen = ref(false);

const loadPalettes = async () => {
  try {
    const fetchedPalettes = await fetchPalettes();
    // Alphabetisch sortieren nach dem Palettennamen
    palettes.value = fetchedPalettes.sort((a, b) =>
        a.name.localeCompare(b.name)
    );
  } catch (error) {
    console.error('Error loading palettes:', error);
  }
};

const openModal = () => {
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

const handleSubmitNewPalette = async (paletteName) => {
  if (paletteName) {
    await createPalette(paletteName, []); // Neue Palette ohne Farben erstellen
    await loadPalettes();
    closeModal();
  }
};

const goToPaletteDetail = (paletteId) => {
  router.push({ name: 'Palette Details', params: { id: paletteId } });
};

onMounted(() => {
  loadPalettes();
});

</script>


<style scoped>
.header-section {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-top: 10px;
  margin-bottom: 20px;
}

.add-btn {
  position: absolute;
  right: 0;
  background-color: transparent;
  border: none;
  font-size: 1.7rem;
  cursor: pointer;
}

.palettes-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.palette-card {
  overflow: hidden;
  cursor: pointer;
}

.palette-header {
  padding: 10px;
}

.palette-header h5 {
  margin: 0;
  font-size: 1.1rem;
}

.palette-body {
  display: flex;
  border-radius: 8px;
}

.color-box {
  flex: 1;
  height: 60px;
}

.empty-box {
  border: 1px solid grey;
  border-radius: 8px;
  background-color: transparent;
}
</style>
