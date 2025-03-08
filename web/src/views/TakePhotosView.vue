<template>
  <div class="take-photos-view">
    <video id="video" playsinline autoplay></video>

    <el-select
      class="camera-select"
      v-model="currentCamera"
      placeholder="Select"
      size="small"
      style="width: 240px"
    >
      <el-option
        v-for="item in cameraList"
        :key="item.value"
        :label="item.label"
        :value="item"
      />
    </el-select>

    <!-- 在网页底部居中添加一个拍照按钮 -->
      <el-button
        class="shot-btn"
        type="danger"
        @click="takePhoto"
      >
        拍照
      </el-button>

    <!-- 添加一个按钮跳转到列表页 -->
      <el-button
        class="list-btn"
        type="primary"
        @click="()=>{
          $router.push({
            path: '/photoList'
          })

        }"
      >
        相册
      </el-button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, type Ref } from "vue";
import { v4 as uuidv4 } from 'uuid';
import localforage from "localforage";
import { blobToDataURL } from "@/utils/dataUrlTools";

const currentCamera = ref()
const cameraList: Ref<{
  label: string;
  value: string;
  deviceInfo: MediaDeviceInfo;
}[]> = ref([])
function getDevices() {
  navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);
}
getDevices()

watch(currentCamera, (newValue, oldValue) => {
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
})

function gotDevices(deviceInfos:MediaDeviceInfo[]) {
  // 从中找到摄像头放进cameraList 中
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

  // 对cameraList 进行排序，将字符串中有back的放在前面
  cameraList.value.sort((a: { label: string ; }, b: { label: string ; }) => {
    if (a.label.includes('back') && !b.label.includes('back')) {
      return -1;
    } else if (!a.label.includes('back') && b.label.includes('back')) {
      return 1;
    } else {
      return 0;
    }
  });

  // 默认选中第一个摄像头
  currentCamera.value = cameraList.value[0];
}
function handleError(error: { message: any; name: any; }) {
  console.log('navigator.MediaDevices.getUserMedia error: ', error.message, error.name);
}

function takePhoto() {
  const videoDom = document.getElementById('video') as any
  if (videoDom && videoDom.srcObject) {
    // 获取视频流
    const videoTrack = videoDom?.srcObject?.getVideoTracks()[0]
    if (videoTrack) {
      // @ts-ignore
      let capture = new ImageCapture(videoTrack)
      capture.takePhoto().then(async (blob: Blob) => {
        console.log(blob);
        const dataUrl = await blobToDataURL(blob)

        // 图片二进制数据
        const image = {
          id: uuidv4(),
          dataUrl,
          gps: null,
          shotTime: Date.now(),
        }

        // 配置存储
        const imageStore = localforage.createInstance({
          driver: localforage.INDEXEDDB,
          name: 'image-storage',
          storeName: 'images'
        });
        localforage.setDriver(localforage.INDEXEDDB);
        // 存储图片到数据库
        imageStore.setItem(image.id.toString(), image).then(() => {
          console.log('Image stored successfully');
        }).catch((error) => {
          console.error('Error storing image:', error);
        });

        // 获取gps数据
        navigator.geolocation.getCurrentPosition((a)=>{
          // 将gps更新到数据库

        },(error)=>{
          // 获取位置失败

        },{
          enableHighAccuracy: true,    // 是否要求高精度定位
          timeout: 5000,               // 获取位置的最大等待时间（毫秒）
          maximumAge: 0                // 可接受的位置缓存最大时长（毫秒）
        })


      })
      .catch((error:any) => {
        console.error("takePhoto() error: ", error);
      });
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
.shot-btn{
  position: fixed;
  bottom: 50px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 999;
}
</style>
