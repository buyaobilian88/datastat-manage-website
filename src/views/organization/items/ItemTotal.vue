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
  queryMenTotalCount();
};

const totalData = ref();
const queryMenTotalCount = () => {
  const param = {
    metrics: ['users'],
    community: community.value,
    variables: {
      org: props.commonParams.org,
      internal: props.commonParams.internal,
      term: 'enterprise',
    },
    filter: 'company',
    operation: 'totalCount',
    start: props.commonParams.start,
    end: props.commonParams.end,
  };
  queryMetricsData(param).then((res) => {
    const { data } = res;
    totalData.value = data.users.length;
  });
};

const titalData = ref([
  {
    label: '组织总数',
    value: computed(() => totalData.value),
  },
  // {
  //   label: '访客数(UV)',
  //   value: 0,
  // },
]);
</script>
<template>
  <OTextTitle :data="titalData"></OTextTitle>
</template>
