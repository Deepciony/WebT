<template>
  <nav class="navbar navbar-expand-lg bg-body-tertiary">
    <div class="container-fluid">
      <button
        class="navbar-toggler" type="button" data-bs-toggle="collapse"
        data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav">
          <li class="nav-item">
            <router-link to="/"><div class="nav-link">Home</div></router-link>
          </li>
          <li class="nav-item">
            <router-link to="/product"><div class="nav-link">Product</div></router-link>
          </li>
          <li v-if="!isLoggedIn" class="nav-item">
            <router-link to="/login"><div class="nav-link">Login</div></router-link>
          </li>
          <li v-if="isLoggedIn" class="nav-item">
            <router-link to="/manage"><div class="nav-link">แก้ไขข้อมูล</div></router-link>
          </li>
          <li v-if="isLoggedIn" class="nav-item">
            <router-link to="/profile"><div class="nav-link">Profile</div></router-link>
          </li>
          <li v-if="isLoggedIn" class="nav-item">
            <router-link to="/database"><div class="nav-link">ฐานข้อมูล</div></router-link>
          </li>
            <li v-if="isLoggedIn" class="nav-item">
              <router-link to="/cart"><div class="nav-link">ตะกร้า <span class="cart-badge">{{ cartCount }}</span></div></router-link>
            </li>
        </ul>
      </div>
    </div>
  </nav>
</template>
<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { cartCount } from '../stores/cart.js'

const route = useRoute()
const isLoggedIn = ref(Boolean(localStorage.getItem('kushopUser')))

watch(() => route.fullPath, () => {
  isLoggedIn.value = Boolean(localStorage.getItem('kushopUser'))
})

</script>
<style scoped>
.nav-logout { color: #dc3545; background: transparent; border: 0; cursor: pointer; }
</style>
