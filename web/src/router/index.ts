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
        },
        {
          path: 'task',
          name: 'TaskAssignment',
          component: () => import('@/views/admin/task/index.vue'),
          meta: {
            title: '分派任务',
            requiresAuth: true
          }
        }
      ]
    },
    {
      path: '/',
      redirect: '/admin'
    },
    {
      path: '/zone/:zoneId',
      name: 'zone-zoneId',
      component: () => import('../views/ZoneView.vue'),
    },
    {
      path: '/zone',
      name: 'zone',
      component: () => import('../views/ZoneView.vue'),
    },
    {
      path: '/takePhoto/:zoneId',
      name: 'takePhoto-zoneId',
      component: () => import('../views/TakePhotosView.vue'),
    }
  ]
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 处理name_token参数
  if (to.query.name_token) {
    // 存储name_token到localStorage
    localStorage.setItem('name_token', to.query.name_token as string)

    // 创建新的query对象，移除name_token
    const query = { ...to.query }
    delete query.name_token

    // 重定向到相同路径但没有name_token参数的URL
    next({ path: to.path, query })
    return
  }

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
