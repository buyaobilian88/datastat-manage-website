<script setup lang="ts">
import OLabel from '@/components/OLabel.vue';
import { OptionItem } from '@/shared/interface';
import { onMounted, ref } from 'vue';
import UserDetail from './items/UserDetail.vue';
import UserTotal from './items/UserTotal.vue';

// 默认全部时间
const timeRange = ref([new Date('2019-06-01'), new Date()]);

const selectOversea = ref('all');
const overseaOption: OptionItem[] = [
  {
    value: 'all',
    label: 'All',
  },
  {
    value: '0',
    label: '海外',
  },
  {
    value: '1',
    label: '海内',
  },
];
const getInternal = () => {
  if (selectOversea.value === 'all') {
    return overseaOption.map((item) => item.value).slice(1);
  }
  return [selectOversea.value];
};

const commonParams = ref({
  start: 0,
  end: 0,
  oversea: ['all'],
});
onMounted(() => {
  initSelect();
});
// 设置搜索值
const initSelect = () => {
  const obj = {
    start: new Date(timeRange.value[0]).getTime(),
    end: new Date(timeRange.value[1]).getTime(),
    oversea: getInternal(),
  };
  commonParams.value = obj;
};
</script>

<template>
  <div class="content-header">
    <OLabel name="海内海外">
      <OSelect v-model="selectOversea" @change="initSelect">
        <OOption
          v-for="item in overseaOption"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </OSelect>
    </OLabel>
    <OLabel name="时间">
      <ODatePicker v-model="timeRange" @change="initSelect" />
    </OLabel>
  </div>
  <div class="content-body">
    <MoreCard>
      <template #title>
        <UserTotal :common-params="commonParams"></UserTotal>
      </template>
      <template #content>
        <UserDetail :common-params="commonParams"></UserDetail>
      </template>
    </MoreCard>
  </div>
</template>

<style lang="scss" scoped>
.content-header {
  display: flex;
  gap: 24px;
  margin-bottom: var(--o-spacing-h4);
}
.content-body {
  display: grid;
  row-gap: 24px;
}
</style>
