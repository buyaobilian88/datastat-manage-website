<script setup lang="ts">
import { queryMetricsData } from '@/api/api-sig';
import { useCommonData } from '@/stores/common';
import { onMounted, ref, watch, computed } from 'vue';
import { throttle } from 'lodash-es';
import { from, Observable, zip } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { calcRatio } from '@/shared/utils/helper';
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
  queryLastTotalCount();
};

const pr_total = ref(0);
const issue_total = ref(0);
const comment_total = ref(0);
const sig_total = ref(0);
const maintainer_total = ref(0);
const committer_total = ref(0);
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
    data.contributes.forEach((item: any) => {
      pr_total.value += item.pr;
      issue_total.value += item.issue;
      comment_total.value += item.comment;
    });
    sig_total.value = data.contributes.length;
  });
};
const queryLastTotalCount = () => {
  const param = {
    metrics: ['owner'],
    community: community.value,
    variables: {
      org: props.commonParams.org,
      internal: props.commonParams.internal,
      sig: 'all',
    },
    filter: 'sig',
    operation: 'totalCount',
    start: props.commonParams.start,
    end: props.commonParams.end,
  };
  queryMetricsData(param).then((res) => {
    const { data } = res;
    maintainer_total.value = data.maintainers ? data.maintainers : 0;
    committer_total.value = data.committers ? data.committers : 0;
  });
};

const titalData = ref([
  {
    label: 'SIG总数',
    value: computed(() => sig_total.value),
  },
  {
    label: 'Issue总数',
    value: computed(() => issue_total.value),
  },
  {
    label: 'PR总数',
    value: computed(() => pr_total.value),
  },
  {
    label: 'Comment总数',
    value: computed(() => comment_total.value),
  },
  {
    label: 'Maintainer总数',
    value: computed(() => maintainer_total.value),
  },
  {
    label: 'Committer总数',
    value: computed(() => committer_total.value),
  },
]);
</script>
<template>
  <OTextTitle :data="titalData"></OTextTitle>
</template>
