<script setup lang="ts">
import { queryMetricsData } from '@/api/api-sig';
import { useCommonData } from '@/stores/common';
import { onMounted, ref, watch, computed } from 'vue';
import { throttle } from 'lodash-es';
import { from, Observable, zip } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

const props = defineProps({
  commonParams: {
    type: Object,
    default: () => ({}),
  },
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
};
const total = ref(0);
const increase = ref(0);
const queryTotalCount = () => {
  const param = {
    metrics: ['download_count', 'download_ip'],
    community: community.value,
    variables: {
      oversea: props.commonParams.oversea,
    },
    filter: 'download',
    operation: 'totalCount',
    start: props.commonParams.start,
    end: props.commonParams.end,
  };
  queryMetricsData(param).then((res) => {
    const { data } = res;
    total.value = data.download_count;
    increase.value = data.download_ip;
  });
};
const titalData = ref([
  {
    key: 'download_count',
    name: '用户量（下载量）',
    value: computed(() => total.value),
  },
  {
    key: 'download_ip',
    name: '下载IP数',
    value: computed(() => increase.value),
  },
]);
</script>
<template>
  <div class="box">
    <div v-for="item in titalData" :key="item.key">
      <OChartText :data="item"></OChartText>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.box {
  display: flex;
}
</style>
