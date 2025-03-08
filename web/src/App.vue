<script setup lang="ts">
import { RouterView } from 'vue-router'
import { usePhotoStore } from "@/stores/photo.ts"
const photoStore = usePhotoStore()
photoStore.fetchCurrentGPS()

setInterval(() => {
  photoStore.fetchCurrentGPS()
}, 1000)
</script>

<template>
  <RouterView />
</template>

<style scoped>

</style>
