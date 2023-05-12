<script setup lang="ts">
import { queryMetricsData } from '@/api/api-sig';
import { IObject } from '@/shared/interface';
import { formatDate } from '@/shared/utils/helper';
import { useCommonData } from '@/stores/common';
import { computed, onMounted, ref, watch } from 'vue';
import { throttle } from 'lodash-es';
import { from, Observable } from 'rxjs';
import { concatMap, reduce } from 'rxjs/operators';
import { FormRadioConfig } from '@/shared/formRadio.interface';
import ItemDetailTable from './ItemDetailTable.vue';
import { arrayBuffer } from 'stream/consumers';

const props = defineProps({
  commonParams: {
    type: Object,
    default: () => ({}),
  },
});
const echartData = ref<IObject>({
  xAxis: [],
  series: [],
});

const getTitle = computed(
  () =>
    formRadioOption[0].options.find(
      (item) => item.value === formRadioValue.value.metrics
    )?.label
);

const formRadioOption: FormRadioConfig[] = [
  {
    label: '度量指标',
    id: 'metrics',
    options: [
      { label: 'PR', value: 'pr' },
      { label: 'Issue', value: 'issue' },
      { label: 'Comment', value: 'comment' },
    ],
  },
  {
    label: '间隔周期',
    id: 'interval',
    options: [
      { label: '天', value: '1d' },
      { label: '周', value: '1w' },
      { label: '月', value: '1M' },
    ],
  },
];

const formRadioValue = ref({
  metrics: 'pr',
  interval: '1M',
});

const { community } = useCommonData();

onMounted(() => {
  init();
});

watch(
  () => [community.value, props.commonParams],
  () => init(),
  { deep: true }
);

const init = throttle(
  function () {
    initData();
  },
  50,
  {
    leading: false,
  }
);

const initData = () => {
  queryTotalCount();
  queryIncrease();
};

const companyContribute = ref<any>([]);
const sigName = ref<any>([]);
const pieData = ref();
const queryTotalCount = () => {
  const param = {
    metrics: ['contributes'],
    community: community.value,
    variables: {
      org: props.commonParams.org,
      internal: props.commonParams.internal,
      term: 'sig',
    },
    filter: 'sig',
    operation: 'totalCount',
    start: props.commonParams.start,
    end: props.commonParams.end,
  };
  queryMetricsData(param).then((res) => {
    const { data } = res;
    data.contributes.map((item: any) => {
      sigName.value.push(item.filter);
    });
    pieData.value = data.contributes.map((item: any) => ({
      key: item.term,
      name: item.filter,
      value: item[formRadioValue.value.metrics],
    }));
    companyContribute.value = pieData.value.slice(0, 10);
  });
};

const queryIncrease = () => {
  const param = {
    metrics: [formRadioValue.value.metrics],
    community: community.value,
    variables: {
      org: props.commonParams.org,
      internal: props.commonParams.internal,
      interval: formRadioValue.value.interval,
      term: 'sig',
    },
    filter: 'sig',
    operation: 'increase',
    start: props.commonParams.start,
    end: props.commonParams.end,
  };
  queryMetricsData(param).then((res) => {
    const { data } = res;
    const key = `${formRadioValue.value.metrics}`;
    const dataNew = [] as any; //新数组
    const dateNew = [] as any;
    if (data[key]) {
      const seriesData = Object.entries(data[key]).map(([name, data]) => ({
        name,
        data,
      }));
      seriesData.forEach((item: any) => {
        item.data.map((item: any) => dateNew.push(formatDate(item.date)));
      });
      seriesData.map((item: any) => {
        const obj = {
          name: item.name,
          data: item.data.map((items: any) => {
            return {
              date: items.date,
              value: items.increase,
            };
          }),
        };
        dataNew.push(obj);
      });
      const stat = {
        xAxis: Array.from(new Set(dateNew)).slice(0, 10),
        series: dataNew.slice(0, 10),
      };
      echartData.value = stat;
    }
  });
};
</script>
<template>
  <div>
    <OFormRadio
      v-model="formRadioValue"
      class="right-radio"
      :option="formRadioOption"
      @change="initData"
    ></OFormRadio>
    <div class="top">
      <OChartPieTable
        :data="companyContribute"
        :title="getTitle"
      ></OChartPieTable>
      <OChartLine :data="echartData" :title="getTitle"></OChartLine>
    </div>
    <ItemDetailTable
      id="sigProtable"
      :common-params="commonParams"
    ></ItemDetailTable>
  </div>
</template>
<style lang="scss" scoped>
.top {
  display: flex;
}
</style>
