<script setup lang="ts">
import { RouterView } from 'vue-router'
import { usePhotoStore } from "@/stores/photo.ts"
import { useLanguageStore } from "@/stores/language.ts"
import { useI18n } from 'vue-i18n'
const photoStore = usePhotoStore()
photoStore.fetchCurrentGPS()
const languageStore = useLanguageStore()

setInterval(() => {
  photoStore.fetchCurrentGPS()
}, 1000)

const { locale } = useI18n()
locale.value = localStorage.getItem('language') || 'en-US'

import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import En from 'element-plus/es/locale/lang/en'
</script>

<template>
  <el-config-provider :locale="languageStore.$state.currentLanguage === 'en-US' ? En : zhCn">
    <RouterView />
  </el-config-provider>
</template>

<style scoped>

</style>
