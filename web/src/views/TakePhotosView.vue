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
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { v4 as uuidv4 } from 'uuid';


const currentCamera = ref()
const cameraList = ref([])
function getDevices() {
  navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);
}
getDevices()

watch(currentCamera, (newValue, oldValue) => {
  console.log(newValue, oldValue);
  // 获取摄像头
  navigator.mediaDevices.getUserMedia({
    video: {
      deviceId: newValue.deviceInfo.deviceId
    }
  }).then(function (stream) {
    // 将流赋值给video
    video.srcObject = stream;
  }).catch(handleError);
})

function gotDevices(deviceInfos) {
  // 从中找到摄像头放进cameraList 中
  for (let i = 0; i !== deviceInfos.length; ++i) {
    const deviceInfo = deviceInfos[i];
    if (deviceInfo.kind === 'videoinput') {
      cameraList.value.push({
        label: deviceInfo.label || `camera ${cameraList.length + 1}`,
        value: deviceInfo.deviceId,
        deviceInfo: deviceInfo
      });
    }
  }

  // 对cameraList 进行排序，将字符串中有back的放在前面
  cameraList.value.sort((a, b) => {
    if (a.label.includes('back') && !b.label.includes('back')) {
      return -1;
    } else if (!a.label.includes('back') && b.label.includes('back')) {
      return 1;
    } else {
      return 0;
    }
  });
  console.log(cameraList.value[0]);


  // 默认选中第一个摄像头
  currentCamera.value = cameraList.value[0];



}
function handleError(error) {
  console.log('navigator.MediaDevices.getUserMedia error: ', error.message, error.name);
}

function takePhoto() {
  // 获取视频流
  const videoTrack = video.srcObject?.getVideoTracks()[0]
  if (videoTrack) {
    let capture = new ImageCapture(videoTrack)
    capture
    .takePhoto()
    .then((blob) => {
      // 图片二进制数据
      console.log("Took photo:", blob);
      const image = {
        dataUrl: URL.createObjectURL(blob),
        blob: blob,
        gps: null,
        time: Date.now(),
        camera: currentCamera.value,
        id: uuidv4()
      }

      // 存储图片到数据库
      imageStore.setItem(image.id.toString(), toRaw(image)).then(() => {
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
    .catch((error) => {
      console.error("takePhoto() error: ", error);
    });
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
