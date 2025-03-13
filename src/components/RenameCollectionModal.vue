<template>
  <div v-if="isOpen" :class="['modal-overlay', theme]">
    <div :class="['modal-content', theme]">
      <h3 class="modal-title">Rename Collection</h3>
      <form @submit.prevent="handleSubmit">
        <div class="modal-body">
          <input
              v-model="newCollectionName"
              type="text"
              class="form-control"
              placeholder="Enter new collection name."
          />
        </div>
        <div class="modal-footer modal-buttons mt-3">
          <button type="button" class="btn btn-secondary mdi mdi-close" @click="handleClose">
            Cancel
          </button>
          <button type="submit" class="btn btn-primary mdi mdi-check">
            Save
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
  theme: {
    type: String,
    default: 'light',
  },
  // Der Name der Collection wird als String übergeben
  collectionName: {
    type: String,
    default: '',
  },
});

const emits = defineEmits(['close', 'submit']);

// Initialer Wert entspricht dem übergebenen collectionName
const newCollectionName = ref(props.collectionName);

// Aktualisiere den internen Wert, falls sich der Prop geändert hat
watch(
    () => props.collectionName,
    (newVal) => {
      newCollectionName.value = newVal;
    }
);

const handleClose = () => {
  emits('close');
};

const handleSubmit = () => {
  // Hier wird der Wert aus dem Input zurückgegeben
  emits('submit', newCollectionName.value);
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: #ffffff;
  padding: 30px;
  border-radius: 10px;
  width: 90%;
  max-width: 400px;
  text-align: center;
}

.modal-content.light {
  background-color: #ffffff;
  color: #000000;
}

.modal-content.dark {
  background-color: #1e1e1e;
  color: #ffffff;
}

.modal-buttons {
  display: flex;
  width: 100%;
  gap: 10px;
}

.modal-buttons .btn {
  flex: 1;
  margin: 0;
}

input {
  border: 1px solid #ccc;
  padding: 8px;
  border-radius: 4px;
  outline: none;
  width: 100%;
}

input:focus {
  border-color: #007bff;
  outline: 2px solid #007bff;
}
</style>
