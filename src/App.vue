<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue';
import AppAside from '@/components/AppAside.vue';
import { refreshInfo } from './shared/utils/login';
import { useRoute } from 'vue-router';
const route = useRoute();
refreshInfo();
</script>

<template>
  <AppHeader v-if="route.path !=='/login'" />
  <main v-if="route.path =='/login'" >
    <div class="app-view-login">
      <router-view />
    </div>
  </main>
  <main v-else class="mainAside">
    <AppAside />
    <div class="app-view-block">
      <router-view />
    </div>
  </main>
  <footer></footer>
</template>

<style lang="scss" scoped>
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.mainAside {
  position: relative;
  min-height: calc(100vh - 80px);
  background-color: var(--o-color-bg1);
  margin-top: 80px;
  overflow: hidden;
  display: grid;
  grid-template-columns: max-content auto;

  @media (max-width: 1100px) {
    margin-top: 48px;
  }
}

</style>
