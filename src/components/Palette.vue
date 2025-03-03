<template>
  <div>
    <div class="row justify-content-center mt-5">
      <div class="col-md-10">
        <div class="d-flex justify-content-between mb-4">
          <h3>Color Palettes</h3>
          <button class="btn btn-primary" @click="addNewPalette">Add New Palette</button>
        </div>

        <!-- Color Palettes -->
        <div class="row">
          <div v-for="(palette, index) in palettes" :key="palette.id || index" class="col-6 col-sm-4 col-md-3 mb-4">
            <div class="card shadow-sm" @click="goToPaletteDetail(palette.id || index)">
              <div class="card-header text-center">
                <h5>{{ palette.name }}</h5>
              </div>
              <div class="card-body p-0">
                <div class="d-flex">
                  <div
                    v-for="(color, idx) in palette.colors"
                    :key="idx"
                    :style="{ backgroundColor: color, width: '100%' }"
                    class="color-box"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

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

const loadPalettes = async () => {
  try {
    palettes.value = await fetchPalettes();
  } catch (error) {
    console.error('Error loading palettes:', error);
  }
};

const addNewPalette = async () => {
  const paletteName = prompt('Enter the name of the new palette:');
  const colorsInput = prompt('Enter the colors (comma separated):');

  if (paletteName && colorsInput) {
    const colors = colorsInput.split(',').map(color => color.trim());
    await createPalette(paletteName, colors);
    loadPalettes(); 
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
.card-header {
  background-color: #f1f1f1;
}

.card-header h5 {
  font-size: 1.25rem;
  font-weight: bold;
}

.color-box {
  height: 100px;
  border: 1px solid #fff;
}
</style>
