<template>
  <div class="container mt-4">
    <div class="header-section">
      <router-link to="/palettes">
        <button class="btn mdi mdi-arrow-left m-0 p-0"> Back to my Palettes</button>
      </router-link>
    </div>

    <div class="container mt-4">
      <div v-if="palette" class="row justify-content-center">
        <div class="card shadow">
          <div class="card-header d-flex justify-content-between align-items-center px-2">
            <!-- Bearbeiten des Namens -->
            <div>
              <h5 v-if="!isEditPalette" class="fw-bold mb-0 pl-3">{{ palette.name }}</h5>
              <input
                  v-if="isEditPalette"
                  v-model="paletteName"
                  type="text"
                  class="form-control"
                  @blur="handleSaveName"
                  @keyup.enter="handleSaveName"
                  autofocus
              />
            </div>

            <div>
              <button v-if="!isEditPalette" class="btn btn-outline-dark mdi mdi-pencil w-auto mt-0" @click="handleEditName"> Edit Name</button>
              <button v-if="isEditPalette" class="btn btn-success mdi mdi-trash-can w-auto mt-0" @click="updatePaletteName"> Save Edit</button>
              <button v-if="isEditPalette" class="btn btn-dark mdi mdi-cancel w-auto mt-0 ms-2" @click="handleEditName"> Cancel Edit</button>
            </div>
          </div>

          <div class="card-body p-0 mt-3">
            <div class="d-flex flex-wrap">
              <div
                  v-for="(color, idx) in palette.colors"
                  :key="idx"
                  :style="{ backgroundColor: color, width: '30%' }"
                  class="color-box"
              >
                <div :style="{ backgroundColor: color, height: '100px', width: '100%' }"></div>

                <div class="d-flex justify-content-between mt-2">
                  <button @click="handleEditColor(idx)"
                          class="btn rounded-0 btn-secondary btn-sm mdi mdi-pencil "></button>
                  <button @click="handleDeleteColor(idx)"
                          class="btn rounded-0 btn-dark btn-sm mdi mdi-trash-can"></button>
                </div>
              </div>
            </div>

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

              <div class="d-flex justify-content-between mt-2">
                <button v-if="!isModalOpen" class="btn btn-success mdi mdi-plus me-2" @click="openModal"> Add New
                  Color
                </button>
                <button v-if="isModalOpen" class="btn btn-success mdi mdi-plus me-2" @click="handleAddColor"> Add
                  Color
                </button>
                <button class="btn btn-dark mdi mdi-dice-3" @click="handleAddRandomColor"> Add Random Color</button>

              </div>
              <button v-if="isEditPalette" class="btn btn-danger mdi mdi-trash-can " @click="handleDeletePalette"> Delete Palette</button>

            </div>
          </div>
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
  updatePaletteName
} from '../services/Palettes.js'; // Neue Methode updatePaletteName importieren

const palette = ref(null);
const newColor = ref('');
const paletteName = ref('');
const router = useRouter();
const route = useRoute();
const isModalOpen = ref(false);
const colorInput = ref('');
const isEditPalette = ref(false);

const handleEditName = async () => {
  isEditPalette.value = !isEditPalette.value;
  if (isEditPalette.value) {
    // Wenn der Bearbeitungsmodus aktiviert wird, speichere den aktuellen Namen für späteres Zurücksetzen.
    paletteName.value = palette.value.name;
  } else {
    await handleSaveName();
  }
};

const handleSaveName = async () => {
  if (paletteName.value && paletteName.value !== palette.value.name) {
    try {
      // Update the name of the palette in the backend
      await updatePaletteName(palette.value.id, paletteName.value);
      palette.value.name = paletteName.value; // Update the local palette name
    } catch (error) {
      console.error('Error updating palette name:', error);
    }
  }
  isEditPalette.value = false;
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
    await router.push({name: 'Palette'});
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
    newColor.value = "#000000";
  }
  try {
    await addColor(palette.value.id, newColor.value);
    palette.value.colors.push(newColor.value);
  } catch (error) {
    console.error('Error adding color:', error);
  }
};

const handleAddRandomColor = async () => {
  newColor.value = generateRandomColor();
  if (newColor.value) {
    try {
      await addColor(palette.value.id, newColor.value);
      palette.value.colors.push(newColor.value);
    } catch (error) {
      console.error('Error adding color:', error);
    }
  } else {
    console.warn('Please enter a color');
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

</script>

<style scoped>
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.color-box {
  margin: 5px;
  text-align: center;
}

button {
  width: 100%;
  margin-top: 10px;
}

.color-input-field {
  height: 100px;
  width: 300px;
}
</style>
