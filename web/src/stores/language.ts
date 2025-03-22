import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLanguageStore = defineStore('language', () => {
  // 获取浏览器默认语言
  const getBrowserLanguage = () => {
    const lang = navigator.language
    return lang.toLowerCase().includes('zh') ? 'zh-CN' : 'en-US'
  }

  // 从localStorage获取语言设置，如果没有则使用浏览器默认语言
  const currentLanguage = ref(localStorage.getItem('language') || getBrowserLanguage())

  // 切换语言
  const setLanguage = (lang: string) => {
    currentLanguage.value = lang
    localStorage.setItem('language', lang)
  }

  return {
    currentLanguage,
    setLanguage
  }
})
