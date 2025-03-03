<template>
  <div class="container mt-4">
    <div class="header-section ">
      <router-link to="/palettes">
        <button class="btn mdi mdi-arrow-left m-0 p-0"> Back to my Palettes</button>
      </router-link>
    </div>

    <div class="container mt-4">
      <div v-if="palette" class="row justify-content-center">
        <div class="card shadow">

          <div class="card-header d-flex justify-content-between align-items-center px-0">
            <h5 class="fw-bold mb-0">{{ palette.name }}</h5>
            <button class="btn btn-danger mdi mdi-trash-can w-auto mt-0" @click="handleDeletePalette"> Delete Palette</button>
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
                  <button @click="handleEditColor(idx)" class="btn rounded-0 btn-secondary btn-sm mdi mdi-pencil "></button>
                  <button @click="handleDeleteColor(idx)" class="btn rounded-0 btn-dark btn-sm mdi mdi-trash-can"></button>
                </div>


              </div>
            </div>

            <div class="my-3">
              <input
                  v-model="newColor"
                  type="text"
                  class="form-control"
                  placeholder="Enter color hex or name"
              />

              <div class="d-flex justify-content-between mt-2">
                <button class="btn btn-success mdi mdi-plus me-2" @click="handleAddColor"> Add Color</button>
                <button class="btn btn-dark mdi mdi-dice-3" @click="handleAddRandomColor"> Add Random Color</button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

</template>

<script setup>
import {onMounted, ref} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {
  addColor,
  deleteColor,
  deletePalette,
  fetchPaletteById,
  generateRandomColor,
  updateColor
} from '../services/Palettes.js'; // Importiere generateRandomColor

const palette = ref(null);
const newColor = ref('');
const router = useRouter();
const route = useRoute();

const loadPalette = async () => {
  try {
    palette.value = await fetchPaletteById(route.params.id);
  } catch (error) {
    console.error('Error loading palette details:', error);
  }
};

const handleDeletePalette = async () => {
  try {
    await deletePalette(palette.value.id);
    router.push({name: 'Palette'});
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
  if (newColor.value) {
    try {
      await addColor(palette.value.id, newColor.value);
      palette.value.colors.push(newColor.value);
      newColor.value = '';
    } catch (error) {
      console.error('Error adding color:', error);
    }
  } else {
    console.warn('Please enter a color');
  }
};

const handleAddRandomColor = () => {
  newColor.value = generateRandomColor();
};

onMounted(() => {
  loadPalette();
});
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
</style>
