import request from '@/utils/request'

export interface LoginData {
  username: string
  password: string
  display_name: string
}
interface SignNameResponse {
  success: boolean
  message: string
  token: string
}
export interface UserInfo {
  username: string
  display_name: string
  last_login: number
}

export function login(data: LoginData) {
  return request({
    url: '/api/user/login',
    method: 'post',
    data
  })
}

export function register(data: LoginData) {
  return request({
    url: '/api/user/register',
    method: 'post',
    data
  })
}

export function getUserList() {
  return request({
    url: '/api/user/list',
    method: 'get'
  })
}

export function deleteUser(target_username: string) {
  return request({
    url: '/api/user/delete',
    method: 'post',
    data: { target_username }
  })
}

// 新增签名接口
export function signName(name: string): Promise<SignNameResponse> {
  return request({
    url: '/api/user/sign-name',
    method: 'post',
    data: { name }
  })
}
