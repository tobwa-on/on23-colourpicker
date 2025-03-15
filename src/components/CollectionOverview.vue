<template>
  <div class="container mt-4">
    <div class="header-section">
      <h1 class="title m-0">My Collections</h1>
      <button
          class="btn add-btn mdi mdi-plus-circle-outline"
          @click="openModal"
      ></button>
    </div>

    <div class="collection-container">
      <div
          v-for="(collection, index) in collections"
          :key="collection.id || index"
          class="collection-card"
          @click="goToCollectionDetail(collection.id || index)"
      >
        <div class="collection-header">
          <h5>{{ collection.name }}</h5>
        </div>
        <div class="collection-body">
          <template v-if="collection.colors && collection.colors.length > 0">
            <div
                v-for="(color, idx) in collection.colors"
                :key="idx"
                class="color-box"
                :style="{ backgroundColor: color }"
            ></div>
          </template>
          <template v-else>
            <div class="color-box empty-box"></div>
          </template>
        </div>
      </div>
    </div>

    <CreateCollectionModal
        :isOpen="isModalOpen"
        :theme="theme"
        @close="closeModal"
        @submit="handleSubmitNewCollection"
    />
  </div>
</template>
<script setup>
import { ref, inject, onMounted, getCurrentInstance } from 'vue';
import { useRouter } from 'vue-router';
import { fetchCollections, createCollection } from '../services/CollectionService.js';
import CreateCollectionModal from "./CreateCollectionModal.vue";

const theme = inject('theme');
const collections = ref([]);
const router = useRouter();
const isModalOpen = ref(false);
const { proxy } = getCurrentInstance();

const loadCollections = async () => {
  try {
    const fetchedCollections = await fetchCollections(proxy.$showToastMessage);
    collections.value = fetchedCollections.sort((a, b) =>
        a.name.localeCompare(b.name)
    );
  } catch (error) {
    // Error handling is already done in the service
  }
};

const openModal = () => {
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

const handleSubmitNewCollection = async (collectionName) => {
  if (collectionName) {
    await createCollection(collectionName, [], proxy.$showToastMessage);
    await loadCollections();
    closeModal();
  }
};

const goToCollectionDetail = (collectionId) => {
  router.push({ name: 'Palette Details', params: { id: collectionId } });
};

onMounted(() => {
  loadCollections();
});

</script>


<style scoped>
.header-section {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-top: 10px;
  margin-bottom: 20px;
}

.add-btn {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  font-size: 1.7rem;
  cursor: pointer;
  transition: background-color 0.3s, box-shadow 0.3s, transform 0.2s;
}

/* Active-Effekt */
.add-btn:active {
  transform: translateY(-50%) scale(0.95);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
}

.bg-dark .add-btn:hover {
  background-color: #5a6268;
}

.collection-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding-bottom: 80px;
}

.collection-card {
  overflow: hidden;
  cursor: pointer;
}

.collection-header {
  padding: 10px;
}

.collection-header h5 {
  margin: 0;
  font-size: 1.1rem;
}

.collection-body {
  display: flex;
  border-radius: 8px;
  overflow: hidden; /* So werden die Kinder an den runden Ecken beschnitten */
}

.color-box {
  flex: 1;
  height: 60px;
}

.empty-box {
  border: 1px solid grey;
  border-radius: 8px;
  background-color: transparent;
}


</style>
