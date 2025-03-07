<template>
  <div class="photo-preview">
    <img :src="props.src" alt=""></img>
    <div class="location">
      <div>{{props.location?.coords.latitude}}</div>
      <div>{{props.location?.coords.longitude}}</div>
    </div>
    <div class="time">{{location?.timestamp}}</div>

    <div >
      <div v-for="(label, index) in labels" :key="index">
        <el-check-tag :checked="label.checked" type="primary">
          {{label}}
        </el-check-tag>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { getLabelList, type LabelInfo } from '@/api/label';
import { onMounted, ref, type Ref } from 'vue';

onMounted(async () => {
  const res = await getLabelList()
  labels.value = res
})

// 获取所有标签
const labels:Ref<LabelInfo[]> = ref([])

const props = defineProps({
  src: {
    type: String,
    required: true
  },
  location:{
    type: GeolocationPosition,
    required: false
  }
})
</script>

<style scoped>

</style>
