<script setup lang="ts">
import TheProgress from '@/components/TheProgress.vue';
import OFormRadio from '@/components/OFormRadio.vue';
import { ref, computed, watch, onMounted } from 'vue';
import { querySigUserContribute } from '@/api/api-detail';
import { sortExp } from '@/shared/utils/helper';
import { FormRadioConfig } from '@/shared/formRadio.interface';
// import IconUser from '~icons/app/search';
// import OIcon from 'shared/components/OIcon.vue';
// import ONoDataImage from 'shared/components/ONoDataImage.vue';
interface IObject<T = any> {
  [key: string]: T;
}
const props = defineProps({
  sig: {
    type: String,
    required: true,
    default: '',
  },
});
const formRadioValue = ref({
  metrics: 'pr',
  operation: 'all',
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
];
const contributionSelectBox = ref([
  {
    color: '#002fa7',
    isSelected: true,
    label: 'Maintainer',
    key: 'maintainers',
  },
  { color: '#feb32a', isSelected: true, label: 'Committer', key: 'committers' },
  {
    color: '#4aaead',
    isSelected: true,
    label: 'Contributor',
    key: 'contributor',
  },
]);
const filterReallData = () => {
  reallData.value = reallData.value.filter((item) => {
    return contributionSelectBox.value.some((it) => {
      return it.isSelected && item.usertype === it.key;
    });
  });
};
const reallData = ref([] as IObject[]);
const param = ref({
  contributeType: 'pr',
  timeRange: 'all',
  community: 'openeuler',
  sig: computed(() => props.sig),
} as IObject);
const memberData = ref([]);
const memberMax = ref(0);
const searchInput = ref('');
const getMemberData = () => {
  querySigUserContribute(param.value).then((data) => {
    const memberList = data?.data?.sort(sortExp('contribute', false)) || [];
    if (memberList.length === 0) {
      memberMax.value = 0;
      memberData.value = [];
    } else {
      memberMax.value = memberList[0].contribute;
      memberData.value = memberList.map((item: any, index: any) => ({
        ...item,
        rank: index + 1,
      }));
      reallData.value = memberData.value;
    }
    filterReallData();
    currentPage.value = 1;
  });
};

// theform组件调用
const componentName = 'member';
const loading = ref(true);
const getContributeInfo = () => {
  param.value.contributeType = formRadioValue.value.metrics;
  param.value.timeRange = formRadioValue.value.operation;
  getMemberData();
  switchType();
};
const typeLable = ref('');
const switchType = () => {
  switch (param.value.contributeType) {
    case 'pr':
      typeLable.value = '合并请求PR';
      break;
    case 'issue':
      typeLable.value = '需求&问题Issue';
      break;
    case 'comment':
      typeLable.value = '评审Comment';
      break;
  }
};
switchType();
watch(
  () => props.sig,
  () => {
    getMemberData();
  },
  { immediate: true }
);
onMounted(() => {
  loading.value = false;
});
// 默认显示第1页
const currentPage = ref(1);
// 显示第几页
const handleCurrentChange = (val: any) => {
  // 改变默认的页数
  if (val?.isTrusted) {
  } else {
    currentPage.value = val;
  }
};
// 搜索过滤

const querySearch = () => {
  if (searchInput.value !== '') {
    const newList = memberData.value.filter((item: any) =>
      item.gitee_id.toLowerCase().includes(searchInput.value)
    );
    reallData.value = newList;
    filterReallData();
  } else {
    getMemberData();
  }
};

// 按颜色过滤
const getcontributeValue = (item: any) => {
  item.isSelected = !item.isSelected;
  querySearch();
};
</script>
<template>
  <div>
    <div class="theSecondForm">
      <OFormRadio
        v-model="formRadioValue"
        class="right-radio"
        :option="formRadioOption"
        @change="getContributeInfo"
      ></OFormRadio>
    </div>
    <div class="edcolor-box">
      <div
        v-for="value in contributionSelectBox"
        :key="value.label"
        class="yellow-box"
        style="cursor: pointer"
        @click="getcontributeValue(value)"
      >
        <div
          class="box"
          :style="{
            'background-color': value.isSelected ? value.color : '#cccccc',
          }"
        ></div>
        <span
          :style="{
            color: value.isSelected ? '' : '#cccccc',
          }"
          >{{ value.label }}</span
        >
      </div>
    </div>
    <div class="leader">
      <div class="leader-box">Leader</div>
      <span>SIG Leader</span>
    </div>
    <div v-if="reallData?.length" class="ranking-list">
      <div class="ranking-list-item">
        <p class="caption"></p>
        <el-table
          v-loading="loading"
          :data="reallData.slice((currentPage - 1) * 10, currentPage * 10)"
          style="width: 100%"
        >
          <el-table-column
            prop="rank"
            align="center"
            :label="'数量'"
            width="120"
          />
          <el-table-column
            prop="gitee_id"
            align="left"
            label="Gitee ID"
            show-overflow-tooltip
            width="300"
            ><template #default="scope">
              <div class="usertype-box">
                <span
                  v-show="scope.row.usertype !== 'committers'"
                  class="usertypecolorbox"
                  :style="({
                    '--color':
                      scope.row.usertype === 'maintainers'
                        ? '#002FA7'
                        : '#4AAEAD',
                  } as any)"
                ></span>
                <span
                  v-show="scope.row.usertype === 'committers'"
                  class="usertypecolorbox"
                  :style="({
                    '--color': '#FEB32A',
                  } as any)"
                ></span>
                <span
                  class="num"
                  :style="{
                    cursor: 'pointer',
                  }"
                  >{{ scope.row.gitee_id }}</span
                >
              </div>
            </template>
          </el-table-column>
          <el-table-column
            align="left"
            class-name="type-label"
            :label="typeLable"
          >
            <template #default="scope">
              <div class="box">
                <span class="num">{{ scope.row.contribute }}</span>

                <the-progress
                  :item="scope.row.contribute"
                  :component-name="componentName"
                  :member-list="memberMax"
                  :usertype="scope.row.usertype"
                ></the-progress>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <!-- <div v-else><o-no-data-image></o-no-data-image></div> -->
    <div class="demo-pagination-block">
      <el-pagination
        v-show="reallData.length > 10"
        class="o-pagination"
        :current-page="currentPage"
        :page-size="10"
        background
        layout="prev, pager, next,slot, jumper"
        :total="reallData.length"
        @current-change="handleCurrentChange"
        ><span>{{ currentPage }}/{{ Math.ceil(reallData.length / 10) }}</span>
      </el-pagination>
      <span
        v-if="reallData.length > 10"
        class="el-pagination el-pagination__jump"
        >页</span
      >
    </div>
  </div>
</template>
<style scoped lang="scss">
@import '@/shared/styles/style.scss';
.ranking-list {
  display: grid;
  grid-template-columns: 100%;
  // padding-right: 24px;
  :deep(.el-scrollbar__bar.is-horizontal) {
    height: 0px;
  }
  .caption {
    font-size: 16px;
    color: #000;
    line-height: 24px;
    margin-bottom: 8px;
  }
  .box {
    display: flex;
    .num {
      width: 50px;
      text-align: right;
    }
  }
  .usertype-box {
    display: flex;
    align-items: center;
    .num {
      width: 100px;
      text-align: left;
      color: #002fa7;
    }
  }
}
.edcolor-box {
  display: flex;
  padding-bottom: 10px;

  .blue-box {
    margin-right: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
    .box {
      width: 12px;
      height: 12px;
      background: #002fa7;
      border-radius: 50%;
      margin-right: 8px;
    }
    .nobox {
      width: 12px;
      height: 12px;
      background: #000;
      border-radius: 50%;
      margin-right: 8px;
    }
  }
  .yellow-box {
    margin-right: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
    .box {
      width: 12px;
      height: 12px;

      background: #feb32a;
      border-radius: 2px;
      font-size: 10px;
      font-family: HarmonyOS_Sans_SC;
      color: #ffffff;
      line-height: 12px;
      text-align: center;
      margin-right: 8px;
      border-radius: 50%;
    }
  }
  .red-box {
    margin-right: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
    .box {
      width: 12px;
      height: 12px;
      background: #4aaead;
      border-radius: 2px;
      font-size: 10px;
      font-family: HarmonyOS_Sans_SC;
      color: #ffffff;
      line-height: 12px;
      text-align: center;
      margin-right: 8px;
      border-radius: 50%;
    }
  }
}
.demo-pagination-block {
  margin-top: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.usertypecolorbox {
  width: 12px;
  height: 12px;
  // background: linear-gradient(var(--color));
  background: var(--color);
  border-radius: 50%;
  margin-right: 8px;
}
.leader {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  &-box {
    width: 54px;
    height: 22px;
    background: #0062dc;
    border-radius: 2px;
    color: #ffffff;
    margin-right: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 12px;
    font-family: Helvetica-Light, Helvetica;
    font-weight: 300;
  }
}
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
