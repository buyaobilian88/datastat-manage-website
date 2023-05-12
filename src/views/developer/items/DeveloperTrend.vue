<script setup lang="ts">
import { queryMetricsData } from '@/api/api-sig';
import { IObject } from '@/shared/interface';
import { formatDate } from '@/shared/utils/helper';
import { useCommonData } from '@/stores/common';
import { computed, onMounted, ref, watch } from 'vue';
import { throttle } from 'lodash-es';
import { Observable, zip } from 'rxjs';
import { map } from 'rxjs/operators';
import { FormRadioConfig } from '@/shared/formRadio.interface';

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
  if (formRadioValue.value.metrics === 'D2') {
    PRValue.value.items = 'pr';
  }
  zip(queryDetail(), queryDevelop())
    .pipe(
      map((val) => {
        const _echartData = {
          xAxis: [],
          series: [],
        };
        return val.reduce((pre: any, next: any) => {
          const { xAxis, ...series } = next;
          if (xAxis && series) {
            pre.xAxis = xAxis;
            pre.series.push(series);
          }
          return pre;
        }, _echartData);
      })
    )
    .subscribe((data: any) => {
      echartData.value = data;
    });
};

const queryDetail = () => {
  return new Observable((observe) => {
    const param = {
      metrics: [formRadioValue.value.metrics],
      community: community.value,
      variables: {
        org: props.commonParams.org,
        internal: props.commonParams.internal,
        interval: formRadioValue.value.interval,
      },
      filter: 'user',
      operation: formRadioValue.value.operation,
      start: props.commonParams.start,
      end: props.commonParams.end,
    };
    const stat = {
      name: '开发者',
      xAxis: [] as string[],
      data: [] as any[],
    };
    queryMetricsData(param)
      .then((res) => {
        const { data } = res;
        const key = `${formRadioValue.value.metrics}_${formRadioValue.value.interval}`;
        if (data[key]) {
          data[key].forEach((item: any) => {
            stat.xAxis.push(formatDate(item.date));
            stat.data.push({
              value: item[formRadioValue.value.operation],
              date: item.date,
            });
          });
        }
        observe.next(stat);
        observe.complete();
      })
      .catch(() => {
        observe.next(stat);
        observe.complete();
      });
  });
};
const queryDevelop = () => {
  return new Observable((observe) => {
    if (formRadioValue.value.metrics === 'D0') {
      observe.next({});
      observe.complete();
      return;
    }
    const param = {
      metrics: [PRValue.value.items],
      community: community.value,
      variables: {
        org: props.commonParams.org,
        interval: formRadioValue.value.interval,
        internal: props.commonParams.internal,
        term: formRadioValue.value.metrics,
      },
      filter: 'user',
      operation: formRadioValue.value.operation,
      start: props.commonParams.start,
      end: props.commonParams.end,
    };
    queryMetricsData(param)
      .then((res) => {
        const { data } = res;
        const key = `${formRadioValue.value.metrics}_${PRValue.value.items}`;
        if (data[key]) {
          const stat = {
            name:
              PROption.value[0].options.find(
                (item) => item.value === PRValue.value.items
              )?.label || 'PR',
            xAxis: [] as string[],
            data: [] as any[],
            type: 'line',
          };
          data[key].forEach((item: any) => {
            stat.xAxis.push(formatDate(item.date));
            stat.data.push({
              value: item[formRadioValue.value.operation],
              date: item.date,
            });
          });
          observe.next(stat);
        } else {
          observe.next({});
        }
        observe.complete();
      })
      .catch(() => {
        observe.next({});
        observe.complete();
      });
  });
};

const formRadioOption: FormRadioConfig[] = [
  {
    label: '度量指标',
    id: 'metrics',
    options: [
      { label: 'D0', value: 'D0' },
      { label: 'D1', value: 'D1' },
      { label: 'D2', value: 'D2' },
    ],
  },
  {
    label: '度量维度',
    id: 'operation',
    options: [
      { label: '增量', value: 'increase' },
      { label: '总量', value: 'total' },
      { label: '当期活跃', value: 'active' },
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
  metrics: 'D1',
  operation: 'increase',
  interval: '1M',
});

const PROption = computed(() =>
  formRadioValue.value.metrics === 'D2'
    ? [
        {
          label: '度量指标',
          id: 'items',
          options: [{ label: 'PR', value: 'pr' }],
        },
      ]
    : [
        {
          label: '度量指标',
          id: 'items',
          options: [
            { label: 'PR', value: 'pr' },
            { label: 'Issue', value: 'issue' },
            { label: 'Comment', value: 'comment' },
          ],
        },
      ]
);

const PRValue = ref({
  items: 'pr',
});

const clickSeries = (res: any) => {
  const start = res?.data.date || 0;
  const timeObj: any = {
    '1d': 24 * 60 * 60 * 1000,
    '1w': 24 * 60 * 60 * 1000,
    '1M': 24 * 60 * 60 * 1000,
  };
  const param = {
    metrics: [formRadioValue.value.metrics],
    community: community.value,
    variables: {
      org: props.commonParams.org,
      internal: props.commonParams.internal,
      interval: formRadioValue.value.interval,
    },
    filter: 'user',
    operation: `${formRadioValue.value.operation}Detail`,
    start: start,
    end: start + timeObj[formRadioValue.value.interval],
  };
  queryMetricsData(param).then((res) => {
    const { data = {} } = res || {};
    if (data[formRadioValue.value.metrics]) {
      data[formRadioValue.value.metrics].map((item: string) => ({
        name: item,
      }));
    }
  });
};
</script>
<template>
  <div>
    <div class="select">
      <OFormRadio
        v-model="formRadioValue"
        class="right-radio"
        :option="formRadioOption"
        @change="initData"
      ></OFormRadio>
      <OFormRadio
        v-show="formRadioValue.metrics !== 'D0'"
        v-model="PRValue"
        class="right-radio"
        :option="PROption"
        @change="initData"
      ></OFormRadio>
    </div>

    <OChartBar
      title="开发者"
      :data="echartData"
      @click-series="clickSeries"
    ></OChartBar>
  </div>
</template>
<style lang="scss" scoped>
.select {
  display: grid;
  grid-template-columns: 50% 50%;
}
</style>
