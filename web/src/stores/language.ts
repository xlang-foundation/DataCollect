import { defineStore } from 'pinia'

export const useLanguageStore = defineStore('language', {
  state: () => ({
    currentLanguage: localStorage.getItem('language') || 'zh-CN'
  }),
  actions: {
    setLanguage(lang: string) {
      this.currentLanguage = lang
      localStorage.setItem('language', lang)
    }
  }
})
