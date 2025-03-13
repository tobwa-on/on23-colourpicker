<template>
  <div class="container mt-4">
    <div class="header-section">
      <router-link to="/collections">
        <button class="btn btn-lg mdi mdi-arrow-left m-0 p-0"></button>
      </router-link>

      <!-- Titel in der Mitte -->
      <h1 v-if="collection" class="title m-0">{{ collection.name }}</h1>

      <div class="button-container">
        <!-- Dropdown für Farbhinzufügen -->
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
              <a class="mdi mdi-star dropdown-item" @click="addIntelligentColorHandler">
                Intelligent Colour
              </a>
            </li>
          </ul>
        </div>

        <!-- Dropdown für weitere Einstellungen (Rename, Download, Delete) -->
        <div v-if="collection" class="dropdown">
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
              <a class="mdi mdi-pencil dropdown-item" @click="handleEditName">
                Rename
              </a>
            </li>
            <li>
              <a class="mdi mdi-download dropdown-item" @click="handleDownloadCollection">
                Download
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
                <button @click="openEditColorModal(idx)" class="btn mdi mdi-pencil" :style="{ color: getTextColor(color) }"></button>
                <button @click="handleDeleteColor(idx)" class="btn mdi mdi-trash-can" :style="{ color: getTextColor(color) }"></button>
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
import {onMounted, ref, inject} from 'vue';
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
  downloadCollectionAsImage
} from '../services/CollectionService.js';
import EditColourModal from "./EditColourModal.vue";
import RenameCollectionModal from "./RenameCollectionModal.vue";

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

// Farbauswahl für Hex-Code und Stift/Müll-Icon Anzeige basierend auf Kontrast zum Hintergrund
const getTextColor = (hexColor) => {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);

  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? "black" : "white";
};

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

.btn-container button {
  margin-left: 5px;
  color: #fff;
}

</style>