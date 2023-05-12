<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import OFormRadio from '@/components/OFormRadio.vue';
import { queryCompanySigContribute } from '@/api/api-detail';
import { sortExp, formatNumber } from '@/shared/utils/helper';
import { ceil } from 'lodash-es';
// import ONoDataImage from 'shared/components/ONoDataImage.vue';
import { FormRadioConfig } from '@/shared/formRadio.interface';
interface IObject<T = any> {
  [key: string]: T;
}
const props = defineProps({
  company: {
    type: String,
    required: true,
    default: '',
  },
});
const param = ref({
  contributeType: 'pr',
  timeRange: 'all',
  community: 'openeuler',
  company: computed(() => props.company),
  displayRange: '10',
} as IObject);
const memberData = ref([] as IObject[]);
const memberMax = ref(0);
const memberList = ref([] as IObject[]);
const rankNum = ref(1);
const sumContribute = ref(0);

const getMemberData = () => {
  queryCompanySigContribute(param.value).then((data) => {
    memberList.value =
      (data.data &&
        data.data
          .sort(sortExp('contribute', false))
          .filter((item: any) => item.contribute !== 0)) ||
      [];
    memberMax.value = ceil(memberList.value[0]?.contribute + 1, 0) || 0;
    rankNum.value = 1;
    if (param.value.displayRange === 'all') {
      return (memberData.value = memberList.value);
    }
    memberData.value = memberList.value.slice(
      0,
      Number(param.value.displayRange)
    );
    sumContribute.value = memberData.value.reduce((total, currentValue) => {
      return total + currentValue.contribute;
    }, 0);
  });
};

const formRadioValue = ref({
  metrics: 'pr',
  operation: 'lastonemonth',
  interval: '10',
});
const formRadioOption: FormRadioConfig[] = [
  {
    label: '度量指标',
    id: 'metrics',
    options: [
      { label: '合并请求PR', value: 'pr' },
      { label: '需求&问题Issue', value: 'issue' },
      { label: '评审Comment', value: 'comment' },
    ],
  },
  {
    label: '度量维度',
    id: 'operation',
    options: [
      { label: '最近一个月内', value: 'lastonemonth' },
      { label: '最近半年内', value: 'lasthalfyear' },
      { label: '最近一年内', value: 'lastoneyear' },
      { label: '全部', value: 'all' },
    ],
  },
  {
    label: '间隔周期',
    id: 'interval',
    options: [
      { label: 'Top10', value: '10' },
      { label: '全部', value: 'all' },
    ],
  },
];
const getContributeInfo = () => {
  param.value.contributeType = formRadioValue.value.metrics;
  param.value.timeRange = formRadioValue.value.operation;
  param.value.displayRange = formRadioValue.value.interval;
  getMemberData();
};

watch(
  () => props.company,
  () => {
    getMemberData();
  }
);
const progressFormat = (item: number) => {
  return (memberMax.value !== 0 ? 100 / memberMax.value : 0) * item;
};
onMounted(() => getMemberData());
</script>

<template>
  <div class="contributions-statistical">
    <OFormRadio
      v-model="formRadioValue"
      class="right-radio"
      :option="formRadioOption"
      @change="getContributeInfo"
    ></OFormRadio>
  </div>
  <div v-if="memberData.length" class="bar-panel">
    <ul class="bar-content">
      <li
        v-for="(item, index) in memberData"
        :key="'com' + index"
        class="bar-content-item"
      >
        <p class="infos">
          <span class="name">{{ item.sig_name }}</span>
        </p>
        <div class="progress">
          <div
            class="progress-inner"
            :style="{
              width: progressFormat(item.contribute) + '%',
            }"
          >
            <span v-if="progressFormat(item.contribute) >= 80">{{
              formatNumber(item.contribute)
            }}</span>
          </div>
          <span v-if="progressFormat(item.contribute) < 80" class="val">{{
            formatNumber(item.contribute)
          }}</span>
        </div>
      </li>
    </ul>
    <div v-if="memberData?.length" class="bar-columns">
      <div class="num"><span>0</span></div>
      <div class="num">
        <span>{{ formatNumber(memberMax / 2) }}</span>
      </div>
      <div class="num">
        <span>{{ formatNumber(memberMax) }}</span>
      </div>
    </div>
  </div>
  <!-- <div v-else><o-no-data-image></o-no-data-image></div> -->
</template>

<style lang="scss" scoped>
@import '@/shared/styles/style.scss';
.searchInput {
  width: 100%;
  margin: 10px 0 20px;
  .search-icon {
    font-size: 20px;
  }
  :deep(.el-autocomplete) {
    width: 100%;
    &.active .el-input__inner {
      box-shadow: 0 0 0 1px #002fa7 inset;
    }
  }
  :deep(.el-input__prefix) {
    left: 12px;
    align-items: center;
  }
  @media screen and (min-width: 900px) {
    :deep(.el-input__inner) {
      padding-left: 40px;
    }
  }
  @media screen and (max-width: 900px) {
    :deep(.el-input__prefix) {
      left: 10px;
    }
  }
  :deep(.el-input__inner:focus) {
    box-shadow: 0 0 0 1px #002fa7 inset;
  }
  :deep(.el-input__inner) {
    height: 56px;
  }
}
.bar-panel {
  position: relative;
  height: 100%;
  padding-bottom: 12px;
  .bar-columns {
    position: absolute;
    bottom: 0;
    top: 0;
    left: 300px;
    display: flex;
    justify-content: space-between;
    right: 0;
    .num {
      color: #9097a3;
      font-size: 12px;
      position: relative;
      display: flex;
      align-items: end;
      min-width: 8px;
      &::after {
        position: absolute;
        top: 0;
        left: 48%;
        width: 1px;
        border-left: 1px dashed #ccc;
        bottom: 20px;
        content: '';
      }
      &:last-child {
        &::after {
          left: inherit;
          right: 0;
        }
      }
    }
  }
}
.bar-content {
  position: relative;
  z-index: 2;
  &-item {
    margin: 16px 0;
    list-style: none;
    display: flex;
    justify-content: space-between;
    .infos {
      font-size: 16px;
      color: #000000;
      line-height: 22px;

      display: flex;
      .index {
        width: 16px;
        margin-right: 8px;
        font-size: 16px;
        color: #9097a3;
        text-align: center;
      }
      .name {
        width: 304px;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }
    }
  }
}
.progress {
  height: 24px;
  display: flex;
  width: 100%;
  align-items: center;
  &-inner {
    background: #002fa7;
    box-shadow: 4px 8px 12px 0px rgba(0, 92, 219, 0.25);
    font-size: 12px;
    color: #fff;
    height: 100%;
    display: flex;
    justify-content: end;
    align-items: center;
    padding-right: 0px;
    transition: all 0.3s ease-in-out;
    span {
      padding-right: 4px;
    }
  }
  .val {
    color: #000;
    font-size: 12px;
    margin-left: 8px;
  }
}
.bar-tooltip {
  padding: 12px 16px;
  box-shadow: 4px 8px 16px 0px rgba(10, 11, 13, 0.05),
    0px 0px 32px 0px rgba(10, 11, 13, 0.1);

  .lable {
    color: #9097a3;
    font-weight: bold;
    .text {
      font-weight: 100;
    }
  }
  .info {
    color: #4e5865;
    display: flex;
    justify-content: space-between;
    margin-top: 8px;
    // min-width: 280px;
    .index {
      color: #9097a3;
    }
    .num {
      font-size: 16px;
      color: #000000;
      margin-right: 8px;
      margin-left: 16px;
      .percentage {
        margin-left: 10px;
        font-size: 12px;
        color: #4e5865;
      }
    }
  }
}
</style>
