<script setup lang="ts">
import OLabel from '@/components/OLabel.vue';
import { onMounted, ref } from 'vue';
import DetailUser from './DetailStudent.vue';
import { queryUserList } from '@/api/api-detail';
// 默认全部时间
const timeRange = ref([new Date('2019-06-01'), new Date()]);

const selectValue = ref('yuandj');

const allSigs = ref();
const getDrownData = () => {
  const query = {
    community: 'openeuler',
    group: 'company',
    name: '学生',
  };
  queryUserList(query as any).then((data) => {
    allSigs.value = data?.data || {};
    allSigs.value.sort((a: any, b: any) => a.localeCompare(b));
  });
};
getDrownData();
const getOrg = () => {
  return selectValue.value;
};

const commonParams = ref<any>({
  org: 'yuandj',
  start: 0,
  end: 0,
});
onMounted(() => {
  initSelect();
});
// 设置搜索值
const initSelect = () => {
  const obj = {
    org: getOrg(),
    start: new Date(timeRange.value[0]).getTime(),
    end: new Date(timeRange.value[1]).getTime(),
  };
  commonParams.value = obj;
};
</script>

<template>
  <div class="content-header">
    <OLabel name="用户名称">
      <OSelect v-model="selectValue" @change="initSelect">
        <OOption
          v-for="item in allSigs"
          :key="item"
          :label="item"
          :value="item"
        />
      </OSelect>
    </OLabel>
    <OLabel name="时间">
      <ODatePicker v-model="timeRange" @change="initSelect" />
    </OLabel>
  </div>
  <DetailUser :user="commonParams"></DetailUser>
</template>

<style lang="scss" scoped>
.content-header {
  display: flex;
  gap: 24px;
  margin-bottom: var(--o-spacing-h4);
}
</style>
