import "normalize.css"
import './assets/main.css'
import 'element-plus/dist/index.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import { createI18n } from 'vue-i18n'
import App from './App.vue'
import router from './router'
import { reportError } from '@/api/errorUpload'

// 导入语言包
import zhCN from './locales/zh-CN'
import enUS from './locales/en-US'

// 创建i18n实例
const i18n = createI18n({
  legacy: false, // 使用组合式API
  locale: localStorage.getItem('language') || navigator.language, // 从localStorage获取语言设置，如果没有则使用浏览器默认语言
  fallbackLocale: 'en-US', // 默认语言
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS
  }
})

const app = createApp(App)

// 添加Vue全局错误处理
app.config.errorHandler = (err:any) => {
  console.error('Vue Error:', err)
  // 上报错误信息
  reportError(err.message, err.stack || '')
}

// 添加全局未捕获的Promise错误处理
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled Promise Rejection:', event.reason)
  reportError('Unhandled Promise Rejection', event.reason?.stack || event.reason?.message || String(event.reason))
})

// 添加全局错误处理
window.onerror = (message, source, lineno, colno, error) => {
  console.error('Global Error:', error)
  reportError(String(message), error?.stack || '')
  return true
}

app.use(createPinia())
app.use(router)
app.use(ElementPlus)
app.use(i18n)
app.mount('#app')
