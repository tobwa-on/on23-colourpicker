<template>
  <div class="container mt-4">
    <div class="header-section">
      <!-- Zurück-Button links -->
      <router-link to="/palettes">
        <button class="btn btn-lg mdi mdi-arrow-left m-0 p-0"></button>
      </router-link>

      <!-- Titel in der Mitte -->
      <h1 v-if="palette" class="title m-0">{{ palette.name }}</h1>

      <div class="button-container">
        <!-- Plus-Button with Dropdown -->
        <div class="dropdown">
          <button
              class="btn btn-lg mdi mdi-plus"
              type="button"
              id="dropdownAddButton"
              data-bs-toggle="dropdown"
              aria-expanded="false"
          ></button>
          <ul class="dropdown-menu" aria-labelledby="dropdownAddButton">
            <li>
              <a class="mdi mdi-plus dropdown-item" @click="openModal"> Add Colour</a>
            </li>
            <li>
              <a class="mdi mdi-dice-multiple dropdown-item" @click="handleAddRandomColor"> Random Colour</a>
            </li>
            <li>
              <a class="mdi mdi-star dropdown-item" @click="addIntelligentColorHandler"> Intelligent Colour</a>
            </li>
          </ul>
        </div>

        <!-- Editieren-Button als Dropdown rechts -->
        <div v-if="palette" class="dropdown">
          <button
              class="btn btn-lg"
              type="button"
              id="dropdownMenuButton"
              data-bs-toggle="dropdown"
              aria-expanded="false"
          >
            <i class="mdi mdi-dots-vertical"></i>
          </button>
          <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton">
            <li>
              <a class="mdi mdi-pencil dropdown-item" @click="handleEditName"> Rename</a>
            </li>
            <li>
              <a class="mdi mdi-download dropdown-item" @click="handleDownloadPalette"> Download</a>
            </li>
            <li>
              <a class="mdi mdi-trash-can dropdown-item text-danger" @click="handleDeletePalette"> Delete</a>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Anzeige der Palette (Farben) -->
    <div v-if="palette">
      <div class="d-block">
        <div
            v-for="(color, idx) in palette.colors"
            :key="idx"
            class="color-box mb-3"
        >
          <!-- Farbfeld als Container mit Overlay -->
          <div :style="{ backgroundColor: color, height: '100px', width: '100%' }">
            <div class="overlay">
              <div class="text-container">
                <div class="color-hex">{{ color }}</div>
              </div>
              <div class="btn-container">
                <!-- Öffnet das Edit-Color-Popup -->
                <button @click="openEditColorModal(idx)" class="btn mdi mdi-pencil"></button>
                <button @click="handleDeleteColor(idx)" class="btn mdi mdi-trash-can"></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Overlay für den Color Picker zum Hinzufügen einer Farbe -->
    <div v-if="isModalOpen" :class="['modal-overlay', theme]">
      <div :class="['modal-content color-picker-modal', theme]">
        <!-- Farb-Vorschau -->
        <div class="color-info">
          <div class="color-hex-code">{{ newColor }}</div>
        </div>
        <!-- Color Picker Input -->
        <div class="color-input  mt-3">
          <input type="color" v-model="newColor" class="form-control" />
        </div>
        <div class="modal-buttons mt-3">
          <button class="btn btn-secondary mdi mdi-close" @click="closeModal"> Cancel</button>
          <button class="btn btn-primary mdi mdi-plus" @click="handleAddColorAndClose"> Add</button>
        </div>
      </div>
    </div>

    <!-- Overlay für das Bearbeiten einer Farbe -->
    <div v-if="isEditColorModalOpen" :class="['modal-overlay', theme]">
      <div :class="['modal-content color-picker-modal', theme]">
        <div class="color-info">
          <div class="color-hex-code">{{ editColorValue }}</div>
        </div>
        <div class="color-input mt-3">
          <input type="color" v-model="editColorValue" class="form-control" />
        </div>
        <div class="modal-buttons mt-3">
          <button class="btn btn-secondary mdi mdi-close" @click="closeEditColorModal"> Cancel</button>
          <button class="btn btn-primary mdi mdi-check" @click="handleSaveEditedColor"> Save</button>
        </div>
      </div>
    </div>

    <!-- Umbenennungs‑Popup -->
    <div v-if="isRenameModalOpen" :class="['modal-overlay', theme]">
      <div :class="['modal-content', theme]">
        <div class="modal-header">
          <h5 class="modal-title">Rename Collection</h5>
          <button type="button" class="btn-close" @click="closeRenameModal"></button>
        </div>
        <div class="modal-body">
          <input
              type="text"
              class="form-control"
              v-model="paletteName"
              placeholder="Neuen Namen eingeben"
          />
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary mdi mdi-close" @click="closeRenameModal"> Cancel</button>
          <button type="button" class="btn btn-primary mdi mdi-check" @click="handleSaveName"> Save</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, inject } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  addColor,
  deleteColor,
  deletePalette,
  fetchPaletteById,
  updateColor,
  updatePaletteName,
  getIntelligentColor,
  generateRandomColor,
  downloadPaletteAsImage
} from '../services/Palettes.js';

const theme = inject('theme');
const palette = ref(null);
const newColor = ref('#000000'); // Standardwert für neuen Farbwert
const paletteName = ref('');
const router = useRouter();
const route = useRoute();
const isModalOpen = ref(false);
const isRenameModalOpen = ref(false);
const isEditColorModalOpen = ref(false);
const editColorValue = ref('');
const editColorIndex = ref(null);
const activeModel = ref('RGB'); // Wird aktuell nicht weiter verwendet

const loadPalette = async () => {
  try {
    palette.value = await fetchPaletteById(route.params.id);
    paletteName.value = palette.value.name;
  } catch (error) {
    console.error('Error loading palette details:', error);
  }
};


const openModal = () => {
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

const closeRenameModal = () => {
  isRenameModalOpen.value = false;
};

const handleEditName = () => {
  isRenameModalOpen.value = true;
};

const handleSaveName = async () => {
  if (paletteName.value && paletteName.value !== palette.value.name) {
    try {
      await updatePaletteName(palette.value.id, paletteName.value);
      palette.value.name = paletteName.value;
    } catch (error) {
      console.error('Error updating palette name:', error);
    }
  }
  isRenameModalOpen.value = false;
};

const handleDeletePalette = async () => {
  try {
    await deletePalette(palette.value.id);
    await router.push({ name: 'Palette' });
  } catch (error) {
    console.error('Error deleting palette:', error);
  }
};

const handleDeleteColor = async (idx) => {
  try {
    const colorToDelete = palette.value.colors[idx];
    await deleteColor(palette.value.id, colorToDelete);
    palette.value.colors.splice(idx, 1);
  } catch (error) {
    console.error('Error deleting color:', error);
  }
};

// Öffnet das Edit-Color-Popup statt eines Prompts
const openEditColorModal = (idx) => {
  editColorIndex.value = idx;
  editColorValue.value = palette.value.colors[idx];
  isEditColorModalOpen.value = true;
};

const closeEditColorModal = () => {
  isEditColorModalOpen.value = false;
  editColorIndex.value = null;
  editColorValue.value = '';
};

const handleSaveEditedColor = async () => {
  if (editColorIndex.value !== null) {
    const oldColor = palette.value.colors[editColorIndex.value];
    try {
      await updateColor(palette.value.id, oldColor, editColorValue.value);
      palette.value.colors[editColorIndex.value] = editColorValue.value;
    } catch (error) {
      console.error('Error updating color:', error);
    }
    closeEditColorModal();
  }
};

const handleAddColor = async () => {
  try {
    await addColor(palette.value.id, newColor.value);
    palette.value.colors.push(newColor.value);
  } catch (error) {
    console.error('Error adding color:', error);
  }
};

const handleAddColorAndClose = async () => {
  await handleAddColor();
  closeModal();
};

// Funktion zum Hinzufügen einer zufälligen Farbe
const handleAddRandomColor = async () => {
  try {
    const randomColor = generateRandomColor();
    palette.value.colors.push(randomColor);
    await addColor(palette.value.id, randomColor);
   
  } catch (error) {
    console.error('Error adding random color:', error);
  }
};

const addIntelligentColorHandler = async () => {
  try {
    const intelligentColor = await getIntelligentColor(palette.value.colors);
    await addColor(palette.value.id, intelligentColor);
    palette.value.colors.push(intelligentColor);
  } catch (error) {
    console.error('Error adding intelligent color:', error);
  }
};

const handleDownloadPalette = async () => {
  if (palette.value) {
    await downloadPaletteAsImage(palette.value);
  }
};

onMounted(() => {
  loadPalette();
});
</script>

<style scoped>
/* HEADER */
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
.button-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* PALETTE ANZEIGE */
.color-box {
  position: relative;
  border-radius: 10px;
  overflow: hidden;
}
.overlay {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  transform: translateY(-50%);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 20px;
  color: #fff;
}
.text-container {
  text-align: center;
}
.color-hex {
  font-size: 0.9rem;
}
.btn-container button {
  margin-left: 5px;
  color: #fff;
}

/* MODAL OVERLAY & COLOR PICKER MODAL */
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
.modal-content.color-picker-modal {
  padding: 20px;
  border-radius: 10px;
  width: 90%;
  max-width: 400px;
  text-align: center;
}
.modal-content.color-picker-modal.light {
  background: #ffffff;
  color: #000000;
}
.modal-content.color-picker-modal.dark {
  background: #1e1e1e;
  color: #ffffff;
}
/* Höherer Farbauswahl-Picker */
.modal-content.color-picker-modal .color-input input[type="color"] {
  width: 100%;
  height: 80px;
  border: none;
  cursor: pointer;
  padding: 0;
}

/* Die Buttons im Modal sollen die ganze Breite einnehmen, mit Abstand */
.modal-content.color-picker-modal .modal-buttons {
  display: flex;
  gap: 10px;
}
.modal-content.color-picker-modal .modal-buttons button {
  flex: 1;
}

/* UMBENENNUNGS-POPUP */
.modal-content {
  padding: 20px;
  border-radius: 10px;
  width: 400px;
}
.modal-content.light {
  background: #ffffff;
  color: #000000;
}
.modal-content.dark {
  background: #1e1e1e;
  color: #ffffff;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.modal-body {
  margin-bottom: 20px;
}
.modal-footer {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}
.modal-footer .btn {
  padding: 10px 20px;
}
</style>