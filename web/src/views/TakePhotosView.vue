<template>
  <div class="take-photos-view">
    <video v-show="!drawer" id="video" playsinline autoplay></video>
    <div class="imgdrawer-box" v-show="drawer">
      <img class="imgdrawer" ref="imgdrawer" :src="currentItem?.dataUrl" alt="">
      <div class="img-info">

        <div class="location blur-background">
          <div>纬度:{{currentItem?.gps?.coords?.latitude}}</div>
          <div>经度:{{currentItem?.gps?.coords?.longitude}}</div>
        </div>
        <div class="time blur-background">GPS Time:{{currentItem?.gps?.timestamp}}</div>
        <div  style="
          gap: 2px;
          margin-top: 1em;
          display: flex;
          flex-wrap: wrap;"
        >
          <div v-for="(label, index) in labels" :key="index">
            <el-check-tag :checked="label.checked" @change="(status)=>{
              handleLabelChange(label,status)
            }">
              {{ label.checked ? '✅' : '' }}
              {{label.label}}
            </el-check-tag>
          </div>
        </div>
        <el-popconfirm title="确认删除?" @confirm="deleteItem">
          <template #reference>
            <el-button class="delete-item" type="danger">删除</el-button>
          </template>
        </el-popconfirm>

      </div>

    </div>


    <el-button class="camera-select" :icon="Refresh" circle @click="nextDevice" />
    <!-- 在网页底部居中添加一个拍照按钮 -->
      <el-button
        class="shot-btn"
        type="danger"
        @click="takePhoto"
      >
        拍照
      </el-button>

      <el-button
        class="upload-btn"
        type="success"
        @click="submitUpload"
      >
        上传
      </el-button>
      <el-upload
        ref="upload"
        :show-file-list="false"
        class="select-from-phone-btn"
        accept="image/jpeg, image/png, image/gif, image/*"
        action=""
        :limit="1"
        @change="handleFileChange"
        :auto-upload="false"
      >
        <template #trigger>
          <el-button type="primary">从手机中选择</el-button>
        </template>
      </el-upload>
    <!-- 添加一个按钮跳转到列表页 -->
      <!-- <el-button
        class="list-btn"
        type="primary"
        @click="()=>{
          $router.push({
            path: '/photoList'
          })

        }"
      >
        相册
      </el-button> -->

    <p style="padding-left: 8px;">待上传列表: </p>
    <div class="grid-container">
      <div
        v-for="(image, index) in images"
        :key="index"
        class="grid-item"
        @click="openPreview(image)"
      >
        <div class="image-wrapper">
          <img
            :src="image.dataUrl"
            alt="photo"
            class="square-image"
          >
        </div>
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
import { Refresh } from '@element-plus/icons-vue'
import { genFileId } from 'element-plus'
import type { UploadInstance, UploadProps, UploadRawFile } from 'element-plus'
import { uploadFile } from "@/api/uploadFile";
import { useRouter } from "vue-router";

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
    // 检查mediaDevices API是否可用
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      throw new Error('浏览器不支持mediaDevices API');
    }

    // 先请求摄像头权限
    await navigator.mediaDevices.getUserMedia({ video: true });

    // 然后枚举设备
    const devices = await navigator.mediaDevices.enumerateDevices();
    gotDevices(devices);
  } catch (error) {
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
      // 将流赋值给video
      // if (video.value !== null) {
      //   video.value.srcObject = stream;
      // }
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

  // 从中找到后置摄像头放进cameraList中
  for (let i = 0; i !== deviceInfos.length; ++i) {
    const deviceInfo = deviceInfos[i];
    if (deviceInfo.kind === 'videoinput' && deviceInfo.label.includes('back')) {
      cameraList.value.push({
        label: deviceInfo.label || `camera ${cameraList.value.length + 1}`,
        value: deviceInfo.deviceId,
        deviceInfo: deviceInfo
      });
    }
  }
  // 如果没有后置摄像头，就还是找到所有摄像头
  if (currentCamera.value && currentCamera.value.length === 0) {
    for (let i = 0; i !== deviceInfos.length; ++i) {
      const deviceInfo = deviceInfos[i];
      if (deviceInfo.kind === 'videoinput') {
        cameraList.value.push({
          label: deviceInfo.label || `camera ${cameraList.value.length + 1}`,
          value: deviceInfo.deviceId,
          deviceInfo: deviceInfo
        });
      }
    }
  }
  console.log(cameraList.value);

  // 默认选中第一个摄像头
  currentCamera.value = cameraList.value[0];
}
function handleError(error: { message: any; name: any; }) {
  console.log('navigator.MediaDevices.getUserMedia error: ', error.message, error.name);
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
            message: 'mage stored successfully',
            type: 'success',
          })
          images.value.push(image);
          currentItem.value = image
          drawer.value = true
        }).catch((error:any) => {
          ElMessage({
            message:'Error storing image:'+ error.message,
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
      // element-plus提示删除成功

      ElMessage({
        message: 'Image removed successfully',
        type: 'success',
      })
      drawer.value = false
   }).catch((error) => {
     ElMessage.error('Error removing image:', error)
   }).finally(()=>{
    drawer.value = false
   })
  }
}


const router = useRouter()

const  handleFileChange: UploadProps['onChange'] = async (file) => {
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
const submitUpload = async () => {
  if (images.value.length === 0) {
    ElMessage.warning('没有待上传的图片')
    return
  }

  try {
    for (const image of images.value) {
      // 将base64转换为File对象
      const response = await fetch(image.dataUrl);
      const blob = await response.blob();
      const file = new File([blob], `photo_${image.shotTime}.jpg`, { type: 'image/jpeg' });

      // 准备labels字符串
      const labelsStr = (image.labels || []).join(',');

      // 从store中获取name_token和zone_id
      const name_token = localStorage.getItem('name_token') || '';
      if (name_token === '') {
        ElMessage.warning('获取name_token失败，请从邀请链接访问。');
        return
      }
      const zoneId = router.currentRoute.value.params.zoneId as string;

      try {
        // 上传文件
        await uploadFile(name_token, zoneId, file, labelsStr);

        // 上传成功后从本地存储中删除
        await imageStore.removeItem(image.id.toString());

        // 从images数组中移除
        const index = images.value.findIndex(item => item.id === image.id);
        if (index !== -1) {
          images.value.splice(index, 1);
        }

        ElMessage.success('上传成功');
      } catch (error: any) {
        ElMessage.error(`上传失败: ${error.message}`);
      }
    }

    // 关闭预览窗口
    drawer.value = false;
  } catch (error: any) {
    ElMessage.error(`上传过程出错: ${error.message}`);
  }
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
</script>

<style scoped>
.camera-select{
  position: fixed;
  top: 10px;
  right: 10px;
  z-index: 999;
}

.take-photos-view {
  width: 100%;
  height: 100%;
}
#video {
  width: 100%;
  height: 100%;
  background-color: dimgrey;
}
/* 拍照按钮 */
.shot-btn{
  position: fixed;
  bottom: 50px;
  left: 20%;
  transform: translateX(-50%);
  z-index: 999;
}
/* 上传按钮 */
.upload-btn{
  position: fixed;
  bottom: 50px;
  left: 40%;
  transform: translateX(-50%);
  z-index: 999;
}
/* 从手机中选择按钮 */
.select-from-phone-btn{
  position: fixed;
  bottom: 50px;
  left: 75%;
  transform: translateX(-50%);
  z-index: 999;
}

.grid-container {
  /* display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  padding: 8px;
  margin-bottom: 100px; */

  /* 改为flex布局 */
  display: flex;
  overflow-x: auto;  /* 允许横向滚动 */
  flex-wrap: nowrap; /* 禁止换行 */
  padding: 8px;
  gap: 8px;
  margin-bottom: 100px;
  -webkit-overflow-scrolling: touch; /* 移动端滚动优化 */
}

/* 为每个grid项设置固定宽度 */
.grid-item {
  flex: 0 0 auto; /* 禁止伸缩 */
  width: 70px;   /* 设置项目宽度，根据实际情况调整 */
  height: 70px;
}
.grid-item
.image-wrapper {
  width: 100%;    /* 宽度占满父容器 */
  height: 100%;  /* 固定高度，根据宽度自动保持正方形 */
  position: relative;
  overflow: hidden;
}

.square-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover; /* 图片填充模式 */
  object-position: center;
}
.imgdrawer-box{
  width: 100%;
  position: relative;
}
.imgdrawer{
  width: 100%;
}
.img-info{
  position: absolute;
  height: 100%;
  width: 100%;
  top: 0;
}
/* 毛玻璃背景 */
.blur-background {
  width: fit-content;
  background-color: rgba(89, 89, 89, 0.25);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  box-shadow: rgba(14, 14, 14, 0.19) 0px 6px 15px 0px;
  -webkit-box-shadow: rgba(14, 14, 14, 0.19) 0px 6px 15px 0px;
  color: #fff;
}
.delete-item{
  bottom: 5px;
  position: absolute;
}
</style>
