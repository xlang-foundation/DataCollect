<template>
  <el-form
    label-position="top"
    label-width="auto"
    class="centered-container"
  >
    <el-form-item label="工作区：" label-position="top">
      <el-select v-model="form.selectZoneId" placeholder="请选择工作区域" :disabled="Boolean(route.params.zoneId)">
          <el-option v-for="item in form.zoneList" :key="item.id"  :label="item.name" :value="item.id"></el-option>
        </el-select>
    </el-form-item>
    <el-form-item>
      <el-button style="margin: 0 auto;" type="primary" @click="onSubmit()">
        开始拍照
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue';
import { ElForm, ElFormItem, ElSelect, ElOption, ElButton } from 'element-plus';
import {getZoneList,type ZoneInfo} from '@/api/zone';
import { useRoute, useRouter } from 'vue-router';
const route = useRoute()
const router = useRouter()

const form = reactive({
  zoneList: [] as ZoneInfo[],
  selectZoneId: undefined as number | undefined
})

const onSubmit = () => {
  router.push({
    path: `/takePhoto/${form.selectZoneId}`
  })
};

watch(() => [route.params.zoneId], async (newValue, oldValue) => {
  if (newValue) {
    const zoneId = Number(newValue)
    if (route.fullPath !== "/zone") {
      if (!route.params.zoneId || zoneId <= 0) {
        router.push({
          path: '/zone'
        })
      }
    }
    // 从列表中找到
    // 如果列表中没找到就重定向到选择页
    form.zoneList = await getZoneList()
    const zone = form.zoneList.find((item) => item.id === zoneId)
    form.selectZoneId = zone?.id || undefined
    if (form.selectZoneId && form.selectZoneId <= 0) {
      router.push({
        path: '/zone'
      })
    }
  }
},{
  immediate: true
})
</script>

<style scoped>

.centered-container {
  height: 100vh;
  max-width: 600px; /* 最大宽度限制 */
  margin: 0 auto; /* 水平居中 */
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 1rem;
}
</style>
