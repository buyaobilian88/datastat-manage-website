<script setup lang="ts">
import { queryMetricsData } from '@/api/api-sig';
import { IObject } from '@/shared/interface';
import { ProTableColConfig } from '@/shared/protable.interface';
import { calcRatio } from '@/shared/utils/helper';
import { useCommonData } from '@/stores/common';
import { throttle } from 'lodash-es';
import { from, Observable } from 'rxjs';
import { concatMap, reduce } from 'rxjs/operators';
import { onMounted, ref, watch } from 'vue';
import { FormRadioConfig } from '@/shared/formRadio.interface';
const props = defineProps({
  // 必传，用于记忆缓存列显示隐藏
  id: {
    type: String,
    required: true,
    default: '',
  },
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
  if (formRadioValue.value.metrics === 'developer') {
    queryTotalCount();
  } else {
    queryMenTotalCount();
  }
};

// table
const proTableData = ref<IObject[]>([]);
const proTableConfig: ProTableColConfig[] = [
  {
    key: 'type',
    label: '组织类型',
  },
  {
    key: 'developer',
    label: '开发者贡献',
    children: [
      {
        key: 'pr_ratio',
        label: 'PR',
      },
      {
        key: 'issue_ratio',
        label: 'Issue',
      },
      {
        key: 'comment_ratio',
        label: 'Comment',
      },
    ],
  },
];
const proTableMenConfig: ProTableColConfig[] = [
  {
    key: 'type',
    label: '组织类型',
  },
  {
    key: 'developerMen',
    label: '开发者人数',
    children: [
      {
        key: 'D0',
        label: 'D0',
      },
      {
        key: 'D1',
        label: 'D1',
      },
      {
        key: 'D2',
        label: 'D2',
      },
    ],
  },
];

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
    let pr_total = 0;
    let issue_total = 0;
    let comment_total = 0;
    data.contributes.forEach((item: any) => {
      pr_total += item.pr;
      issue_total += item.issue;
      comment_total += item.comment;
    });

    pieData.value = data.contributes.map((item: any) => ({
      type: item.filter,
      pr_ratio: `${item.pr} (${calcRatio(item.pr, pr_total)})`,
      issue_ratio: `${item.issue} (${calcRatio(item.issue, issue_total)})`,
      comment_ratio: `${item.comment} (${calcRatio(
        item.comment,
        comment_total
      )})`,
      ...item,
    }));

    proTableData.value = pieData.value;
  });
};
const queryMenTotalCount = () => {
  const param = {
    metrics: ['users'],
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

    pieData.value = data.users.map((item: any) => ({
      type: item.filter,
      D0: `${item.D0 ? item.D0 : '0'}`,
      D1: `${item.D1 ? item.D1 : '0'}`,
      D2: `${item.D2 ? item.D2 : '0'}`,
      ...item,
    }));

    proTableData.value = pieData.value;
  });
};
const formRadioValue = ref({
  metrics: 'developer',
});
const formRadioOption: FormRadioConfig[] = [
  {
    label: '度量指标',
    id: 'metrics',
    options: [
      { label: '开发者贡献', value: 'developer' },
      { label: '开发者人数', value: 'developerMen' },
      // { label: '其他指标', value: 'comment' },
    ],
  },
];
//导出栏位头
const tableColumns = ref<any>({
  sig名称: 'type',
  pr: 'pr_ratio',
  Issue: 'issue_ratio',
  comment: 'comment_ratio',
});
const columnsContributes = {
  sig名称: 'type',
  pr: 'pr_ratio',
  Issue: 'issue_ratio',
  comment: 'comment_ratio',
};
const columnsMen = {
  sig名称: 'type',
  D0: 'D0',
  D1: 'D1',
  D2: 'D2',
};

watch(
  () => formRadioValue.value.metrics,
  () => getConfig(),
  { deep: true }
);
const tableConfig = ref([
  {
    key: 'type',
    label: '组织类型',
  },
  {
    key: 'developer',
    label: '开发者贡献',
    children: [
      {
        key: 'pr_ratio',
        label: 'PR',
      },
      {
        key: 'issue_ratio',
        label: 'Issue',
      },
      {
        key: 'comment_ratio',
        label: 'Comment',
      },
    ],
  },
]);
const getConfig = () => {
  if (formRadioValue.value.metrics === 'developer') {
    tableConfig.value = proTableConfig;
    tableColumns.value = columnsContributes;
  } else {
    tableConfig.value = proTableMenConfig;
    tableColumns.value = columnsMen;
  }
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
    <div class="button">
      <vue3-json-excel
        :json-data="proTableData"
        :fields="tableColumns"
        name="导出数据"
      >
        <el-button type="primary">导出</el-button>
      </vue3-json-excel>
    </div>
    <OProTable
      :id="`${id}_${formRadioValue.metrics}`"
      :data="proTableData"
      :table-config="tableConfig"
      :height="5000"
    ></OProTable>
  </div>
</template>
<style lang="scss" scoped>
.right-radio {
  margin: var(--o-spacing-h4) 0;
}
.button {
  padding-bottom: 20px;
}
</style>
