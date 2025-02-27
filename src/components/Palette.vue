<template>
  <div>
    <div class="row justify-content-center mt-5">
      <div class="col-md-10">
        <div class="d-flex justify-content-between mb-4">
          <h3>Color Palettes</h3>
        </div>

        <!-- Color Palettes -->
        <div class="row">
          <div v-for="(palette, index) in palettes" :key="index" class="col-md-4 mb-4">
            <div class="card shadow-sm">
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
                  >
                  </div>
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
const palettes = [
  { name: 'Sunset Glow', colors: ['#FF5733', '#FF8D1A', '#FFC300', '#FFDA79'] },
  { name: 'Ocean Breeze', colors: ['#0097A7', '#00B8D4', '#006064', '#80DEEA'] },
];
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
