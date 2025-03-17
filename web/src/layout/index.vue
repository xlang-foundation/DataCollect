<!-- src/layout/index.vue -->
<template>
  <el-container class="layout-container">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '64px' : '200px'" class="aside">
      <div class="logo" :class="{ 'logo-collapse': isCollapse }">
        {{ isCollapse ? '系统' : '数据采集系统' }}
      </div>
      <el-menu
        :default-active="activeMenu"
        class="menu"
        router
        :collapse="isCollapse"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
      >
        <el-menu-item index="/admin/user">
          <el-icon><User /></el-icon>
          <template #title>用户管理</template>
        </el-menu-item>
        <el-menu-item index="/admin/zone">
          <el-icon><Location /></el-icon>
          <template #title>区域管理</template>
        </el-menu-item>
        <el-menu-item index="/admin/label">
          <el-icon><Collection /></el-icon>
          <template #title>标签管理</template>
        </el-menu-item>
        <el-menu-item index="/admin/task">
          <el-icon><Share /></el-icon>
          <template #title>分派任务</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <!-- 顶部导航 -->
      <el-header class="header">
        <div class="header-left">
          <el-icon
            class="toggle-button"
            @click="toggleSidebar"
          >
            <component :is="isCollapse ? 'Expand' : 'Fold'" />
          </el-icon>
        </div>
        <div class="header-right">
          <span class="welcome">欢迎，{{ displayName }}</span>
          <el-button type="text" @click="handleLogout">退出登录</el-button>
        </div>
      </el-header>

      <!-- 主内容区 -->
      <el-main class="main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { User, Location, Collection, Share, Expand, Fold } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'

const router = useRouter()
const route = useRoute()

// 控制侧边栏折叠状态
const isCollapse = ref(window.innerWidth <= 768)

// 当前用户显示名称
const displayName = ref(localStorage.getItem('display_name') || '')

// 当前激活的菜单项
const activeMenu = computed(() => route.path)

// 切换侧边栏
const toggleSidebar = () => {
  isCollapse.value = !isCollapse.value
}

// 监听窗口大小变化
window.addEventListener('resize', () => {
  if (window.innerWidth <= 768) {
    isCollapse.value = true
  }
})

// 退出登录
const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    // 清除本地存储的用户信息
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    localStorage.removeItem('display_name')

    // 跳转到登录页
    router.push('/admin/login')
  } catch {
    // 取消退出
  }
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.aside {
  background-color: #304156;
  color: #fff;
  transition: width 0.3s;
  overflow: hidden;
}

.logo {
  height: 60px;
  line-height: 60px;
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  color: #fff;
  background-color: #2b2f3a;
  transition: all 0.3s;
  overflow: hidden;
  white-space: nowrap;
}

.logo-collapse {
  font-size: 14px;
}

.menu {
  border-right: none;
}

.header {
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
}

.toggle-button {
  font-size: 20px;
  cursor: pointer;
  color: #606266;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.welcome {
  font-size: 14px;
  color: #606266;
}

.main {
  background-color: #f0f2f5;
  padding: 20px;
}

/* 响应式布局 */
@media screen and (max-width: 768px) {
  .welcome {
    display: none;
  }

  .header {
    padding: 0 10px;
  }

  .main {
    padding: 10px;
  }
}
</style>
