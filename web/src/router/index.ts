// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/layout/index.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/admin/login',
      name: 'AdminLogin',
      component: () => import('@/views/admin/login/index.vue'),
      meta: {
        title: '登录',
        requiresAuth: false
      }
    },
    {
      path: '/admin',
      component: Layout,
      redirect: '/admin/user',
      children: [
        {
          path: 'user',
          name: 'UserManagement',
          component: () => import('@/views/admin/user/index.vue'),
          meta: {
            title: '用户管理',
            requiresAuth: true
          }
        },
        {
          path: 'zone',
          name: 'ZoneManagement',
          component: () => import('@/views/admin/zone/index.vue'),
          meta: {
            title: '区域管理',
            requiresAuth: true
          }
        },
        {
          path: 'label',
          name: 'LabelManagement',
          component: () => import('@/views/admin/label/index.vue'),
          meta: {
            title: '标签管理',
            requiresAuth: true
          }
        }
      ]
    },
    {
      path: '/',
      redirect: '/admin'
    }
  ]
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = `${to.meta.title || '管理系统'}`

  // 检查是否需要登录权限
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // 检查是否已登录
    const token = localStorage.getItem('token')
    if (!token) {
      next({
        path: '/admin/login',
        query: { redirect: to.fullPath }
      })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
