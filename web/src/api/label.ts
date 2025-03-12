// src/api/label.ts
import { request } from '@/utils/request'

// 定义接口响应数据类型
export interface LabelInfo {
  id: number
  label: string
  checked?: boolean // 方便前端判断是否选中使用（接口不会返回）
}

// 获取标签列表
export const getLabelList = () => {
  return request<LabelInfo[]>({
    url: '/api/label/list',
    method: 'get'
  })
}

// 添加标签
export const addLabel = (label: string) => {
  return request({
    url: '/api/label/add',
    method: 'post',
    data: { label }
  })
}

// 删除标签
export const deleteLabel = (id: number) => {
  return request({
    url: '/api/label/delete',
    method: 'post',
    data: { id }
  })
}

// 更新标签
export const updateLabel = (id: number, label: string) => {
  return request({
    url: '/api/label/update',
    method: 'post',
    data: { id, label }
  })
}
