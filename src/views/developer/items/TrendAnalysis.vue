<script setup lang="ts">
import { queryMetricsData } from '@/api/api-sig';
import { useCommonData } from '@/stores/common';
import { onMounted, ref, watch } from 'vue';
import { from, Observable } from 'rxjs';
import { mergeMap, reduce } from 'rxjs/operators';
import { throttle } from 'lodash-es';
import OInstruction from '@/components/OInstruction.vue';
const props = defineProps({
  commonParams: {
    type: Object,
    default: () => ({}),
  },
});

const D0Data = ref([
  {
    key: 'D0',
    name: 'D0',
    value: 0,
    month: 0,
    week: 0,
  },
  {
    key: 'D1',
    name: 'D1',
    value: 0,
    month: 0,
    week: 0,
  },
  {
    key: 'D2',
    name: 'D2',
    value: 0,
    month: 0,
    week: 0,
  },
]);

const { community } = useCommonData();

onMounted(() => {
  initData();
});

watch(
  () => [community.value, props.commonParams],
  () => initData(),
  { deep: true }
);

const initData = throttle(
  function () {
    getTotalCount();
    getTotal();
  },
  50,
  {
    leading: false,
  }
);

const getTotalCount = () => {
  // operation循环赋值请求
  const arr = ['week', 'month'];
  const operations = from(arr);
  operations
    .pipe(
      mergeMap((item) => queryTotalCount(item)),
      reduce((pre: any, next) => {
        if (pre.length && next.length) {
          pre.forEach((item: any, index: number) => {
            Object.assign(item, next[index]);
          });
        }
        return pre;
      })
    )
    .subscribe((data) => {
      if (data.length) {
        D0Data.value.forEach((item, index) => {
          const obj = data[index] || {};
          item.value = obj?.totalCount || 0;
          Object.assign(item, obj);
        });
      }
    });
};

const queryTotalCount = (operation: string) => {
  return new Observable((observe) => {
    const param = {
      metrics: ['D0', 'D1', 'D2'],
      community: community.value,
      variables: {
        org: props.commonParams.org,
        internal: props.commonParams.internal,
        term: operation,
      },
      filter: 'user',
      operation: 'ratio',
      start: props.commonParams.start,
      end: props.commonParams.end,
    };
    queryMetricsData(param)
      .then((res) => {
        if (res?.data) {
          const {
            data: { D0 = 0, D1 = 0, D2 = 0 },
          } = res;
          const data = [D0, D1, D2].map((item) => ({
            [operation]: item,
          }));
          observe.next(data);
          observe.complete();
        } else {
          observe.next([]);
          observe.complete();
        }
      })
      .catch(() => {
        observe.next([]);
        observe.complete();
      });
  });
};

const getTotal = () => {
  const param = {
    metrics: ['D0', 'D1', 'D2'],
    community: community.value,
    variables: {
      org: props.commonParams.org,
      internal: props.commonParams.internal,
    },
    filter: 'user',
    operation: 'totalCount',
    start: props.commonParams.start,
    end: props.commonParams.end,
  };
  queryMetricsData(param).then((res) => {
    D0Data.value[0].value = res.data.D0;
    D0Data.value[1].value = res.data.D1;
    D0Data.value[2].value = res.data.D2;
  });
};
</script>
<template>
  <div class="card-grid">
    <OChartFunnel :data="D0Data"></OChartFunnel>
    <OInstruction />
  </div>
</template>
<style lang="scss" scoped>
.card-grid {
  display: grid;
  grid-template-columns: 35% auto;
}
</style>
