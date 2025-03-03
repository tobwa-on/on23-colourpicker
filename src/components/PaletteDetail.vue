<template>
    <div class="container mt-5">
      <div v-if="palette" class="row justify-content-center">
        <div class="col-md-8">
          <div class="card shadow-sm">
            <div class="card-header text-center">
              <h5>{{ palette.name }}</h5>
            </div>
            <div class="card-body p-0">
              <div class="d-flex flex-wrap">
                <div
                  v-for="(color, idx) in palette.colors"
                  :key="idx"
                  :style="{ backgroundColor: color, width: '20%' }"
                  class="color-box"
                >
                  <div :style="{ backgroundColor: color, height: '100px', width: '100%' }"></div>
                  <button @click="handleDeleteColor(idx)" class="btn btn-danger btn-sm mt-2">Delete</button>
                  <button @click="handleEditColor(idx)" class="btn btn-primary btn-sm mt-2">Edit</button>
                </div>
              </div>
              <div class="mt-3">
                <input
                  v-model="newColor"
                  type="text"
                  class="form-control"
                  placeholder="Enter color hex or name"
                />
                <button class="btn btn-success mt-2" @click="handleAddColor">Add Color</button>
                <button class="btn btn-warning mt-2" @click="handleAddRandomColor">Add Random Color</button> <!-- Button for random color -->
              </div>
            </div>
            <div class="card-footer text-center">
              <button class="btn btn-danger" @click="handleDeletePalette">Delete Palette</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { fetchPaletteById, deletePalette, deleteColor, updateColor, addColor, generateRandomColor } from '../services/Palettes.js'; // Importiere generateRandomColor
  
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
      router.push({ name: 'Palette' });
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
    const randomColor = generateRandomColor();
    newColor.value = randomColor;
  };
  
  onMounted(() => {
    loadPalette();
  });
  </script>
  
  <style scoped>
  .color-box {
    margin: 5px;
    text-align: center;
  }
  
  button {
    width: 100%;
    margin-top: 10px;
  }
  </style>
  