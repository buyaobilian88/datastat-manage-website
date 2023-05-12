<template>
  <div class="content-header">
    <OLabel name="用户名称">
      <OSelect v-model="selectValue" @change="initSelect">
        <OOption
          v-for="item in allcompany"
          :key="item"
          :label="item.company_cn"
          :value="item.company_cn"
        />
      </OSelect>
    </OLabel>
    <OLabel name="时间">
      <ODatePicker v-model="timeRange" @change="initSelect" />
    </OLabel>
  </div>
  <DetailCompany :user="commonParams"></DetailCompany>
</template>
<script setup lang="ts">
import { queryCompanySigs } from '@/api/api-detail';
import { onMounted, ref } from 'vue';
import OLabel from '@/components/OLabel.vue';
import DetailCompany from './DetailCompany.vue';
const timeRange = ref<number[]>([]);
const selectValue = ref('华为技术有限公司');
const allcompany = ref<any>([]);
const getSencondTitle = () => {
  const query = {
    timeRange: 'lastoneyear',
    community: 'openeuler',
  };
  queryCompanySigs(query).then((data) => {
    allcompany.value = data?.data || [];
    allcompany.value.sort((a: any, b: any) =>
      a.company_cn.localeCompare(b.company_cn)
    );
  });
};

onMounted(() => getSencondTitle());
const getOrg = () => {
  return selectValue.value;
};
const commonParams = ref<any>({
  org: '华为技术有限公司',
  start: 0,
  end: 0,
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
<style scoped lang="scss">
.content-header {
  display: flex;
  gap: 24px;
  margin-bottom: var(--o-spacing-h4);
}
</style>
