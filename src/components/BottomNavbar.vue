<template>
  <nav class="navbar fixed-bottom navbar-light bg-light">
    <div class="container-fluid d-flex justify-content-around">

      <router-link to="/palettes" class="nav-item nav-link">
        <i class="mdi mdi-palette"></i> Colors
      </router-link>

      <router-link to="/home" class="nav-item nav-link">
        <i class="mdi mdi-home"></i> Home
      </router-link>

      <router-link to="/settings" class="nav-item nav-link">
        <i class="mdi mdi-cog"></i> Settings
      </router-link>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  border-top: 1px solid #ddd;
  padding: 10px 0;
}

.nav-item {
  text-align: center;
  font-size: 14px;
  color: #555;
  width: 80px; /* Feste Breite sorgt für gleichbleibende Größe */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-decoration: none;
}

.nav-item i {
  font-size: 24px;
  margin-bottom: 2px;
}

.nav-item.router-link-active {
  color: #007bff;
}

</style>
