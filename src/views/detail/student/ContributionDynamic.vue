<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import IconUser from '~icons/app/search';
import OIcon from 'shared/components/OIcon.vue';
import OFormRadio from '@/components/OFormRadio.vue';
import { toThousands } from '@/shared/utils/helper';
import {
  queryUserSigContribute,
  queryUserContributeDetails,
} from '@/api/api-detail';
import MainPR from '@/assets/MainPR.png';
import CommonPR from '@/assets/CommonPR.png';
import comment from '@/assets/comment.png';
import noclick from '@/assets/noclick.png';
import text from '@/assets/text.png';
// import ONoDataImage from '@/components/ONoDataImage.vue';
import { ElScrollbar } from 'element-plus';
import { FormRadioConfig } from '@/shared/formRadio.interface';
interface IObject<T = any> {
  [key: string]: T;
}
const loading = ref(false);
const formRadioValue = ref({
  metrics: 'pr',
  operation: 'all',
});
const props = defineProps({
  sig: {
    type: String,
    required: true,
    default: '',
  },
});
// 评论图表筛选
const infoFirst = ref(1);
const infoSeconed = ref(1);
const commentSelectBox = ref([
  {
    color: comment,
    isSelected: true,
    label: 'General',
    key: 0,
    type: 'command',
    info: computed(() => infoFirst.value),
  },
  {
    color: text,
    isSelected: true,
    label: 'Order',
    key: 1,
    type: 'normal',
    info: computed(() => infoSeconed.value),
  },
]);

const selvalue = ref('');
const pageSize = ref(10);
const cursorValue = ref();
// 搜索过滤
const searchInput = ref('');
const commentType = ref('');
// 默认显示第1页
const currentPage = ref(1);
const param = ref({
  user: computed(() => props.sig),
  community: 'openeuler',
  contributeType: 'pr',
  timeRange: 'all',
  page: computed(() => currentPage.value),
  pageSize: computed(() => pageSize.value),
  filter: computed(() => searchInput.value),
  comment_type: computed(() => commentType.value),
} as IObject);
const selParam = () => {
  if (selvalue.value !== 'all' && selvalue.value !== '') {
    param.value = {
      user: props.sig,
      sig: computed(() => selvalue.value),
      community: 'openeuler',
      contributeType: formRadioValue.value.metrics,
      timeRange: formRadioValue.value.operation,
      page: computed(() => currentPage.value),
      pageSize: computed(() => pageSize.value),
      filter: computed(() => searchInput.value),
      comment_type: computed(() => commentType.value),
    };
  } else {
    param.value = {
      user: props.sig,
      community: 'openeuler',
      contributeType: formRadioValue.value.metrics,
      timeRange: formRadioValue.value.operation,
      page: computed(() => currentPage.value),
      pageSize: computed(() => pageSize.value),
      filter: computed(() => searchInput.value),
      comment_type: computed(() => commentType.value),
    };
  }
};
// 组织贡献from
const getContributeInfo = () => {
  param.value.contributeType = formRadioValue.value.metrics;
  param.value.timeRange = formRadioValue.value.operation;
  getDetailsData();
};

// 获取表格数据
const getDetailsData = () => {
  loading.value = true;
  queryUserContributeDetails(param.value)
    .then((data) => {
      const value = data?.data || [];
      totalCount.value = value['total'];
      detailsData.value = value['data'];
      reallData.value = value['data'];
      cursorValue.value = data?.cursor || '';
      loading.value = false;
    })
    .catch(() => (loading.value = false));
};
getDetailsData();
onMounted(() => getDetailsData());
// 搜索结果
const reallData = ref([] as IObject[]);

const querySearch = (val: any) => {
  if (searchInput.value !== '') {
    getDetailsData();
  } else {
    filterReallData(val);
    // getDetailsData();
  }
};
const clearSearchInput = () => {
  getDetailsData();
  // searchInput.value = "";
};
watch(
  () => props.sig,
  () => {
    getprlistData();
    getDetailsData();
  }
);
watch(
  () => pageSize.value,
  () => {
    getDetailsData();
  }
);
watch(
  () => selvalue.value,
  () => {
    selParam();
    getDetailsData();
  }
);
const options = [
  {
    value: 10,
    label: '10',
  },
  {
    value: 20,
    label: '20',
  },
  {
    value: 50,
    label: '50',
  },
];
const selData = ref();
const getprlistData = () => {
  const query = {
    user: props.sig,
    timeRange: 'all',
    community: 'openeuler',
    contributeType: 'pr',
  };
  queryUserSigContribute(query).then((data) => {
    const value = data?.data || [];
    const seldata: any = [];
    value.map((item: any) => {
      seldata.push({
        name: item.sig_name,
      });
    });
    selData.value = seldata.sort((a: { name: string }, b: { name: string }) =>
      a.name.localeCompare(b.name)
    );
    firstreallData.value = selData.value;
  });
};
getprlistData();
const detailsData = ref();
const totalCount = ref(0);

const filterReallData = (val: any) => {
  if (param.value.contributeType === 'comment') {
    if (infoFirst.value === 1 && infoSeconed.value === 0) {
      commentType.value = 'normal';
    } else if (infoFirst.value === 0 && infoSeconed.value === 1) {
      commentType.value = 'command';
    } else if (infoFirst.value === 0 && infoSeconed.value === 0) {
      commentType.value = 'noneType';
    } else if (infoFirst.value === 1 && infoSeconed.value === 1) {
      commentType.value = 'all';
    }
    getDetailsData();
  } else {
  }
};

// 显示第几页
const handleCurrentChange = (val: any) => {
  // 改变默认的页数
  if (val?.isTrusted) {
  } else {
    currentPage.value = val;
    getDetailsData();
  }
};

// 图表PR筛选
const contributionSelectBox = ref([
  {
    color: MainPR,
    isSelected: true,
    label: 'key',
    key: 1,
  },
  {
    color: CommonPR,
    isSelected: true,
    label: 'general',
    key: 0,
  },
]);

const changeTage = (item: any) => {
  item.isSelected = !item.isSelected;
  if (item.isSelected && item.key === 0) {
    infoFirst.value = 1;
  } else if (!item.isSelected && item.key === 0) {
    infoFirst.value = 0;
  } else if (item.isSelected && item.key === 1) {
    infoSeconed.value = 1;
  } else if (!item.isSelected && item.key === 1) {
    infoSeconed.value = 0;
  }
  if (infoFirst.value === 1 && infoSeconed.value === 0) {
    commentType.value = 'normal';
  } else if (infoFirst.value === 0 && infoSeconed.value === 1) {
    commentType.value = 'command';
  } else if (infoFirst.value === 0 && infoSeconed.value === 0) {
    commentType.value = 'noneType';
  } else if (infoFirst.value === 1 && infoSeconed.value === 1) {
    commentType.value = 'all';
  }

  getDetailsData();
};

// first搜索过滤
const firstsearchInput = ref();
const firstreallData = ref([] as IObject[]);
const firstquerySearch = () => {
  if (firstsearchInput.value !== '') {
    const newList = selData.value.filter((item: any) =>
      item.name.toLowerCase().includes(firstsearchInput.value)
    );
    firstreallData.value = newList;
  } else {
    firstreallData.value = selData.value;
  }
};
// 清除搜索
const firstclearSearchInput = () => {
  // getDrownData();
  searchInput.value = '';
  // getDrownData();
};

const scrollbarRef = ref<InstanceType<typeof ElScrollbar>>();
const inputSlider = (value: number) => {
  scrollbarRef.value?.setScrollTop(value);
};

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
];
</script>

<template>
  <div class="contributions-statistical">
    <!-- <div class="sel">
      <div class="title">SIG 'filtrate'</div>
      <el-select
        v-model="selvalue"
        :placeholder="'from.all'"
        size="large"
        popper-class="remove-scrollbar"
      >
        <el-input
          v-model="firstsearchInput"
          clearable
          :debounce="300"
          class="w-50 m-2"
          :placeholder="'enterSIG'"
          @input="firstquerySearch"
          @clear="firstclearSearchInput"
        />
        <el-scrollbar class="Escrollbar">
          <el-option :label="'from.all'" value="all" />
          <el-option
            v-for="item in firstreallData"
            :key="item.name"
            :label="item.name"
            :value="item.name"
          />
        </el-scrollbar>
      </el-select>
    </div> -->
    <!-- <div class="line"></div> -->
    <OFormRadio
      v-model="formRadioValue"
      class="right-radio"
      :option="formRadioOption"
      @change="getContributeInfo"
    ></OFormRadio>
  </div>
  <div class="detail">
    <div
      v-if="param.contributeType === 'pr' && reallData?.length"
      class="prType"
    >
      <img :src="CommonPR" alt="" />
      <span class="sp">PR</span>
    </div>
    <div
      v-if="param.contributeType === 'issue' && reallData?.length"
      class="prType"
    >
      <img src="@/assets/!.png" alt="" /> <span class="sp">Issue</span>
    </div>
    <div v-if="param.contributeType === 'comment'" class="prType">
      <div
        v-for="item in commentSelectBox"
        :key="item.label"
        class="color-box"
        style="cursor: pointer"
        @click="changeTage(item)"
      >
        <img :src="item.isSelected ? item.color : noclick" alt="" />
        <span class="sp" :style="{ color: item.isSelected ? '' : '#CCCCCC' }">
          {{ item.label }}
        </span>
      </div>
    </div>

    <div v-if="reallData?.length" class="page">
      <span class="sp"
        >共<span class="num">{{ totalCount }}</span
        >条结果</span
      >
      <span
        >每页显示<span class="num">
          <el-select
            v-model="pageSize"
            class="m-2"
            placeholder="10"
            size="small"
          >
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            /> </el-select></span
        >条</span
      >
    </div>
  </div>
  <div v-if="reallData?.length" v-loading="loading" class="bar-panel">
    <ul class="bar-content">
      <li
        v-for="(item, index) in reallData.sort( (a:any, b:any)=> {
            return a.time < b.time ? 1 : -1;
          })"
        :key="'com' + index"
        class="bar-content-item"
      >
        <div class="index">
          {{ item.time.split('T').slice(0, 1).toString() }}
        </div>
        <div class="infos">
          <div class="infos-img">
            <img
              v-if="param.contributeType === 'pr' && item.is_main_feature === 1"
              src="@/assets/MainPR.png"
              alt=""
            />
            <img
              v-if="param.contributeType === 'pr' && item.is_main_feature === 0"
              src="@/assets/CommonPR.png"
              alt=""
            />
            <img
              v-if="param.contributeType === 'issue'"
              src="@/assets/!.png"
              alt=""
            />
            <img
              v-if="
                param.contributeType === 'comment' &&
                item.is_invalid_comment === 1
              "
              src="@/assets/text.png"
              alt=""
            />
            <img
              v-if="
                param.contributeType === 'comment' &&
                item.is_invalid_comment === 0
              "
              src="@/assets/comment.png"
              alt=""
            />
          </div>
          <div class="infos-text">
            <span v-if="param.contributeType === 'comment'">评论了</span
            ><span v-else>在</span>
            <a
              class="index"
              :href="`https://gitee.com/${item.repo}`"
              target="_blank"
              >{{ item.repo }}</a
            ><span v-if="param.contributeType === 'pr'">创建了Pull Request</span
            ><span v-else-if="param.contributeType === 'issue'">创建了任务</span
            ><span v-else> 'de' Pull Request</span>
            <a :href="item.url" target="_blank" class="rigth-index"
              >!{{ item.no }} {{ item.info }}</a
            >
          </div>
        </div>
      </li>
    </ul>
  </div>
  <!-- <div v-else><o-no-data-image></o-no-data-image></div> -->
  <div class="demo-pagination-block">
    <el-pagination
      v-show="totalCount / pageSize > 1"
      v-model:page-size="pageSize"
      class="o-pagination"
      :current-page="currentPage"
      background
      layout="prev, pager, next,slot, jumper"
      :total="totalCount"
      @current-change="handleCurrentChange"
      ><span>{{ currentPage }}/{{ Math.ceil(totalCount / pageSize) }}</span>
      <!-- <span
        class="el-pagination__jump"
        style="cursor: pointer"
        @click="handleCurrentChange"
        >前往</span
      > -->
    </el-pagination>
    <span v-if="totalCount / pageSize > 1" class="pageSpan">页</span>
  </div>
</template>

<style lang="scss" scoped>
// @import '@/shared/styles/style.scss';
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
}
.bar-content {
  position: relative;
  z-index: 2;
  &-item {
    margin: 16px 0;
    list-style: none;
    .infos {
      font-size: 14px;
      color: #000000;
      line-height: 22px;
      display: grid;
      grid-template-columns: 20px auto;
      &-img {
        display: inline-flex;
        align-items: center;
        margin-right: 3px;
        height: 22px;
      }
      &-text {
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
      }
      .index {
        margin-right: 3px;
        font-size: 14px;
        color: #002fa7;
        margin-left: 3px;
      }
      .rigth-index {
        margin-left: 3px;
        color: #002fa7;
      }
    }
  }
  .index {
    margin-bottom: 4px;
    font-size: 14px;
    font-weight: 400;
    line-height: 24px;
  }
}
.detail {
  display: flex;
  align-items: center;
  position: relative;
  margin-top: 16px;
  .prType {
    display: flex;
    align-items: center;
    .color-box {
      display: flex;
      align-items: center;
      .sp {
        padding-left: 1px;
        font-size: 12px;
        line-height: 18px;
      }
    }
  }
  .sp {
    // width: 69px;
    height: 18px;
    font-size: 14px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: #555555;
    line-height: 18px;
    margin-left: 5px;
    margin-right: 24px;
  }
  .page {
    position: absolute;
    right: 0;
    font-size: 14px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: #555555;
    line-height: 22px;
    .num {
      font-size: 16px;
      font-family: Roboto-Medium, Roboto;
      font-weight: 500;
      color: #000000;
      line-height: 24px;
      padding-left: 2px;
      padding-right: 2px;
    }
  }
}
.sel {
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  .title {
    // width: 122px;
    margin-right: 24px;
  }
}
.line {
  border-bottom: 1px solid #dfe1e8;
  margin-bottom: 18px;
}
.demo-pagination-block {
  margin-top: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.pageSpan {
  height: 36px;
  font-size: 14px;
  font-weight: 400;
  line-height: 22px;
  color: #999999;
  border-radius: 0px;
  margin-left: 0px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
<style lang="scss">
.num {
  .el-select .el-input__inner {
    width: 48px;
    height: 24px;
    margin-right: 2px;
    margin-left: 2px;
  }
}
.sel {
  .el-select .el-input__inner {
    width: 368px;
    height: 32px;
  }
}
.el-select-dropdown__item {
  padding: 0 15px 0 15px;
}
</style>
<style lang="scss">
.o-pagination {
  --o-pagination-font-color: #000000;
  --o-pagination-font-color_active: #002fa7;
  --o-pagination-bg-color: #e5e5e5;
  --o-pagination-bg-color_hover: var(--o-color-brand5);
  --o-pagination-bg-color_selected: var(--o-color-brand5);
  --o-pagination-number-border-color_active: var(--o-color-brand1);

  &.el-pagination {
    justify-content: center;
    @media screen and (max-width: 768px) {
      display: none;
    }
    padding: 2px 0px;
    .el-pagination__sizes {
      margin: 0 0 0 0;
    }
    .el-input {
      --el-input-bg-color: var(--o-pagination-bg-color);
      --el-input-text-color: var(--o-pagination-font-color);
    }
    .el-input__wrapper {
      border-radius: 0px;
      box-shadow: none;
      height: 36px;
    }
    .el-pagination__editor {
      justify-content: center !important;
      margin: 0 8px !important;
      min-width: 56px !important;
    }
    .el-select {
      --el-select-border-color-hover: none;
      --el-select-input-focus-border-color: none;
      & .el-input .el-select__caret {
        color: var(--o-pagination-font-color);
      }
    }
    .el-select-dropdown__wrap {
      background-color: #000 !important;
    }
    .el-pager li {
      color: var(--o-pagination-font-color);
      background: var(--o-pagination-bg-color);
      border-radius: 0px;
      line-height: 36px;
      height: 36px;
      width: 36px;
      &:hover {
        color: #ffffff !important;
        background-color: var(--o-pagination-font-color_active);
      }
    }
    .el-pager li.is-active.number {
      background: var(--o-pagination-font-color_active);
      color: #ffffff !important;
      font-weight: 400;
      font-size: 14px;
    }
    .btn-next,
    .btn-prev {
      width: 36px;
      height: 36px;
      color: var(--o-pagination-font-color);
      border-radius: 0px;
      background: var(--o-pagination-bg-color);
    }
    .btn-prev:disabled {
      background: #e5e5e5;
    }
    .btn-next {
      margin-right: 16px !important;
    }
    .btn-next:disabled {
      background: #e5e5e5;
    }

    .el-pagination__jump {
      height: 36px;
      font-size: 14px;
      font-weight: 400;
      line-height: 22px;
      color: #999999;
      border-radius: 0px;
      margin-left: 6px;
      .el-input__wrapper {
        flex-grow: 0.273;
      }
    }
  }
}
</style>
