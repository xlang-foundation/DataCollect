<script setup lang="ts">
import { RouterView } from 'vue-router'
import { usePhotoStore } from "@/stores/photo.ts"
import { useI18n } from 'vue-i18n'
const photoStore = usePhotoStore()
photoStore.fetchCurrentGPS()

setInterval(() => {
  photoStore.fetchCurrentGPS()
}, 1000)

const { locale } = useI18n()
locale.value = localStorage.getItem('language') || 'en-US'
</script>

<template>
  <RouterView />
</template>

<style scoped>

</style>
