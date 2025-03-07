// src/utils/request.ts
import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'

// 定义响应数据的基础结构（根据后端接口规范调整）
interface ResponseData<T = any> {
  success: boolean
  data: T
  message: string
}

// 创建 axios 实例
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // 从环境变量读取基地址
  timeout: 10000, // 超时时间
  headers: { 'Content-Type': 'application/json;charset=utf-8' }
})

// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => { // 修改类型声明
    const token = localStorage.getItem('token')
    if (token) {
      config.headers = config.headers || {} // 确保 headers 存在
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse<ResponseData>) => {
    // 2xx 状态码触发
    const res = response.data

    // 根据业务状态码处理（示例：200 表示成功）
    if (res.success === true) {
      return res.data
    } else {
      // 处理其他状态码（如 token 过期）
      if (res.success === false) {
        console.error(res.message);
      }
      return Promise.reject(new Error(res.message || 'Error'))
    }
  },
  (error) => {
    // 超出 2xx 状态码触发
    const message = error.response?.data?.message || error.message
    return Promise.reject(new Error(message))
  }
)

// 封装通用请求函数
export function request<T = any>(config: AxiosRequestConfig): Promise<T> {
  return service(config)
}

// 可选：导出原始实例用于特殊需求
export const http = service
