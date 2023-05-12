<script setup lang="ts">
import OLabel from '@/components/OLabel.vue';
import { onMounted, ref } from 'vue';
import { OptionItem } from '@/shared/interface';
import ItemDetail from './items/ItemDetail.vue';
import ItemTotal from './items/ItemTotal.vue';

// 默认全部时间
const timeRange = ref([new Date('2019-06-01'), new Date()]);
const selectValue = ref('all');
const communityOption: OptionItem[] = [
  {
    value: 'all',
    label: 'All',
  },
  {
    value: 'src-openeuler',
    label: 'src-openeuler',
  },
  {
    value: 'openeuler',
    label: 'openeuler',
  },
];
const getOrg = (): string[] => {
  if (selectValue.value === 'all') {
    return communityOption.map((item) => item.value).slice(1);
  }
  return [selectValue.value];
};

const selectInsider = ref('all');
const insiderOption: OptionItem[] = [
  {
    value: 'all',
    label: 'All',
  },
  {
    value: '1',
    label: '内部人员',
  },
  {
    value: '0',
    label: '外部人员',
  },
];
const getInternal = () => {
  if (selectInsider.value === 'all') {
    return insiderOption.map((item) => item.value).slice(1);
  }
  return [selectInsider.value];
};

const commonParams = ref({
  org: ['all'],
  start: 0,
  end: 0,
  internal: ['all'],
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
    internal: getInternal(),
  };
  commonParams.value = obj;
};
</script>

<template>
  <div class="content-header">
    <OLabel name="组织名称">
      <OSelect v-model="selectValue" @change="initSelect">
        <OOption
          v-for="item in communityOption"
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
  <MoreCard>
    <template #title>
      <ItemTotal :common-params="commonParams"></ItemTotal>
    </template>
    <template #content>
      <ItemDetail :common-params="commonParams"></ItemDetail>
    </template>
  </MoreCard>
</template>

<style lang="scss" scoped>
.content-header {
  display: flex;
  gap: 24px;
  margin-bottom: var(--o-spacing-h4);
}
</style>
