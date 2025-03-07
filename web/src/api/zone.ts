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
