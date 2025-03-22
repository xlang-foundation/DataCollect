
import request from '@/utils/request'

// 上报错误信息
export function reportError(error: string, stack: string) {
  return request({
    url: '/api/error/report',
    method: 'post',
    data: {
      error,
      stack,
      ua: window.navigator.userAgent
    }
  })
}
