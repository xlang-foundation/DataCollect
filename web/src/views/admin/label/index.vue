<!-- src/views/admin/label/index.vue -->
<template>
  <div class="label-container">
    <div class="header">
      <h2>{{ t('label.labelManagement') }}</h2>
      <el-button type="primary" @click="handleAdd">{{ t('label.addLabel') }}</el-button>
    </div>

    <!-- 标签列表 -->
    <el-table :data="labelList" border style="width: 100%" v-loading="loading">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="label" :label="t('label.labelName')" />
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
      :title="isEdit ? t('label.editLabel') : t('label.addLabel')"
      width="500px"
      @close="resetForm"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item :label="t('label.labelName')" prop="label">
          <el-input v-model="form.label" />
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
import { getLabelList, addLabel, updateLabel, deleteLabel } from '@/api/label'
import type { LabelInfo } from '@/api/label'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const labelList = ref<LabelInfo[]>([])
const formRef = ref<FormInstance>()

const form = ref({
  id: 0,
  label: ''
})

const rules = {
  label: [
    { required: true, message: t('validation.required'), trigger: 'blur' }
  ]
}

// 获取标签列表
const fetchLabelList = async () => {
  try {
    loading.value = true
    const data = await getLabelList()
    labelList.value = data
  } catch (error) {
    console.error('Failed to fetch labels:', error)
  } finally {
    loading.value = false
  }
}

// 添加标签
const handleAdd = () => {
  isEdit.value = false
  form.value = { id: 0, label: '' }
  dialogVisible.value = true
}

// 编辑标签
const handleEdit = (row: LabelInfo) => {
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
        await updateLabel(form.value.id, form.value.label)
        ElMessage.success(t('common.success'))
      } else {
        await addLabel(form.value.label)
        ElMessage.success(t('common.success'))
      }
      dialogVisible.value = false
      fetchLabelList()
    } catch (error) {
      console.error('Operation failed:', error)
      ElMessage.error(t('common.error'))
    } finally {
      submitLoading.value = false
    }
  })
}

// 删除标签
const handleDelete = async (row: LabelInfo) => {
  try {
    await ElMessageBox.confirm(
      t('label.deleteConfirm'),
      t('common.tip'),
      {
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
        type: 'warning'
      }
    )

    await deleteLabel(row.id)
    ElMessage.success(t('common.success'))
    fetchLabelList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to delete label:', error)
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

// 页面加载时获取标签列表
onMounted(() => {
  fetchLabelList()
})
</script>

<style scoped>
.label-container {
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
