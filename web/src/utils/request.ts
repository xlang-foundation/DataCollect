// src/utils/request.ts
import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

// 定义响应数据的接口
interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  users?: T // 用户列表接口特殊处理
}

// 创建 axios 实例
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers = config.headers || {}
      config.headers['x-token'] = token
    }
    return config
  },
  (error) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const res = response.data

    // 如果请求成功
    if (res.success === true) {
      // 返回数据，优先返回data字段，对用户列表接口特殊处理
      if (res.data !== undefined) {
        return res.data
      }
      if (res.users !== undefined) {
        return res.users
      }
      return res
    }

    // 处理错误情况
    ElMessage.error(res.message || 'Error')

    // 处理特定错误
    if (res.message === 'Admin authentication failed') {
      ElMessage.error('需要管理员权限')
      return Promise.reject(new Error('需要管理员权限'))
    }

    // 只有在token相关错误时才清除token并跳转
    if (res.message === 'Token verification failed' || res.message === 'Token is missing') {
      localStorage.removeItem('token')
      router.push('/admin/login')
      return Promise.reject(new Error('登录已过期，请重新登录'))
    }

    return Promise.reject(new Error(res.message || 'Error'))
  },
  (error) => {
    console.error('Response error:', error)

    // 处理网络错误
    const message = error.response?.data?.message || error.message || '请求失败'
    ElMessage.error(message)

    // 处理 401 未授权错误
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      router.push('/admin/login')
    }

    return Promise.reject(error)
  }
)

// 封装请求方法
export function request<T = any>(config: AxiosRequestConfig): Promise<T> {
  return service(config)
}

export default service
