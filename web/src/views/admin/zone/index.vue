<!-- src/views/admin/zone/index.vue -->
<template>
  <div class="zone-container">
    <div class="header">
      <h2>{{ t('zone.zoneManagement') }}</h2>
      <el-button type="primary" @click="handleAdd">{{ t('zone.addZone') }}</el-button>
    </div>

    <!-- 区域列表 -->
    <el-table :data="zoneList" border style="width: 100%" v-loading="loading">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" :label="t('zone.zoneName')" />
      <el-table-column :label="t('common.operation')" width="200">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleEdit(row)">
            {{ t('common.edit') }}
          </el-button>
          <el-button type="danger" size="small" @click="handleDelete(row)">
            {{ t('common.delete') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? t('zone.editZone') : t('zone.addZone')"
      width="500px"
      @close="resetForm"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item :label="t('zone.zoneName')" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">{{ t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
          {{ t('common.confirm') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { getZoneList, addZone, updateZone, deleteZone } from '@/api/zone'
import type { ZoneInfo } from '@/api/zone'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const zoneList = ref<ZoneInfo[]>([])
const formRef = ref<FormInstance>()

const form = ref({
  id: 0,
  name: ''
})

const rules = {
  name: [
    { required: true, message: t('validation.required'), trigger: 'blur' }
  ]
}

// 获取区域列表
const fetchZoneList = async () => {
  try {
    loading.value = true
    const data = await getZoneList()
    zoneList.value = data
  } catch (error) {
    console.error('Failed to fetch zones:', error)
  } finally {
    loading.value = false
  }
}

// 添加区域
const handleAdd = () => {
  isEdit.value = false
  form.value = { id: 0, name: '' }
  dialogVisible.value = true
}

// 编辑区域
const handleEdit = (row: ZoneInfo) => {
  isEdit.value = true
  form.value = { ...row }
  dialogVisible.value = true
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    try {
      submitLoading.value = true
      if (isEdit.value) {
        await updateZone(form.value.id, form.value.name)
        ElMessage.success(t('common.success'))
      } else {
        await addZone(form.value.name)
        ElMessage.success(t('common.success'))
      }
      dialogVisible.value = false
      fetchZoneList()
    } catch (error) {
      console.error('Operation failed:', error)
      ElMessage.error(t('common.error'))
    } finally {
      submitLoading.value = false
    }
  })
}

// 删除区域
const handleDelete = async (row: ZoneInfo) => {
  try {
    await ElMessageBox.confirm(
      t('zone.deleteConfirm'),
      t('common.tip'),
      {
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
        type: 'warning'
      }
    )

    await deleteZone(row.id)
    ElMessage.success(t('common.success'))
    fetchZoneList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to delete zone:', error)
      ElMessage.error(t('common.error'))
    }
  }
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

// 页面加载时获取区域列表
onMounted(() => {
  fetchZoneList()
})
</script>

<style scoped>
.zone-container {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h2 {
  margin: 0;
}
</style>
