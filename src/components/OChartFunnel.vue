<script setup lang="ts">
import { ref, watch } from 'vue';
import OChart from './OChart.vue';
type EChartsOption = echarts.EChartsOption;
const props = defineProps({
  id: {
    type: String,
    default: '',
  },
  data: {
    type: Array<any>,
    required: true,
  },
  width: {
    type: String,
    default: '500px',
  },
  height: {
    type: String,
    default: '450px',
  },
});

// 环比保留两位小数
const calcRatio = (num: number) => {
  return `${Math.round(num * 10000) / 100}%`;
};
const getOption = (): EChartsOption => {
  return {
    title: [
      {
        text: '三类用户比例',
        left: 'center',
      },
      {
        text: `D0-D1:${calcRatio(props.data[1]?.value / props.data[0]?.value)}`,
        top: '42%',
        left: '73%',
        textStyle: {
          fontSize: 16,
        },
      },
      {
        text: `D1-D2:${calcRatio(props.data[2]?.value / props.data[1]?.value)}`,
        top: '63%',
        left: '65%',
        textStyle: {
          fontSize: 16,
        },
      },
    ],
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b} : {c} ({d}%)',
    },
    toolbox: {
      feature: {
        dataView: { readOnly: true },
        saveAsImage: {},
      },
    },
    legend: {
      top: 40,
      data: props.data.map((item) => item.name),
    },

    series: [
      {
        name: '漏斗图',
        type: 'funnel',
        left: '10%',
        top: 80,
        bottom: 30,
        width: '80%',
        min: 0,
        minSize: '0%',
        maxSize: '100%',
        sort: 'descending',
        gap: 2,
        label: {
          show: true,
          position: 'inside',
          padding: [0, 0, 50, 0],
          formatter: function (info) {
            return `{total|${info.name}: ${
              info.value
            }}\n{week|周环比: ${calcRatio(
              (info.data as any).week
            )}}\n{month|月环比: ${calcRatio((info.data as any).month)}}`;
          },
          rich: {
            total: {
              fontSize: 10,
              lineHeight: 20,
            },
            week: {
              fontSize: 12,
              lineHeight: 20,
            },
            month: {
              fontSize: 12,
            },
          },
        },
        labelLine: {
          length: 10,
          lineStyle: {
            width: 1,
            type: 'solid',
          },
        },
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 1,
        },
        emphasis: {
          label: {
            fontSize: 20,
          },
        },
        data: props.data,
      },
    ],
  };
};
const option = ref({} as EChartsOption);
option.value = getOption();
watch(
  () => props.data,
  () => (option.value = getOption()),
  { deep: true }
);
const clickSeries = (res: any) => {
  console.log(res);
};
</script>
<template>
  <OChart
    :id="id"
    :option="(option as EChartsOption)"
    :width="width"
    :height="height"
    @click-series="clickSeries"
  ></OChart>
</template>
