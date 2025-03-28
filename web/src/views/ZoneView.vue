<template>
  <div class="language-switch">
    <el-select v-model="currentLanguage" @change="handleLanguageChange" size="small">
      <el-option label="中文" value="zh-CN" />
      <el-option label="English" value="en-US" />
    </el-select>
  </div>
  <el-form
    label-position="top"
    label-width="auto"
    class="centered-container"
  >
    <el-form-item :label="t('zone.name') + '：'" label-position="top">
      <div>{{ form.name }}</div>
    </el-form-item>
    <el-form-item :label="t('zone.zoneName') + '：'" label-position="top">
      <el-select v-model="form.selectZoneId" :placeholder="t('zone.selectZone')" :disabled="Boolean(route.params.zoneId)">
          <el-option v-for="item in form.zoneList" :key="item.id"  :label="item.name" :value="item.id"></el-option>
        </el-select>
    </el-form-item>
    <el-form-item>
      <el-button style="margin: 0 auto;" type="primary" @click="onSubmit()">
        {{ t('zone.startPhoto') }}
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue';
import { ElForm, ElFormItem, ElSelect, ElOption, ElButton } from 'element-plus';
import {getZoneList,type ZoneInfo} from '@/api/zone';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useLanguageStore } from '@/stores/language';

const route = useRoute();
const router = useRouter();
const { t, locale } = useI18n();
const languageStore = useLanguageStore();
const currentLanguage = ref(languageStore.currentLanguage);

const handleLanguageChange = (value: string) => {
  languageStore.setLanguage(value);
  locale.value = value;
};

const form = reactive({
  zoneList: [] as ZoneInfo[],
  selectZoneId: undefined as number | undefined,
  name: '' // 添加name字段
});

// 在组件挂载时获取name_token并处理
onMounted(() => {
  const nameToken = localStorage.getItem('name_token') || '';
  form.name = nameToken.split('-')[0];
});

const onSubmit = () => {
  router.push({
    path: `/takePhoto/${form.selectZoneId}`
  });
};

watch(() => [route.params.zoneId], async (newValue, oldValue) => {
  if (newValue) {
    const zoneId = Number(newValue);
    if (route.fullPath !== "/zone") {
      if (!route.params.zoneId || zoneId <= 0) {
        router.push({
          path: '/zone'
        });
      }
    }
    // 从列表中找到
    // 如果列表中没找到就重定向到选择页
    form.zoneList = await getZoneList();
    const zone = form.zoneList.find((item) => item.id === zoneId);
    form.selectZoneId = zone?.id || undefined;
    if (form.selectZoneId && form.selectZoneId <= 0) {
      router.push({
        path: '/zone'
      });
    }
  }
},{
  immediate: true
});
</script>

<style scoped>
.language-switch {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
}

.language-switch .el-select {
  width: 100px;
}

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