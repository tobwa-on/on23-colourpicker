<template>
  <div class="container mt-4">
    <div class="header-section">
      <h1 class="title">My Palettes</h1>
      <button class="btn btn-primary mdi mdi-plus" @click="openModal"> New Palette</button>
    </div>

    <!-- Palettes Display Section -->
    <div class="col-md-10 mt-4">
      <div class="row">
        <div v-for="(palette, index) in palettes" :key="palette.id || index" class="col-6 col-sm-4 col-md-3 mb-4">
          <div class="card shadow-sm" @click="goToPaletteDetail(palette.id || index)">
            <div class="card-header text-center align-items-center">
              <h5 class="m-0">{{ palette.name }}</h5>
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

    <!-- Modal for Adding New Palette -->
    <div v-if="isModalOpen" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <h2>Create New Palette</h2>
        <form @submit.prevent="handleSubmit">
          <div class="mb-3">
            <label for="paletteName" class="form-label">Palette Name</label>
            <input v-model="newPaletteName" type="text" id="paletteName" class="form-control" required/>
          </div>
          <div class="mb-3">
            <label for="colorsInput" class="form-label">Colors (comma separated)</label>
            <input v-model="newPaletteColors" type="text" id="colorsInput" class="form-control" required/>
          </div>
          <button type="submit" class="btn btn-primary">Save Palette</button>
          <button type="button" class="btn btn-secondary" @click="closeModal">Cancel</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted} from 'vue';
import {useRouter} from 'vue-router';
import {fetchPalettes, createPalette} from '../services/Palettes.js';

const palettes = ref([]);
const router = useRouter();
const isModalOpen = ref(false);
const newPaletteName = ref('');
const newPaletteColors = ref('');

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
  newPaletteColors.value = '';
};

const handleSubmit = async () => {
  if (newPaletteName.value && newPaletteColors.value) {
    const colors = newPaletteColors.value.split(',').map(color => color.trim());
    await createPalette(newPaletteName.value, colors);
    await loadPalettes();
    closeModal();
  }
};

const goToPaletteDetail = (paletteId) => {
  router.push({name: 'Palette Details', params: {id: paletteId}});
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

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-size: 1.4rem;
  font-weight: bold;
  color: dimgrey;
}

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
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
}

.modal-content h2 {
  margin-bottom: 20px;
}

.modal-content .form-control {
  margin-bottom: 15px;
}

.modal-content .btn {
  margin-right: 10px;
}
</style>
