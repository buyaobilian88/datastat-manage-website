<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: Array<number>,
    required: true,
    default: [],
  },
});

// 默认最近一个月时间
const timeRange = ref<[Date, Date]>([
  new Date(new Date().getTime() - 3600 * 1000 * 24 * 30),
  new Date(),
]);

onMounted(() => {
  // 传入默认值
  if (props.modelValue.length) {
    timeRange.value = [
      new Date(props.modelValue[0]),
      new Date(props.modelValue[1]),
    ];
  } else {
    // 传入为空，设定默认值
    change();
  }
});

watch(
  () => props.modelValue,
  () => {
    timeRange.value = [
      new Date(props.modelValue[0]),
      new Date(props.modelValue[1]),
    ];
  }
);
const timeTitle = ref();
const mark = ref<any>(0);
const shortcuts = [
  {
    text: '全部',
    value: () => {
      const end = new Date();
      const start = new Date('2019-06-01 00:00:00');
      mark.value = 0;
      return [start, end];
    },
  },
  {
    text: '刷新',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
      timeTitle.value = '';
      return [start, end];
    },
  },
  {
    text: '最近一周',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
      mark.value = 1;
      return [start, end];
    },
  },
  {
    text: '最近一个月',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
      mark.value = 2;
      return [start, end];
    },
  },
  {
    text: '最近三个月',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
      timeTitle.value = '最近三个月';
      mark.value = 3;
      return [start, end];
    },
  },
  {
    text: '最近一年',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 365);
      timeTitle.value = '最近一年';
      mark.value = 4;
      return [start, end];
    },
  },

  {
    text: 'openEuler 22.09',
    value: () => {
      const start = new Date('2022-04-15');
      const end = new Date('2022-09-30');
      timeTitle.value = 'openEuler 22.09';
      mark.value = 5;
      return [start, end];
    },
  },
  {
    text: 'openEuler 22.03 LTS',
    value: () => {
      const start = new Date('2021-11-01');
      const end = new Date('2022-03-30');
      timeTitle.value = 'openEuler 22.03 LTS';
      mark.value = 6;
      return [start, end];
    },
  },
  {
    text: 'openEuler 21.09',
    value: () => {
      const start = new Date('2021-05-18');
      const end = new Date('2021-09-30');
      timeTitle.value = 'openEuler 21.09';
      mark.value = 7;
      return [start, end];
    },
  },
  {
    text: 'openEuler 21.03',
    value: () => {
      const start = new Date('2020-10-20');
      const end = new Date('2021-03-26');
      timeTitle.value = 'openEuler 21.03';
      mark.value = 8;
      return [start, end];
    },
  },
  {
    text: 'openEuler 20.09',
    value: () => {
      const start = new Date('2020-05-31');
      const end = new Date('2020-09-30');
      timeTitle.value = 'openEuler 20.09';
      mark.value = 9;
      return [start, end];
    },
  },
  {
    text: 'openEuler 20.03 LTS',
    value: () => {
      const start = new Date('2019-01-01');
      const end = new Date('2020-03-30');
      timeTitle.value = 'openEuler 20.03 LTS';
      mark.value = 10;
      return [start, end];
    },
  },
];

const emits = defineEmits(['update:modelValue', 'change']);

const change = () => {
  const arr = [
    new Date(timeRange.value[0]).getTime(),
    new Date(timeRange.value[1]).getTime(),
  ];
  emits('update:modelValue', arr);
  emits('change', arr);
  text();
  mark.value = '';
};

const pickerOptions = (time: any) => {
  return time?.getTime() >= new Date().getTime();
};
const markList = [
  '全部',
  '最近一周',
  '最近一个月',
  '最近三个月',
  '最近一年',
  'openEuler 22.09',
  'openEuler 22.03 LTS',
  'openEuler 21.09',
  'openEuler 21.03',
  'openEuler 20.09',
  'openEuler 20.03 LTS',
];
const text = () => {
  timeTitle.value = markList[mark.value];
};
onMounted(() => text());
</script>
<template>
  <el-date-picker
    v-model="timeRange"
    popper-class="o-date-picker"
    type="datetimerange"
    :shortcuts="shortcuts"
    range-separator="To"
    start-placeholder="开始时间"
    end-placeholder="结束时间"
    :unlink-panels="true"
    :disabled-date="pickerOptions"
    @change="change"
  />
  <span>{{ timeTitle }}</span>
</template>

<style lang="scss">
.o-date-picker {
  .el-picker-panel__sidebar {
    width: 150px;
  }
  .el-picker-panel__sidebar + .el-picker-panel__body {
    margin-left: 150px;
  }
}
</style>
