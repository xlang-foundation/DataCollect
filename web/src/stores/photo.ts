import { ref } from 'vue'
import { defineStore } from 'pinia'

export const usePhotoStore = defineStore('photo', () => {
  // 新增的GPS状态变量
  const gps = ref<{
    accuracy: number | null
    coords: {
      latitude: number | null
      longitude: number | null
    }
    timestamp: number | null
    error?: string
  }>({
    accuracy: null,
    coords: {
      latitude: null,
      longitude: null,
    },
    timestamp: null
  })

  // 新增的独立GPS更新函数
  function fetchCurrentGPS() {
    return new Promise<void>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          gps.value = {
            accuracy: position.coords.accuracy,
            coords: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            },
            timestamp: position.timestamp
          }
          resolve()
        },
        (error) => {
          gps.value.error = error.message
          reject(error)
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 1000
        }
      )
    })
  }

  return {
    gps,        // 暴露GPS状态
    fetchCurrentGPS,  // 暴露独立GPS获取方法
  }
})
