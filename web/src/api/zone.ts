// src/api/zone.ts
import { request } from '@/utils/request'

// 定义接口响应数据类型（根据实际接口调整）
export interface ZoneInfo {
  id: number
  name: string
}

// 获取区域列表
export const getZoneList = () => {
  return request<ZoneInfo[]>({
    url: '/api/zone/list',
    method: 'GET',
  })
}

// 添加区域
export const addZone = (name: string) => {
  return request({
    url: '/api/zone/add',
    method: 'POST',
    data: { name }
  })
}

// 删除区域
export const deleteZone = (id: number) => {
  return request({
    url: '/api/zone/delete',
    method: 'POST',
    data: { id }
  })
}

// 更新区域
export const updateZone = (id: number, name: string) => {
  return request({
    url: '/api/zone/update',
    method: 'POST',
    data: { id, name }
  })
}
