<!-- src/views/admin/login/index.vue -->
<template>
  <div class="login-container">
    <div class="language-switch">
      <el-select v-model="currentLanguage" @change="handleLanguageChange" size="small">
        <el-option label="中文" value="zh-CN" />
        <el-option label="English" value="en-US" />
      </el-select>
    </div>
    <el-card class="login-card">
      <template #header>
        <h2 class="login-title">{{ t('login.title') }}</h2>
      </template>

      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        label-width="0"
        size="large"
        @keyup.enter="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            :placeholder="t('login.username')"
            :prefix-icon="User"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            :placeholder="t('login.password')"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>

        <el-form-item>
          <el-button
            :loading="loading"
            type="primary"
            class="login-button"
            @click="handleLogin"
          >
            {{ t('login.loginButton') }}
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import type { FormInstance } from 'element-plus'
import { login } from '@/api/user'
import { useI18n } from 'vue-i18n'
import { useLanguageStore } from '@/stores/language'

const router = useRouter()
const languageStore = useLanguageStore()
const currentLanguage = ref(languageStore.currentLanguage)
const { t, locale } = useI18n()
const handleLanguageChange = (value: string) => {
  languageStore.setLanguage(value)
  locale.value = value
}

const loading = ref(false)
const loginFormRef = ref<FormInstance>()

const loginForm = reactive({
  username: '',
  password: ''
})

const loginRules = {
  username: [
    { required: true, message: t('validation.required'), trigger: 'blur' },
    { min: 3, max: 20, message: t('validation.tooShort'), trigger: 'blur' }
  ],
  password: [
    { required: true, message: t('validation.required'), trigger: 'blur' },
    { min: 6, max: 20, message: t('validation.tooShort'), trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return

  await loginFormRef.value.validate(async (valid) => {
    if (!valid) return
    try {
      loading.value = true
      const res = await login({
        username: loginForm.username,
        password: loginForm.password
      } as any)

      // 保存token和用户信息
      localStorage.setItem('token', res.token)
      localStorage.setItem('username', res.username)
      localStorage.setItem('display_name', res.display_name)

      ElMessage.success(t('login.loginSuccess'))
      // 登录成功后跳转到管理页面
      router.push('/admin')
    } catch (error) {
      console.error('Login failed:', error)
      ElMessage.error(t('login.loginFailed'))
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.login-card {
  width: 100%;
  max-width: 400px;
  margin: 20px;
}

.login-title {
  text-align: center;
  color: #303133;
  margin: 0;
  font-weight: 500;
}

.login-button {
  width: 100%;
}

.language-switch {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
}

.language-switch .el-select {
  width: 100px;
}
</style>
