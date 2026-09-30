<script setup>
import { useRoute } from 'vue-router';
import MainMenu from './components/layout/MainMenu.vue';

const route = useRoute();
</script>

<template>
  <MainMenu v-if="!route.meta.guestOnly">  </MainMenu>

  <main>
    <router-view></router-view>
  </main>
</template>

