// src/api/user.ts
import { request } from '@/utils/request'

export interface UserInfo {
  username: string
  display_name: string
  last_login: number
}

export interface LoginResponse {
  success: boolean
  message: string
  token: string
  username: string
  display_name: string
}

// 登录
export function login(username: string, password: string): Promise<LoginResponse> {
  return request({
    url: '/api/user/login',
    method: 'post',
    data: {
      username,
      password
    }
  })
}

// 获取用户列表
export function getUserList(): Promise<UserInfo[]> {
  return request({
    url: '/api/user/list',
    method: 'get'
  })
}

// 添加用户
export function register(username: string, password: string, display_name: string): Promise<any> {
  return request({
    url: '/api/user/register',
    method: 'post',
    data: {
      username,
      password,
      display_name
    }
  })
}

// 删除用户
export function deleteUser(username: string): Promise<any> {
  return request({
    url: '/api/user/delete',
    method: 'post',
    data: {
      target_username: username
    }
  })
}
