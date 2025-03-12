<!-- src/views/admin/task/index.vue -->
<template>
  <div class="task-container">
    <div class="header">
      <h2>分派任务</h2>
    </div>

    <el-form :model="form" label-width="120px" class="task-form">
      <el-form-item label="服务器地址">
        <el-input
          v-model="form.serverUrl"
          placeholder="请输入服务器地址"
          @change="handleServerUrlChange"
        />
      </el-form-item>

      <el-form-item label="任务说明">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="3"
          placeholder="请输入任务说明"
          @change="handleDescriptionChange"
        />
      </el-form-item>

      <el-form-item label="选择区域">
        <el-select v-model="form.zoneId" placeholder="请选择区域">
          <el-option
            v-for="zone in zoneList"
            :key="zone.id"
            :label="zone.name"
            :value="zone.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="拍摄者姓名">
        <el-input
          v-model="form.photographerName"
          placeholder="请输入拍摄者姓名"
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="generateLink" :disabled="!form.zoneId">
          生成链接
        </el-button>
      </el-form-item>

      <template v-if="generatedLink">
        <el-form-item label="任务链接">
          <div class="link-section">
            <div class="link-row">
              <el-input v-model="generatedLink" readonly>
                <template #append>
                  <el-button @click="copyLink">复制链接</el-button>
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

        <el-form-item label="完整任务信息">
          <div class="task-info">
            <el-input
              v-model="fullTaskInfo"
              type="textarea"
              :rows="4"
              readonly
            >
              <template #append>
                <el-button @click="copyFullInfo">复制全部</el-button>
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

const zoneList = ref<ZoneInfo[]>([])
const generatedLink = ref('')

// 表单数据
const form = ref({
  serverUrl: localStorage.getItem('taskServerUrl') || window.location.origin,
  description: localStorage.getItem('taskDescription') || '请点击链接完成拍照和标记',
  zoneId: '',
  photographerName: ''
})

// 完整任务信息
const fullTaskInfo = computed(() => {
  if (!generatedLink.value) return ''
  return `${form.value.description}\n\n任务链接：${generatedLink.value}`
})

// 获取区域列表
const fetchZoneList = async () => {
  try {
    const data = await getZoneList()
    zoneList.value = data
  } catch (error) {
    console.error('Failed to fetch zones:', error)
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
    const baseUrl = form.value.serverUrl.replace(/\/$/, '') // 移除末尾的斜杠
    const params = new URLSearchParams()

    if (form.value.photographerName) {
      // 获取名称token
      const data = await signName(form.value.photographerName)

      if (data.success) {
        params.append('name_token', data.token)
      } else {
        ElMessage.error('获取名称签名失败')
        return
      }
    }

    const queryString = params.toString()
    generatedLink.value = `${baseUrl}/zone/${form.value.zoneId}${queryString ? '?' + queryString : ''}`
  } catch (error) {
    console.error('Failed to generate link:', error)
    ElMessage.error('生成链接失败')
  }
}

// 复制链接
const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(generatedLink.value)
    ElMessage.success('链接已复制到剪贴板')
  } catch (err) {
    ElMessage.error('复制失败')
  }
}

// 复制完整信息
const copyFullInfo = async () => {
  try {
    await navigator.clipboard.writeText(fullTaskInfo.value)
    ElMessage.success('完整任务信息已复制到剪贴板')
  } catch (err) {
    ElMessage.error('复制失败')
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
