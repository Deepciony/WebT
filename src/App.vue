<script setup>
import { useRoute } from 'vue-router';
import MainMenu from './components/MainMenu.vue';
import { isSky } from './stores/theme.js';

const route = useRoute();
</script>

<template>
  <h1 v-if="!isSky" class="brand-title">KUSHOP</h1>
  <MainMenu v-if="!isSky || !route.meta.guestOnly">  </MainMenu>

  <main>
    <router-view></router-view>
  </main>
</template>

<style scoped>
.brand-title { font-family: 'Playfair Display', Georgia, serif; font-weight: 700; }
</style>
