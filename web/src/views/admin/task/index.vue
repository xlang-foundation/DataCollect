<!-- src/views/admin/task/index.vue -->
<template>
  <div class="task-container">
    <div class="header">
      <h2>{{ t('task.taskAssignment') }}</h2>
    </div>

    <el-form :model="form" label-width="120px" class="task-form">
      <el-form-item :label="t('task.serverUrl')">
        <el-input
          v-model="form.serverUrl"
          :placeholder="t('task.enterServerUrl')"
          @change="handleServerUrlChange"
        />
      </el-form-item>

      <el-form-item :label="t('task.description')">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="3"
          :placeholder="t('task.enterDescription')"
          @change="handleDescriptionChange"
        />
      </el-form-item>

      <el-form-item :label="t('task.selectZone')">
        <el-select v-model="form.zoneId" :placeholder="t('task.pleaseSelectZone')">
          <el-option
            v-for="zone in zoneList"
            :key="zone.id"
            :label="zone.name"
            :value="zone.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item :label="t('task.photographerName')">
        <el-input
          v-model="form.photographerName"
          :placeholder="t('task.enterPhotographerName')"
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="generateLink" :disabled="!form.zoneId">
          {{ t('task.generateLink') }}
        </el-button>
      </el-form-item>

      <template v-if="generatedLink">
        <el-form-item :label="t('task.taskLink')">
          <div class="link-section">
            <div class="link-row">
              <el-input v-model="generatedLink" readonly>
                <template #append>
                  <el-button @click="copyLink">{{ t('task.copyLink') }}</el-button>
                </template>
              </el-input>
            </div>
            <div class="qrcode-row">
              <QRCodeVue3
                :value="generatedLink"
                :width="200"
                :height="200"
                :margin="2"
                class="qrcode"
              />
            </div>
          </div>
        </el-form-item>

        <el-form-item :label="t('task.fullTaskInfo')">
          <div class="task-info">
            <el-input
              v-model="fullTaskInfo"
              type="textarea"
              :rows="4"
              readonly
            >
              <template #append>
                <el-button @click="copyFullInfo">{{ t('task.copyAll') }}</el-button>
              </template>
            </el-input>
          </div>
        </el-form-item>
      </template>
    </el-form>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { getZoneList } from '@/api/zone'
import { signName } from '@/api/user'
import type { ZoneInfo } from '@/api/zone'
import QRCodeVue3 from 'qrcode.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const zoneList = ref<ZoneInfo[]>([])
const generatedLink = ref('')

// 表单数据
const form = ref({
  serverUrl: localStorage.getItem('taskServerUrl') || window.location.origin,
  description: localStorage.getItem('taskDescription') || t('task.defaultDescription'),
  zoneId: '',
  photographerName: ''
})

// 完整任务信息
const fullTaskInfo = computed(() => {
  if (!generatedLink.value) return ''
  return `${form.value.description}\n\n${t('task.taskLink')}：${generatedLink.value}`
})

// 获取区域列表
const fetchZoneList = async () => {
  try {
    const data = await getZoneList()
    zoneList.value = data
  } catch (error) {
    console.error('Failed to fetch zones:', error)
    ElMessage.error(t('common.error'))
  }
}

// 处理服务器地址变化
const handleServerUrlChange = () => {
  localStorage.setItem('taskServerUrl', form.value.serverUrl)
}

// 处理说明文本变化
const handleDescriptionChange = () => {
  localStorage.setItem('taskDescription', form.value.description)
}

// 生成链接
const generateLink = async () => {
  try {
    const baseUrl = form.value.serverUrl.replace(/\/$/, '')
    const params = new URLSearchParams()

    if (form.value.photographerName) {
      const data = await signName(form.value.photographerName)

      if (data.success) {
        params.append('name_token', data.token)
      } else {
        ElMessage.error(t('task.nameSignError'))
        return
      }
    }

    const queryString = params.toString()
    generatedLink.value = `${baseUrl}/zone/${form.value.zoneId}${queryString ? '?' + queryString : ''}`
  } catch (error) {
    console.error('Failed to generate link:', error)
    ElMessage.error(t('task.generateLinkError'))
  }
}

// 复制链接
const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(generatedLink.value)
    ElMessage.success(t('task.linkCopied'))
  } catch (err) {
    ElMessage.error(t('task.copyError'))
  }
}

// 复制完整信息
const copyFullInfo = async () => {
  try {
    await navigator.clipboard.writeText(fullTaskInfo.value)
    ElMessage.success(t('task.fullInfoCopied'))
  } catch (err) {
    ElMessage.error(t('task.copyError'))
  }
}

// 页面加载时获取区域列表
onMounted(() => {
  fetchZoneList()
})
</script>

<style scoped>
.task-container {
  padding: 20px;
}

.header {
  margin-bottom: 20px;
}

.header h2 {
  margin: 0;
}

.task-form {
  max-width: 800px;
}

.link-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
}

.link-row {
  width: 100%;
}

.qrcode-row {
  display: flex;
  justify-content: center;
  padding: 20px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.qrcode {
  display: block;
}

.task-info {
  width: 100%;
}

:deep(.el-textarea__inner) {
  font-family: monospace;
  font-size: 14px;
}
</style>
