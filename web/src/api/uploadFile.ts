import request from "@/utils/request"

/**
 * 上传文件到服务器
 * @param name_token 用户身份令牌
 * @param zone_id 区域ID
 * @param file 要上传的文件对象
 * @param labels 文件标签 是逗号分隔的字符串
 * @returns Promise 包含上传响应结果
 */
export function uploadFile(name_token: string,zone_id: string,file: File,labels: string ):any {
  const data = new FormData()
  data.append('name_token', name_token)
  data.append('zone_id', zone_id)
  data.append('file', file)
  data.append('labels', labels)
  // 这是axios的请求
  return request({
    url: '/api/upload',
    method: 'post',
    data,
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}
