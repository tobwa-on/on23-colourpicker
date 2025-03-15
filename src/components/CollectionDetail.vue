<template>
  <div class="container mt-4">
    <div class="header-section">
      <h1 v-if="collection" class="title m-0">{{ collection.name }}</h1>
      <router-link to="/collections">
        <button class="btn btn-lg add-btn mdi mdi-arrow-left m-0 p-0"></button>
      </router-link>

      <div class="button-container">
        <div class="dropdown">
          <button
              class="btn mdi mdi-plus-circle-outline add-btn"
              type="button"
              id="dropdownAddButton"
              data-bs-toggle="dropdown"
              aria-expanded="false"
          ></button>
          <ul class="dropdown-menu" aria-labelledby="dropdownAddButton">
            <li>
              <a class="mdi mdi-plus dropdown-item" @click="openColourModal">
                Add Colour
              </a>
            </li>
            <li>
              <a class="mdi mdi-dice-multiple dropdown-item" @click="handleAddRandomColor">
                Random Colour
              </a>
            </li>
            <li>
              <a class="mdi mdi-star dropdown-item" @click="addIntelligentColorHandler" :class="{ 'disabled': !hasColors }">
                Intelligent Colour
              </a>
            </li>
          </ul>
        </div>

        <div class="dropdown">
          <button
              class="btn add-btn mdi mdi-dots-vertical"
              type="button"
              id="dropdownMenuButton"
              data-bs-toggle="dropdown"
              aria-expanded="false"
          />

          <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton">
            <li>
              <a class="mdi mdi-pencil dropdown-item" @click="handleEditName">
                Rename
              </a>
            </li>
            <li>
              <a class="mdi mdi-download dropdown-item" @click="handleDownloadCollection" :class="{ 'disabled': !hasColors }">
                Download .png
              </a>
            </li>
            <li>
              <a class="mdi mdi-download dropdown-item" @click="handleDownloadCollectionJson" :class="{ 'disabled': !hasColors }">
                Download .json
              </a>
            </li>
            <li>
              <a class="mdi mdi-trash-can dropdown-item text-danger" @click="handleDeleteCollection">
                Delete
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div v-if="collection">
      <div class="d-block">
        <div
            v-for="(color, idx) in collection.colors"
            :key="idx"
            class="color-box mb-3"
        >
          <div :style="{ backgroundColor: color, height: '100px', width: '100%' }">
            <div class="overlay">
              <div class="text-container">
                <div class="color-hex" :style="{ color: getTextColor(color) }">{{ color }}</div>
              </div>
              <div class="btn-container">
                <button @click="openEditColorModal(idx)" class="btn mdi mdi-pencil"
                        :style="{ color: getTextColor(color) }"></button>
                <button @click="handleDeleteColor(idx)" class="btn mdi mdi-trash-can"
                        :style="{ color: getTextColor(color) }"></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <RenameCollectionModal
        :isOpen="isRenameModalOpen"
        :theme="theme"
        :collectionName="collection ? collection.name : ''"
        @close="closeRenameModal"
        @submit="handleSubmitRename"
    />

    <EditColourModal
        :isOpen="isColourModalOpen"
        :theme="theme"
        :color="currentColor"
        @close="closeColourModal"
        @submit="handleSubmitColor"
    />
  </div>
</template>

<script setup>
import {onMounted, ref, inject, computed} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {
  addColor,
  deleteColor,
  deleteCollection,
  fetchCollectionById,
  updateColor,
  updateCollectionName,
  getIntelligentColor,
  generateRandomColor,
  downloadCollectionAsImage,
  downloadCollectionAsJson
} from '../services/CollectionService.js';
import EditColourModal from "./EditColourModal.vue";
import RenameCollectionModal from "./CollectionRenameModal.vue";

const theme = inject('theme');
const collection = ref(null);
const collectionName = ref('');
const router = useRouter();
const route = useRoute();
const isRenameModalOpen = ref(false);
const isColourModalOpen = ref(false);
const colorModalMode = ref('add');
const currentColor = ref('#000000');
const editColorIndex = ref(null);

const loadCollections = async () => {

  try {
    collection.value = await fetchCollectionById(route.params.id);
    collectionName.value = collection.value.name;
  } catch (error) {
    console.error('Error loading collection details:', error);
  }
};

// Öffnet den Modal im Hinzufügen-Modus
const openColourModal = () => {
  colorModalMode.value = 'add';
  currentColor.value = '#000000';
  isColourModalOpen.value = true;
};

// Öffnet den Modal im Editier-Modus und setzt den aktuellen Farbwert
const openEditColorModal = (idx) => {
  colorModalMode.value = 'edit';
  editColorIndex.value = idx;
  currentColor.value = collection.value.colors[idx];
  isColourModalOpen.value = true;
};

// Schließen des Colour-Modals
const closeColourModal = () => {
  isColourModalOpen.value = false;
  editColorIndex.value = null;
  currentColor.value = '#000000';
};

const handleSubmitColor = async (newColor) => {
  if (colorModalMode.value === 'edit' && editColorIndex.value !== null) {
    const oldColor = collection.value.colors[editColorIndex.value];
    try {
      await updateColor(collection.value.id, oldColor, newColor);
      collection.value.colors[editColorIndex.value] = newColor;
    } catch (error) {
      console.error('Error updating color:', error);
    }
  } else {
    try {
      await addColor(collection.value.id, newColor);
      collection.value.colors.push(newColor);
    } catch (error) {
      console.error('Error adding color:', error);
    }
  }
  closeColourModal();
};

const closeRenameModal = () => {
  isRenameModalOpen.value = false;
};

const handleEditName = () => {
  isRenameModalOpen.value = true;
};

const handleSubmitRename = async (newName) => {
  if (newName && newName !== collection.value.name) {
    try {
      await updateCollectionName(collection.value.id, newName);
      collection.value.name = newName;
    } catch (error) {
      console.error('Error updating collection name:', error);
    }
  }
  isRenameModalOpen.value = false;
};

const handleDeleteCollection = async () => {
  try {
    await deleteCollection(collection.value.id);
    await router.push('/collections');
  } catch (error) {
    console.error('Error deleting collection:', error);
  }
};

const handleDeleteColor = async (idx) => {
  try {
    const colorToDelete = collection.value.colors[idx];
    await deleteColor(collection.value.id, colorToDelete);
    collection.value.colors.splice(idx, 1);
  } catch (error) {
    console.error('Error deleting color:', error);
  }
};

const handleAddRandomColor = async () => {
  try {
    const randomColor = generateRandomColor();
    collection.value.colors.push(randomColor);
    await addColor(collection.value.id, randomColor);
  } catch (error) {
    console.error('Error adding random color:', error);
  }
};

const addIntelligentColorHandler = async () => {
  try {
    const intelligentColor = await getIntelligentColor(collection.value.colors);
    await addColor(collection.value.id, intelligentColor);
    collection.value.colors.push(intelligentColor);
  } catch (error) {
    console.error('Error adding intelligent color:', error);
  }
};

const handleDownloadCollection = async () => {
  if (collection.value) {
    await downloadCollectionAsImage(collection.value);
  }
};

const handleDownloadCollectionJson = async () => {
  if (collection.value) {
    await downloadCollectionAsJson(collection.value);
  }
};

// Farbauswahl für Hex-Code und Stift/Müll-Icon Anzeige basierend auf Kontrast zum Hintergrund
const getTextColor = (hexColor) => {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);

  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? "black" : "white";
};

const hasColors = computed(() => collection.value && collection.value.colors.length > 0);

onMounted(() => {
  loadCollections();
});
</script>

<style scoped>
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  margin-top: 10px;
  margin-bottom: 30px;
}

.header-section .title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: 0;
}

.button-container {
  display: flex;
  position: absolute;
  right: 0;
}

.color-box {
  position: relative;
  border-radius: 8px;
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
}

.btn-container button {
  margin-left: 5px;
  color: #fff;
}

.add-btn {
  border-radius: 50%;
  font-size: 1.7rem;
  cursor:pointer;
  margin-right: 10px;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.btn {
  padding: 10px 15px;
  font-size: 1.4rem;
}

@media (max-width: 768px) {
  .dropdown-menu {
    position: static;

    border: none;
    box-shadow: none;
  }

  .dropdown-item {
    text-align: center;
    padding: 15px;
    font-size: 1.2rem;
  }
}

.dropdown-menu {
  left: 0;
  right: 0;
  margin: 0 auto;
}
</style>