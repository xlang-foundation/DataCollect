<!-- src/views/admin/user/index.vue -->
<template>
  <div class="user-container">
    <div class="header">
      <h2>{{ t('user.userManagement') }}</h2>
      <el-button type="primary" @click="handleAdd">{{ t('user.addUser') }}</el-button>
    </div>

    <!-- 用户列表表格 -->
    <el-table :data="userList" border style="width: 100%" v-loading="loading">
      <el-table-column prop="username" :label="t('user.username')" />
      <el-table-column prop="display_name" :label="t('user.displayName')" />
      <el-table-column prop="last_login" :label="t('user.lastLoginTime')">
        <template #default="{ row }">
          {{ formatDate(row.last_login) }}
        </template>
      </el-table-column>
      <el-table-column :label="t('common.operation')" width="150">
        <template #default="{ row }">
          <el-button
            type="danger"
            size="small"
            @click="handleDelete(row)"
            :disabled="row.username === currentUsername"
          >
            {{ t('common.delete') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加用户对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="t('user.addUser')"
      width="500px"
      @close="resetForm"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item :label="t('user.username')" prop="username">
          <el-input v-model="form.username" />
        </el-form-item>
        <el-form-item :label="t('user.displayName')" prop="display_name">
          <el-input v-model="form.display_name" />
        </el-form-item>
        <el-form-item :label="t('user.password')" prop="password">
          <el-input v-model="form.password" type="password" show-password />
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
import { getUserList, register, deleteUser } from '@/api/user'
import type { UserInfo } from '@/api/user'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const userList = ref<UserInfo[]>([])
const formRef = ref<FormInstance>()
const currentUsername = ref(localStorage.getItem('username') || '')

const form = ref({
  username: '',
  display_name: '',
  password: ''
})

const rules = {
  username: [
    { required: true, message: t('validation.required'), trigger: 'blur' },
    { min: 3, max: 20, message: t('user.lengthLimit3to20'), trigger: 'blur' }
  ],
  display_name: [
    { required: true, message: t('validation.required'), trigger: 'blur' }
  ],
  password: [
    { required: true, message: t('validation.required'), trigger: 'blur' },
    { min: 6, max: 20, message: t('user.lengthLimit6to20'), trigger: 'blur' }
  ]
}

// 格式化日期
const formatDate = (timestamp: number) => {
  if (!timestamp) return '-'
  return new Date(timestamp * 1000).toLocaleString()
}

// 获取用户列表
const fetchUserList = async () => {
  try {
    loading.value = true
    const data = await getUserList() as any
    userList.value = data
  } catch (error) {
    console.error('Failed to fetch users:', error)
  } finally {
    loading.value = false
  }
}

// 添加用户
const handleAdd = () => {
  dialogVisible.value = true
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    try {
      submitLoading.value = true
      await register({
        username: form.value.username,
        display_name: form.value.display_name,
        password: form.value.password
      })
      ElMessage.success(t('user.addSuccess'))
      dialogVisible.value = false
      fetchUserList()
    } catch (error) {
      console.error('Failed to add user:', error)
    } finally {
      submitLoading.value = false
    }
  })
}

// 删除用户
const handleDelete = async (row: UserInfo) => {
  try {
    await ElMessageBox.confirm(
      t('user.deleteUserConfirm', { name: row.display_name }),
      t('common.warning'),
      {
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
        type: 'warning'
      }
    )

    await deleteUser(row.username)
    ElMessage.success(t('common.deleteSuccess'))
    fetchUserList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to delete user:', error)
    }
  }
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

// 页面加载时获取用户列表
onMounted(() => {
  fetchUserList()
})
</script>

<style scoped>
.user-container {
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
