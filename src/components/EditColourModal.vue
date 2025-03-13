<template>
  <div v-if="isOpen" :class="['modal-overlay', theme]">
    <div :class="['modal-content color-picker-modal', theme]">
      <h3 class="mb-3">Select a color</h3>
      <form @submit.prevent="handleSubmit">
        <div class="color-info">
          <div class="color-hex-code">{{ newColor }}</div>
        </div>
        <div class="color-input mt-3">
          <input
              v-model="newColor"
              type="color"
              class="form-control"
          />
        </div>
        <div class="modal-buttons mt-3">
          <button type="button" class="btn btn-secondary mdi mdi-close" @click="handleClose">
            Cancel
          </button>
          <button type="submit" class="btn btn-primary mdi mdi-plus">
            Save
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import {ref, watch} from 'vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  theme: {
    type: String,
    default: 'light'
  },
  // Übergabe des aktuell anzuzeigenden Farbwerts, egal ob zum Hinzufügen oder Editieren
  color: {
    type: String,
    default: '#000000'
  }
});

const emits = defineEmits(['close', 'submit']);
const newColor = ref(props.color);

watch(
    () => props.color,
    (newVal) => {
      newColor.value = newVal;
    }
);

const handleClose = () => {
  emits('close');
};

const handleSubmit = () => {
  emits('submit', newColor.value);
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
  padding: 12px; /* Größeres Padding für mehr Fläche */
  border-radius: 6px;
  outline: none;
  width: 100%; /* Stellt sicher, dass es die verfügbare Breite einnimmt */
  height: 50px; /* Erhöht die Höhe für größere Sichtbarkeit */
  font-size: 1.2rem; /* Größere Schrift für bessere Lesbarkeit */
}

</style>
