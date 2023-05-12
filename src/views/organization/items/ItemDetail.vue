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

const props = defineProps({
  commonParams: {
    type: Object,
    default: () => ({}),
  },
});

const termsObj: IObject = {
  huawei: '华为',
  enterprise: '企业',
  student: '学生',
  partners: '合作方',
  independent: '个人',
};

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
  queryCompanyContribute();
  queryContributeLine();
};

const queryCompanyContribute = () => {
  const config = {
    metrics: [formRadioValue.value.metrics],
  };
  queryTermsOfTotalCount(config).subscribe((data) => {
    const pieData = data.map((item) => ({
      key: item.term,
      name: termsObj[item.term] || '',
      value: item[formRadioValue.value.metrics],
    }));
    companyContribute.value = pieData;
  });
};

const queryTermsOfTotalCount = (config?: IObject) => {
  const terms = from(Object.keys(termsObj));
  return terms.pipe(
    concatMap((item) => queryTotalCount(item, config)),
    reduce((pre, next: any) => {
      if (Object.keys(next).length) {
        pre.push(next);
      }
      return pre;
    }, [] as any[])
  );
};

const companyContribute = ref<any>([]);

const queryTotalCount = (term: string, config?: IObject) => {
  return new Observable((observe) => {
    const _config = config || {};
    const param = {
      metrics: _config?.metrics || ['pr', 'issue', 'comment'],
      community: community.value,
      variables: {
        org: props.commonParams.org,
        internal: props.commonParams.internal,
        term,
      },
      filter: 'company',
      operation: 'totalCount',
      start: props.commonParams.start,
      end: props.commonParams.end,
    };
    queryMetricsData(param)
      .then((res) => {
        const { data } = res;
        if (data instanceof Object) {
          const obj = Object.fromEntries(
            Object.entries(data).map((item) => {
              item[0] = item[0].replace(`${term}_`, '');
              return item;
            })
          );
          observe.next({ term, ...obj });
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

const queryContributeLine = () => {
  queryTermsOfIncrease().subscribe((data) => {
    echartData.value = data;
  });
};

const queryTermsOfIncrease = () => {
  const terms = from(Object.keys(termsObj));
  const _echartData = {
    xAxis: [],
    series: [],
  };
  return terms.pipe(
    concatMap(queryIncrease),
    reduce((pre: any, next: any) => {
      const { xAxis, ...series } = next;
      if (xAxis && series) {
        pre.xAxis = xAxis;
        pre.series.push(series);
      }
      return pre;
    }, _echartData),
  );


};

const queryIncrease = (term: string) => {
  return new Observable((observe) => {
    const param = {
      metrics: [formRadioValue.value.metrics],
      community: community.value,
      variables: {
        org: props.commonParams.org,
        internal: props.commonParams.internal,
        interval: formRadioValue.value.interval,
        term,
      },
      filter: 'company',
      operation: 'increase',
      start: props.commonParams.start,
      end: props.commonParams.end,
    };
    queryMetricsData(param)
      .then((res) => {
        const { data } = res;
        const key = `${term}_${formRadioValue.value.metrics}`;
        if (data[key]) {
          const stat = {
            name: termsObj[term],
            xAxis: [] as string[],
            data: [] as any[],
          };
          data[key].forEach((item: any) => {
            stat.xAxis.push(formatDate(item.date));
            stat.data.push({
              value: Math.round(item[param.operation]),
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
      id="organizationProtable"
      :common-params="commonParams"
    ></ItemDetailTable>
  </div>
</template>
<style lang="scss" scoped>
.top {
  display: flex;
}
</style>
