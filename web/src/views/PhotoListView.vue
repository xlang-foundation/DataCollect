<template>
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
    <!-- 固定在底部的按钮容器 -->
    <div class="fixed-buttons">
    <el-button
      type="info"
      class="left-btn"
      @click="goBack">
      返回拍照
    </el-button>

    <el-button
      type="primary"
      class="right-btn"
      @click="handleAdd">
      手动添加
    </el-button>
  </div>
  <!-- 抽屉，用于展示图片并上传 -->
  <el-drawer v-model="drawer" size="100%" title="图片预览"  :show-close="true">
    <div class="photo-preview">
      <img style="width: 100%;" :src="currentItem?.dataUrl" alt=""></img>
      <div class="location">
        <div>纬度:{{currentItem?.gps?.coords.latitude}}</div>
        <div>经度:{{currentItem?.gps?.coords.longitude}}</div>
      </div>
      <div class="time">GPS Time:{{currentItem?.gps?.timestamp}}</div>
      <div  style="
        gap: 2px;
        margin-top: 1em;
        display: flex;
        flex-wrap: wrap;"
      >
        <div v-for="(label, index) in labels" :key="index">
          <el-check-tag :checked="label.checked" type="success" @change="(status)=>{label.checked = status}">
            {{label.label}}
          </el-check-tag>
        </div>
      </div>
      <!-- 给我在这里来两个按钮，一个取消，一个上传服务器，水平的 -->
       <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 1em;">
        <el-button type="danger" @click="drawer = false">取消</el-button>
        <el-button type="success" @click="()=>{}">上传</el-button>
       </div>
    </div>

  </el-drawer>
</template>

<script setup lang="ts">
import { getLabelList, type LabelInfo } from '@/api/label';

import localforage from 'localforage';
import { onMounted, ref, toRaw, type Ref } from 'vue';
import {mockData} from "./data"
import { useRouter } from 'vue-router'
import { dataURLtoBlob } from '@/utils/dataUrlTools';
const drawer = ref(false)
const router = useRouter()
type ItemStruct = {
  id: number;
  dataUrl: string;
  gps?: {
    coords:{
      latitude: number;
      longitude: number;
    },
    timestamp: number;
    accuracy?: number;

  };
  shotTime: number;
};
const currentItem = ref<ItemStruct | null>(null);

// 配置存储
const imageStore = localforage.createInstance({
  driver: localforage.INDEXEDDB,
  name: 'image-storage',
  storeName: 'images'
});
localforage.setDriver(localforage.INDEXEDDB);
// 列出可选的驱动，以优先级排序
function openPreview(image: ItemStruct) {
  drawer.value = true;
  // 把label的checked设置为false
  labels.value.forEach(label => {
    label.checked = false
  })

  imageStore.setItem(image.id.toString(), toRaw(image)).then(() => {
    console.log('Image stored successfully');
  }).catch((error) => {
    console.error('Error storing image:', error);
  });
  imageStore.getItem(image.dataUrl).then((value) => {
    console.log('Retrieved image:', value);
  }).catch((error) => {
    console.error('Error retrieving image:', error);
  });
  currentItem.value = image;
}

const images = ref<ItemStruct[]>([]);
onMounted(async () => {
  const res = await getLabelList()
  labels.value = res
})

// 获取所有标签
const labels:Ref<LabelInfo[]> = ref([])

// 示例数据，请替换为真实数据源
// 向images 中添加mockData 5次
for (let i = 0; i < 5; i++) {
  const data =  structuredClone(mockData)
  data.id += i
  images.value.push(data);
  const blob = dataURLtoBlob(data.dataUrl)
  console.log(blob);
}



// 跳转到拍照页
const goBack = () => {
  router.go(-1) // 返回上一页

}

// 从手机相册选择文件添加
const handleAdd = () => {
  // 添加你的添加逻辑
}
</script>

<style scoped>
.grid-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* 两列布局 */
  gap: 8px; /* 图片间距 */
  padding: 8px;
}

.image-wrapper {
  position: relative;
  padding-top: 100%; /* 保持正方形比例 */
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

.fixed-buttons {
  position: fixed;
  bottom: 20px;
  width: 100%;
  pointer-events: none; /* 防止遮挡下方内容 */
}

.left-btn {
  position: fixed;
  left: 20px;
  bottom: 20px;
  pointer-events: auto;
}

.right-btn {
  position: fixed;
  right: 20px;
  bottom: 20px;
  pointer-events: auto;
}
</style>
