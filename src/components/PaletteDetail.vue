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
        <button v-if="!isModalOpen" class="btn btn-lg mdi mdi-plus" @click="openModal"></button>
        <button v-if="isModalOpen" class="btn mdi mdi-plus" @click="handleAddColor"></button>

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
              <a class="mdi mdi-pencil dropdown-item" @click="handleEditName"> Umbennenen</a>
            </li>
            <li>
              <a class="mdi mdi-trash-can dropdown-item text-danger" @click="handleDeletePalette"> Löschen</a>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div v-if="palette">
      <div class="d-block">
        <div
            v-for="(color, idx) in palette.colors"
            :key="idx"
            class="color-box mb-3"
        >
          <!-- Farbfeld als Container mit Overlay -->
          <div
              :style="{ backgroundColor: color, height: '100px', width: '100%' }"
          >
            <div class="overlay">
              <div class="text-container">
                <div class="color-hex">{{ color }}</div>
              </div>
              <div class="btn-container">
                <button
                    @click="handleEditColor(idx)"
                    class="btn mdi mdi-pencil"
                ></button>
                <button
                    @click="handleDeleteColor(idx)"
                    class="btn mdi mdi-trash-can"
                ></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="palette" class="row justify-content-center">
      <div class="card shadow">
        <div class="my-3">
          <div v-if="isModalOpen" class="modal-overlay" @click.self="closeModal">
            <div class="d-flex align-items-center">
              <!-- Color Picker mit Hinweistext -->
              <div class="me-2">
                <label for="colorPicker" class="form-label">Pick a color</label>
                <input
                    v-model="newColor"
                    type="color"
                    id="colorPicker"
                    class="form-control form-control-color color-input-field"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Umbenennungs-Popup -->
    <div v-if="isRenameModalOpen" class="modal-overlay" @click.self="closeRenameModal">
      <div class="modal-content">
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
          <button type="button" class="btn btn-secondary mdi mdi-close" @click="closeRenameModal"> Abbrechen</button>
          <button type="button" class="btn btn-primary mdi mdi-check" @click="handleSaveName"> Speichern</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  addColor,
  deleteColor,
  deletePalette,
  fetchPaletteById,
  generateRandomColor,
  updateColor,
  updatePaletteName,
} from '../services/Palettes.js';

const palette = ref(null);
const newColor = ref('');
const paletteName = ref('');
const router = useRouter();
const route = useRoute();
const isModalOpen = ref(false);
const isRenameModalOpen = ref(false); // Zustand für das Umbenennungs-Popup
const colorInput = ref('');
const isEditPalette = ref(false);

const handleEditName = async () => {
  isRenameModalOpen.value = true; // Popup öffnen
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
  isRenameModalOpen.value = false; // Popup schließen
};

const loadPalette = async () => {
  try {
    palette.value = await fetchPaletteById(route.params.id);
    paletteName.value = palette.value.name;
  } catch (error) {
    console.error('Error loading palette details:', error);
  }
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

const handleEditColor = async (idx) => {
  const newColor = prompt('Enter a new color (e.g., #FF5733):', palette.value.colors[idx]);
  if (newColor) {
    try {
      const oldColor = palette.value.colors[idx];
      await updateColor(palette.value.id, oldColor, newColor);
      palette.value.colors[idx] = newColor;
    } catch (error) {
      console.error('Error updating color:', error);
    }
  }
};

const handleAddColor = async () => {
  if (!newColor.value) {
    newColor.value = '#000000';
  }
  try {
    await addColor(palette.value.id, newColor.value);
    palette.value.colors.push(newColor.value);
  } catch (error) {
    console.error('Error adding color:', error);
  }
};

onMounted(() => {
  loadPalette();
});

const openModal = () => {
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  colorInput.value = '';
};

const closeRenameModal = () => {
  isRenameModalOpen.value = false; // Schließt das Umbenennungs-Popup
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

.header-section button {
  margin: 0;
}

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

.color-hex {
  font-size: 0.8rem;
}

.btn-container button {
  margin-left: 5px;
  color: #fff;
}

.button-container {
  display: flex;
  align-items: center;
  gap: 10px; /* Abstand zwischen den Buttons */
}

/* Stil für das Umbenennungs-Popup */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 10px;
  width: 400px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px; /* Abstand zwischen Header und Body */
}

.modal-body {
  margin-bottom: 20px; /* Abstand zwischen Body und Footer */
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  gap: 10px; /* Abstand zwischen den Buttons */
}

.modal-footer .btn {
  padding: 10px 20px; /* Größere Buttons */
}
</style>
