
<template>
  <div class="take-photos-view">
    <!-- 相机预览区 -->
    <div class="camera-container">
      <video v-show="!drawer" id="video" playsinline autoplay></video>
      <el-button class="camera-select" :icon="Refresh" circle @click="nextDevice" />
    </div>

    <!-- 预览抽屉 -->
    <div class="preview-drawer" v-show="drawer">
      <img class="preview-image" ref="imgdrawer"  @click="toggleFullscreen" :src="currentItem?.dataUrl" alt="">
      <div class="preview-info">
        <!-- GPS信息 -->
        <div class="info-section">
          <div class="location-info blur-panel">
            <div class="info-row">纬度: {{currentItem?.gps?.coords?.latitude}}</div>
            <div class="info-row">经度: {{currentItem?.gps?.coords?.longitude}}</div>
          </div>
          <div class="time-info blur-panel">GPS Time: {{currentItem?.gps?.timestamp}}</div>
          <el-button class="fullscreen-btn" type="primary" circle @click="toggleFullscreen">
            <el-icon><FullScreen /></el-icon>
          </el-button>
        </div>

        <div>

        <!-- 缩略图预览 -->
        <div class="thumbnail-section blur-panel">
          <div class="thumbnail-header">待上传列表 ({{images.length}})</div>
          <div class="thumbnail-list">
            <div
              v-for="(image, index) in images"
              :key="index"
              class="thumbnail-item"
              @click="openPreview(image)"
            >
              <img :src="image.dataUrl" alt="photo" class="thumbnail-image">
            </div>
          </div>
        </div>


        <!-- 标签选择区 -->
        <div class="tags-container blur-panel">
          <div v-for="(label, index) in labels" :key="index" class="tag-item">
            <el-check-tag
              :checked="label.checked"
              @change="(status)=>handleLabelChange(label,status)"
            >
              {{ label.checked ? '✓' : '' }} {{label.label}}
            </el-check-tag>
          </div>
        </div>

        <!-- 预览操作按钮组 -->
        <div class="preview-action-buttons blur-panel">
          <el-popconfirm title="确认删除?" @confirm="deleteItem">
            <template #reference>
              <el-button class="preview-btn" type="danger" round size="small">
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </template>
          </el-popconfirm>

          <el-button
            class="preview-btn"
            type="success"
            round
            size="small"
            @click="submitUpload"
            :loading="uploadStatus.isUploading"
          >
            <el-icon><Upload /></el-icon>
            {{ uploadStatus.isUploading ? '上传中...' : '上传' }}
          </el-button>

          <el-button
            class="preview-btn"
            type="info"
            round
            size="small"
            @click="drawer = false"
          >
            <el-icon><Back /></el-icon>
            返回
          </el-button>
        </div>
      </div>
      </div>
    </div>

    <!-- 底部控制区 -->
    <div class="bottom-controls">
      <!-- 缩略图预览 -->
      <div class="thumbnail-section">
        <div class="thumbnail-header">待上传列表 ({{images.length}})</div>
        <div class="thumbnail-list">
          <div
            v-for="(image, index) in images"
            :key="index"
            class="thumbnail-item"
            @click="openPreview(image)"
          >
            <img :src="image.dataUrl" alt="photo" class="thumbnail-image">
          </div>
        </div>
      </div>

      <!-- 操作按钮组 -->
      <div class="action-buttons">
        <el-button
          class="action-btn camera-btn"
          type="danger"
          round
          size="large"
          @click="takePhoto"
        >
          <el-icon><Camera /></el-icon>
          拍照
        </el-button>

        <el-upload
          ref="upload"
          :show-file-list="false"
          class="action-btn select-btn"
          accept="image/jpeg, image/png, image/gif, image/*"
          action=""
          :limit="1"
          @change="handleFileChange"
          :auto-upload="false"
        >
          <template #trigger>
            <el-button type="primary" round size="large">
              <el-icon><Picture /></el-icon>
              选择照片
            </el-button>
          </template>
        </el-upload>
      </div>

      <!-- 上传进度 -->
      <div v-if="uploadStatus.isUploading" class="upload-progress">
        <el-progress
          :percentage="Math.floor((uploadStatus.current / uploadStatus.total) * 100)"
          :format="format"
          :stroke-width="8"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, toRaw, watch, type Ref } from "vue";
import { v4 as uuidv4 } from 'uuid';
import localforage from "localforage";
import { blobToDataURL } from "@/utils/dataUrlTools";
import { usePhotoStore } from "@/stores/photo.ts"
import { ElMessage } from "element-plus";
import { getLabelList, type LabelInfo } from '@/api/label';
import { Refresh, Camera, Upload, Picture, Delete, Back, FullScreen } from '@element-plus/icons-vue'

import { genFileId } from 'element-plus'
import type { UploadInstance, UploadProps, UploadRawFile } from 'element-plus'
import { uploadFile } from "@/api/uploadFile";
import { useRouter } from "vue-router";

// 格式化进度显示
const format = (percentage: number) => {
  return `${uploadStatus.value.current}/${uploadStatus.value.total} (${percentage}%)`
}

function nextDevice(){
  if (currentCamera.value) {
    const index = cameraList.value.findIndex(item => item.value === currentCamera.value.value);
    if (index !== -1) {
      if (index === cameraList.value.length - 1) {
        currentCamera.value = cameraList.value[0];
      } else {
        currentCamera.value = cameraList.value[index + 1];
     }
    }
  }
}

const imgdrawer = ref<HTMLImageElement | null>(null)

const drawer = ref(false)
const currentItem = ref<ItemStruct | null>(null);
// 配置存储
const imageStore = localforage.createInstance({
  driver: localforage.INDEXEDDB,
  name: 'image-storage',
  storeName: 'images'
});
localforage.setDriver(localforage.INDEXEDDB);
type ItemStruct = {
  id: string;
  dataUrl: string;
  gps?: {
    coords?:{
      latitude?: number | null;
      longitude?: number | null;
    },
    timestamp?: number|null;
    accuracy?: number | null;

  };
  shotTime: number;
  labels?: string[];
  retryCount?: number;
};
// 图片列表
const images = ref<ItemStruct[]>([]);
// 获取数据库数据
imageStore.iterate((value, key, iterationNumber) => {
  console.log(value, key, iterationNumber);
  if (value) {
    images.value.push(value as ItemStruct);
  }
});
// 获取所有标签
const labels:Ref<LabelInfo[]> = ref([])
onMounted(async () => {
  const res = await getLabelList()
  labels.value = res
})
const photoStore = usePhotoStore()
const currentCamera = ref()
const cameraList: Ref<{
  label: string;
  value: string;
  deviceInfo: MediaDeviceInfo;
}[]> = ref([])
async function getDevices() {
  try {
    console.log('开始获取摄像头设备...');
    // 检查mediaDevices API是否可用
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      console.log('mediaDevices API不可用:', {
        mediaDevices: !!navigator.mediaDevices,
        enumerateDevices: !!(navigator.mediaDevices && navigator.mediaDevices.enumerateDevices)
      });
      throw new Error('浏览器不支持mediaDevices API');
    }

    console.log('请求摄像头权限...');
    // 先请求摄像头权限
    await navigator.mediaDevices.getUserMedia({ video: true });
    console.log('摄像头权限获取成功');

    // 然后枚举设备
    console.log('开始枚举设备...');
    const devices = await navigator.mediaDevices.enumerateDevices();
    console.log('枚举到的所有设备:', devices);
    gotDevices(devices);
  } catch (error) {
    console.error('获取摄像头失败:', error);
    handleError(error);
    ElMessage.error('获取摄像头失败，请确保已授予摄像头权限');
  }
}
getDevices()

// 在mounted时调用
onMounted(() => {
  getDevices();
});

watch(currentCamera, (newValue, oldValue) => {
  if (newValue) {
    const videoDom = document.getElementById('video') as any
    // 停止旧的流
    if (videoDom&& videoDom.srcObject) {
      const tracks = videoDom.srcObject.getTracks()
      for (let i = 0; i !== tracks.length; ++i) {
        tracks[i].stop();
      }
    }
    // 获取摄像头
    navigator.mediaDevices.getUserMedia({
      video: {
        deviceId: newValue.deviceInfo.deviceId
      }
    }).then(function (stream) {
      const videoDom = document.getElementById('video') as any
      videoDom.srcObject = stream;
    }).catch(handleError);
  }
})
function openPreview(image: ItemStruct) {
  drawer.value = true;
  // 把label的checked设置为false
  // 重置所有标签的选中状态
  labels.value.forEach(label => {
    label.checked = image?.labels?.includes(label.label) || false;
  });

  if (!image?.labels) {
    image.labels = []
  } else {
    image.labels = labels.value.filter(label => label.checked).map(label => label.label)
    // 将数据更新并存回缓存
    imageStore.setItem(image.id.toString(), toRaw(image)).then(() => {
      currentItem.value = toRaw(image) as unknown as ItemStruct
      drawer.value = true
    }).catch((error:any) => {
      console.error(error);
    });
  }
}

function gotDevices(deviceInfos:MediaDeviceInfo[]) {
  console.log('开始处理设备列表...');
  // 从中找到后置摄像头放进cameraList中
  for (let i = 0; i !== deviceInfos.length; ++i) {
    const deviceInfo = deviceInfos[i];
    console.log('检查设备:', {
      kind: deviceInfo.kind,
      label: deviceInfo.label,
      deviceId: deviceInfo.deviceId
    });

    // 修改判断逻辑，适配iOS设备
    if (deviceInfo.kind === 'videoinput') {
      // 不再仅仅检查'back'关键字
      const isBackCamera = deviceInfo.label.toLowerCase().includes('back') ||
                         deviceInfo.label.toLowerCase().includes('后置') ||
                         deviceInfo.label.toLowerCase().includes('rear');

      if (isBackCamera) {
        console.log('找到后置摄像头:', deviceInfo.label);
        cameraList.value.push({
          label: deviceInfo.label || `camera ${cameraList.value.length + 1}`,
          value: deviceInfo.deviceId,
          deviceInfo: deviceInfo
        });
      }
    }
  }

  // 如果没有找到后置摄像头，就添加所有视频输入设备
  if (cameraList.value.length === 0) {
    console.log('未找到后置摄像头，添加所有视频输入设备');
    for (let i = 0; i !== deviceInfos.length; ++i) {
      const deviceInfo = deviceInfos[i];
      if (deviceInfo.kind === 'videoinput') {
        console.log('添加视频输入设备:', deviceInfo.label);
        cameraList.value.push({
          label: deviceInfo.label || `camera ${cameraList.value.length + 1}`,
          value: deviceInfo.deviceId,
          deviceInfo: deviceInfo
        });
      }
    }
  }

  console.log('最终的摄像头列表:', cameraList.value);

  // 默认选中第一个摄像头
  if (cameraList.value.length > 0) {
    currentCamera.value = cameraList.value[0];
    console.log('已选择默认摄像头:', currentCamera.value);
  } else {
    console.log('警告: 未找到任何可用的摄像头设备');
  }
}
function handleError(error: any) {
  console.log('navigator.MediaDevices.getUserMedia error: ', error.message, error.name);
  console.error('摄像头错误详情:', {
    message: error.message,
    name: error.name,
    stack: error.stack
  });
}

function takePhoto() {
  if (drawer.value) {
    drawer.value = false
    currentCamera.value = null
    return
  }
  const videoDom = document.getElementById('video') as any
  if (videoDom && videoDom.srcObject) {
    // 获取视频流
    const videoTrack = videoDom?.srcObject?.getVideoTracks()[0]
    if (videoTrack) {
      // @ts-ignore
      let capture = new ImageCapture(videoTrack)
      const id = uuidv4()
      capture.takePhoto().then(async (blob: Blob) => {
        const dataUrl = await blobToDataURL(blob)

        // 图片二进制数据
        const image = {
          id,
          dataUrl,
          gps: {
            accuracy: photoStore.gps.accuracy,
            coords: {
              latitude: photoStore.gps.coords.latitude,
              longitude: photoStore.gps.coords.longitude,
            },
            timestamp: photoStore.gps.timestamp,
          },
          shotTime: Date.now(),
          labels: [],
        }

        // 存储图片到数据库
        imageStore.setItem(image.id.toString(), image).then(() => {
          console.log('Image stored successfully');
          ElMessage({
            message: '照片已保存',
            type: 'success',
          })
          images.value.push(image);
          currentItem.value = image
          drawer.value = true
        }).catch((error:any) => {
          ElMessage({
            message:'保存照片失败:'+ error.message,
            type: 'error',
          })
        });
      })
      .catch((error:any) => {
        console.error("takePhoto() error: ", error);
      });
    }
  }
}

// 从缓存中删除
function deleteItem() {
  console.log(currentItem.value);
  if (currentItem.value) {
    imageStore.removeItem(currentItem.value.id.toString()).then(() => {
      console.log('Image removed successfully');
      // 从images 中删除
      const index = images.value.findIndex(item => item.id === currentItem.value?.id);
      if (index !== -1) {
        images.value.splice(index, 1);
      }
      ElMessage({
        message: '照片已删除',
        type: 'success',
      })
      drawer.value = false
   }).catch((error) => {
     ElMessage.error('删除照片失败:', error)
   }).finally(()=>{
    drawer.value = false
   })
  }
}

const router = useRouter()

const handleFileChange: UploadProps['onChange'] = async (file) => {
  // 将文件转成ItemStruct添加进数据库
  if (file.raw) {
    const id = uuidv4()
    const image:ItemStruct = {
      id,
      dataUrl: await blobToDataURL(file.raw),
      gps: {
        accuracy: photoStore.gps.accuracy,
        coords: {
          latitude: photoStore.gps.coords.latitude,
          longitude: photoStore.gps.coords.longitude,
        },
        timestamp: photoStore.gps.timestamp,
     },
      shotTime: Date.now(),
    }
    imageStore.setItem(id, image)
    images.value.push(image);
    currentItem.value = image
    drawer.value = true
  }
}

const upload = ref<UploadInstance | null>(null);
const handleExceed = (files: UploadRawFile[], fileList: UploadRawFile[]) => {
  upload.value!.clearFiles()
  const file = files[0] as UploadRawFile
  file.uid = genFileId()
  upload.value!.handleStart(file)
};

// 上传状态管理
const uploadStatus = ref({
  isUploading: false,
  current: 0,
  total: 0,
  success: 0,
  failed: 0
})

const submitUpload = async () => {
  if (images.value.length === 0) {
    ElMessage.warning('没有待上传的图片')
    return
  }

  // 初始化上传状态
  uploadStatus.value = {
    isUploading: true,
    current: 0,
    total: images.value.length,
    success: 0,
    failed: 0
  }

  // 从store中获取name_token和zone_id
  const name_token = localStorage.getItem('name_token') || '';
  if (name_token === '') {
    ElMessage.warning('获取name_token失败，请从邀请链接访问。');
    return
  }
  const zoneId = router.currentRoute.value.params.zoneId as string;

  // 创建上传队列
  const uploadQueue = [...images.value];

  while (uploadQueue.length > 0 && uploadStatus.value.isUploading) {
    const image = uploadQueue.shift();
    if (!image) continue;

    uploadStatus.value.current++;

    try {
      // 将base64转换为File对象
      const response = await fetch(image.dataUrl);
      const blob = await response.blob();
      const file = new File([blob], `photo_${image.shotTime}.jpg`, { type: 'image/jpeg' });

      // 准备labels字符串
      const labelsStr = (image.labels || []).join(',');

      // 上传文件
      await uploadFile(name_token, zoneId, file, labelsStr);

      // 上传成功后从本地存储中删除
      await imageStore.removeItem(image.id.toString());

      // 从images数组中移除
      const index = images.value.findIndex(item => item.id === image.id);
      if (index !== -1) {
        images.value.splice(index, 1);
      }

      uploadStatus.value.success++;

    } catch (error: any) {
      uploadStatus.value.failed++;
      ElMessage.error(`图片 ${uploadStatus.value.current}/${uploadStatus.value.total} 上传失败: ${error.message}`);
      // 将失败的图片放回队列末尾，最多重试3次
      if (!image.retryCount || image.retryCount < 3) {
        image.retryCount = (image.retryCount || 0) + 1;
        uploadQueue.push(image);
      }
    }
  }

  // 上传完成
  uploadStatus.value.isUploading = false;

  if (uploadStatus.value.success > 0) {
    ElMessage.success(`上传完成！成功：${uploadStatus.value.success}，失败：${uploadStatus.value.failed}`);
  }

  // 关闭预览窗口
  drawer.value = false;
}

// 处理标签变更
const handleLabelChange = async (label: LabelInfo, status: boolean) => {
  label.checked = status;
  label = toRaw(label)
  if (!label) {
    return
  }
  if (currentItem.value) {
    // 更新currentItem的labels
    currentItem.value.labels = labels.value
      .filter(l => l.checked)
      .map(l => l.label);
    try {
      const id = currentItem.value.id.toString()
      const data =  toRaw(currentItem.value)

      // 保存到数据库
      await imageStore.setItem(id, data);

      // 更新images数组中对应的item
      const index = images.value.findIndex(item => item.id === currentItem.value?.id);
      if (index !== -1) {
        images.value[index] = currentItem.value!;
      }
    } catch (error) {
      console.log(error);
      ElMessage.error('标签更新失败: ' + error);
    }
  }
}

function toggleFullscreen() {
  const img = imgdrawer.value;
  if (!img) return;

  if (!document.fullscreenElement) {
    img.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}

</script>

<style scoped>
.take-photos-view {
  width: 100%;
  height: 100vh;
  background-color: #000;
  position: relative;
  overflow: hidden;
}

/* 相机预览区 */
.camera-container {
  width: 100%;
  height: 100%;
  position: relative;
}

#video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  background-color: #1a1a1a;
}

/* 相机切换按钮 */
.camera-select {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 999;
  width: 48px;
  height: 48px;
  background: rgba(255,255,255,0.2);
  border: none;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.camera-select:active {
  transform: scale(0.95);
  background: rgba(255,255,255,0.3);
}

/* 预览抽屉 */
.preview-drawer {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #000;
  z-index: 1000;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.preview-info {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-sizing: border-box;
}

/* 信息面板 */
.blur-panel {
  background: rgba(255,255,255,0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 12px 16px;
  color: #fff;
  margin-bottom: 12px;
}

.info-section {
  margin-bottom: 20px;
}

.info-row {
  font-size: 14px;
  margin: 4px 0;
}

/* 标签容器 */
.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}
/* 预览操作按钮组 */
.preview-action-buttons {
  display: flex;
  justify-content: space-around;
  align-items: center;
  gap: 12px;
  padding: 12px;
}

.preview-btn {
  flex: 1;
  height: 44px;
  font-size: 16px;
}

.preview-btn :deep(.el-icon) {
  margin-right: 4px;
  font-size: 18px;
}

.tag-item :deep(.el-check-tag) {
  background: rgba(255,255,255,0.15);
  border: none;
  color: #fff;
  border-radius: 20px;
  padding: 6px 12px;
  transition: all 0.3s;
}

.tag-item :deep(.el-check-tag.is-checked) {
  background: rgba(64,158,255,0.25);
}

/* 底部控制区 */
.bottom-controls {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 20px;
  background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%);
  z-index: 999;
  box-sizing: border-box;
}

/* 缩略图区域 */
.thumbnail-section {
  margin-bottom: 20px;
}

.thumbnail-header {
  color: #fff;
  font-size: 14px;
  margin-bottom: 12px;
  padding-left: 4px;
}

.thumbnail-list {
  display: flex;
  overflow-x: auto;
  gap: 12px;
  padding: 4px;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}

.thumbnail-list::-webkit-scrollbar {
  display: none;
}

.thumbnail-item {
  flex: 0 0 auto;
  width: 80px;
  height: 80px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  transition: transform 0.3s;
}

.thumbnail-item:active {
  transform: scale(0.95);
}

.thumbnail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 操作按钮组 */
.action-buttons {
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin-bottom: 20px;
}

.action-btn {
  min-width: 100px;
}

.action-btn :deep(.el-icon) {
  margin-right: 4px;
  font-size: 18px;
}

/* 上传进度 */
.upload-progress {
  background: rgba(0,0,0,0.8);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 16px;
  margin: 0 20px;
}

:deep(.el-progress-bar__outer) {
  background-color: rgba(255,255,255,0.1) !important;
}

:deep(.el-progress-bar__inner) {
  background: linear-gradient(90deg, #2ed573 0%, #7bed9f 100%);
}

:deep(.el-progress__text) {
  color: #fff !important;
}


.time-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.fullscreen-btn {
  width: 32px;
  height: 32px;
  padding: 6px;
  background: rgba(255,255,255,0.2);
  border: none;
}

.fullscreen-btn:hover {
  background: rgba(255,255,255,0.3);
}

</style>
