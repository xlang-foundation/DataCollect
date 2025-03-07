// src/api/zone.ts
import { request } from '@/utils/request'

// 定义接口响应数据类型（根据实际接口调整）
export interface LabelInfo {
  id: number
  label: string
  checked?: boolean
}

// 获取区域列表
export const getLabelList = () => {
  return request<LabelInfo[]>({
    url: '/api/label/list',
    method: 'GET',
  })
}
