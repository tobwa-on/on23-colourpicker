<template>
  <div class="container mt-4">
    <div class="header-section">
      <h1 class="title m-0">Collections</h1>
      <button class="btn add-btn mdi mdi-plus btn-lg" @click="openModal"></button>
    </div>

    <!-- Paletten-Anzeige -->
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
          <div
              v-for="(color, idx) in palette.colors"
              :key="idx"
              class="color-box"
              :style="{ backgroundColor: color }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Modal zum Erstellen einer neuen Palette (nur Name wird eingegeben) -->
    <div v-if="isModalOpen" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <h2>Neue Palette erstellen</h2>
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="paletteName">Palettenname</label>
            <input
                v-model="newPaletteName"
                type="text"
                id="paletteName"
                required
            />
          </div>
          <div class="modal-buttons">
            <button type="submit" class="btn btn-primary">Speichern</button>
            <button type="button" class="btn btn-secondary" @click="closeModal">
              Abbrechen
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { fetchPalettes, createPalette } from '../services/Palettes.js';

const palettes = ref([]);
const router = useRouter();
const isModalOpen = ref(false);
const newPaletteName = ref('');

const loadPalettes = async () => {
  try {
    palettes.value = await fetchPalettes();
  } catch (error) {
    console.error('Error loading palettes:', error);
  }
};

const openModal = () => {
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  newPaletteName.value = '';
};

const handleSubmit = async () => {
  if (newPaletteName.value) {
    // Erstelle eine neue Palette nur mit dem Namen. Die Palette startet mit einer leeren Farbenliste.
    await createPalette(newPaletteName.value, []);
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
/* Header mit Titel und Plus-Button */
.header-section {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-top: 10px;
  margin-bottom: 20px;
}
.header-section .title {
  margin: 0;
  padding: 0;
}
.add-btn {
  position: absolute;
  right: 0;
  background-color: transparent;
  border: none;
  font-size: 5rem;
  cursor: pointer;
}

.palettes-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.palette-card {
  border-radius: 8px;
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
}
.color-box {
  flex: 1;
  height: 80px;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
}
.modal-content {
  background: #1e1e1e;
  padding: 20px;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
  color: #ffffff;
}
.modal-content h2 {
  margin-bottom: 20px;
}
.form-group {
  margin-bottom: 15px;
}
.form-group label {
  display: block;
  margin-bottom: 5px;
}
.form-group input {
  background-color: #2a2a2a;
  border: none;
  padding: 8px;
  width: 100%;
  color: #ffffff;
  border-radius: 4px;
}
.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
.btn {
  padding: 10px 15px;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  border: none;
}
.btn-primary {
  background-color: #007aff;
  color: #ffffff;
}
.btn-secondary {
  background-color: #3a3a3a;
  color: #ffffff;
}
</style>
