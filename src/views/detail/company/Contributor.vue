<template>
  <div class="lastcontributors-panel">
    <h3 id="staffContributor" class="stafftitle">
      {{ `${props.companyName} 员工贡献` }}
    </h3>
    <div class="theSecondForm">
      <OFormRadio
        v-model="formRadioValue"
        class="right-radio"
        :option="formRadioOption"
        @change="getContributeInfo"
      ></OFormRadio>
    </div>
    <div class="edcolor-box">
      <div class="blue-box">
        <div class="box">TC</div>
        Committee
      </div>
      <div class="yellow-box">
        <div class="box">Maintainer</div>
        SIG Maintainer
      </div>
      <div class="red-box">
        <div class="box">Committer</div>
        SIG Committer
      </div>
    </div>

    <div class="ranking-list">
      <div class="ranking-list-item">
        <p class="caption"></p>
        <el-table
          v-loading="loading"
          :data="reallListData.slice((currentPage - 1) * 10, currentPage * 10)"
          style="width: 100%"
        >
          <el-table-column
            prop="rank"
            align="center"
            :label="'编号'"
            width="120"
          />
          <el-table-column
            prop="gitee_id"
            align="left"
            label="Gitee ID"
            show-overflow-tooltip
            width="400"
            ><template #default="scope">
              <div class="usertype-box">
                <span class="num"
                  ><span
                    :style="{
                      cursor: 'pointer',
                    }"
                    >{{ scope.row.gitee_id }}</span
                  ><span v-if="scope.row.is_TC_owner" class="TCbox">TC</span
                  ><span
                    v-if="scope.row.usertype === 'committers'"
                    class="usertypecolorbox"
                    :style="({
                              '--color': '225deg, #FEB32A 0%, #F6D365 100%',
                            } as any)"
                    >Committer</span
                  ><span
                    v-if="scope.row.usertype === 'maintainers'"
                    class="usertypecolorbox"
                    :style="({
                              '--color': '45deg, #005CD3 0%, #002FA7 100%',
                            } as any)"
                    >Maintainer
                  </span>
                </span>
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
    <div class="demo-pagination-block">
      <el-pagination
        v-show="reallListData.length > 10"
        class="o-pagination"
        :current-page="currentPage"
        :page-size="10"
        background
        layout="prev, pager, next,slot, jumper"
        :total="reallListData.length"
        @current-change="handleCurrentChange"
        ><span
          >{{ currentPage }}/{{ Math.ceil(reallListData.length / 10) }}</span
        >
      </el-pagination>
      <span
        v-if="reallListData.length > 10"
        class="el-pagination el-pagination__jump"
        >页</span
      >
    </div>
  </div>
</template>
<script setup lang="ts">
import { queryCompanyUserContribute } from '@/api/api-detail';
import { ref, computed, watch, onMounted } from 'vue';
import { FormRadioConfig } from '@/shared/formRadio.interface';
import { sortExp } from '@/shared/utils/helper';
import OFormRadio from '@/components/OFormRadio.vue';
import TheProgress from '@/components/TheProgress.vue';
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
const props = defineProps({
  companyName: {
    type: String,
    required: true,
    default: '',
  },
});
const reallListData = ref([]);
const memberMax = ref(0);
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
const param = ref({
  community: 'openeuler',
  contributeType: 'pr',
  timeRange: 'all',
  company: computed(() => props.companyName),
});
const memberData = ref([]);
const getData = () => {
  queryCompanyUserContribute(param.value).then((res) => {
    const { data } = res;
    const userList = data.sort(sortExp('contribute', false));
    if (userList.length === 0) {
      memberMax.value = 0;
      memberData.value = [];
    } else {
      memberMax.value = userList[0].contribute;
      memberData.value = userList.map((item: any, index: any) => ({
        ...item,
        rank: index + 1,
      }));
      reallListData.value = memberData.value;
    }
  });
};
const getContributeInfo = () => {
  param.value.contributeType = formRadioValue.value.metrics;
  param.value.timeRange = formRadioValue.value.operation;
  getData();
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
  () => props.companyName,
  () => {
    getData();
  },
  { immediate: true }
);
const loading = ref(true);
onMounted(() => {
  loading.value = false;
});
const componentName = 'staff';
</script>
<style lang="scss" scoped>
@import '@/shared/styles/style.scss';
.container {
  margin-top: 80px;
  min-height: 900px;
  background-color: #f5f6f8;
}
.step {
  padding: 40px 0;
  font-size: 12px;
  &-one {
    color: #002fa7;
    cursor: pointer;
  }
  &-two {
    color: #555555;
  }
}
.main {
  display: grid;
  grid-template-columns: 28% 72%;
  &-left {
    padding-right: 24px;
  }
  &-left-title {
    font-size: 24px;
    font-family: HarmonyOS_Sans_SC_Medium;
    color: #002fa7;
    line-height: 32px;
    text-overflow: ellipsis;
    width: 350px;
    white-space: nowrap;
    overflow: hidden;
  }
  &-left-top {
    display: flex;
    position: relative;
    margin-bottom: 72px;
  }
}

.circularPile {
  margin-top: 60px;
  margin-bottom: 60px;
  &-sp {
    width: 280px;
    height: 24px;
    font-size: 16px;
    font-family: HarmonyOS_Sans_SC;
    color: #000000;
    line-height: 24px;
  }
  .nosp {
    margin-top: 8px;
    font-size: 14px;
    color: #555555;
    line-height: 22px;
  }
  .sp {
    margin-top: 16px;
  }
}
.edropdown {
  position: absolute;
  right: 10px;
}
.firstTreemap {
  padding: 24px;
}
.secondTreemap {
  padding: 24px;
}
.contributors-panel {
  padding: 24px;
  background: #fff;
  margin-top: 60px;
  .title {
    font-size: 24px;
    color: #000;
    font-weight: normal;
    margin-bottom: 20px;
  }
}
.Treemap {
  background-color: #ffffff;
}
.theFirstForm {
  // padding-top: 10px;
  padding-left: 24px;
}
.theSecondForm {
  padding-left: 24px;
  padding-right: 24px;
}
.ranking-list {
  display: grid;
  grid-template-columns: 100%;
  padding-left: 24px;
  padding-right: 24px;
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
    align-items: left;
    .num {
      // width: 200px;
      text-align: left;
      display: flex;
      align-items: center;
      color: #002fa7;
      .TCbox {
        display: inline-block;
        width: 32px;
        height: 22px;
        background: linear-gradient(45deg, #b461f6 0%, #7d32ea 100%);
        border-radius: 2px;
        font-size: 10px;
        font-family: HarmonyOS_Sans_SC;
        color: #ffffff;
        line-height: 12px;
        margin-left: 5px;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }
  }
}
.stafftitle {
  padding-left: 24px;
  padding-top: 24px;
  margin-bottom: 22px;
  margin-top: 22px;
  font-size: 16px;
  font-family: HarmonyOS_Sans_SC;
  color: #000000;
  line-height: 24px;
}
.sigContribution {
  font-size: 16px;
  font-family: HarmonyOS_Sans_SC;
  color: #000000;
  line-height: 24px;
  margin-bottom: 22px;
}
.topstafftitle {
  padding: 24px;
  font-size: 16px;
  font-family: HarmonyOS_Sans_SC;
  color: #000000;
  line-height: 24px;
}
.smalltitle {
  margin-bottom: 8px;
  margin-top: 8px;
  margin-left: 24px;
  width: 280px;
  font-size: 16px;
  font-family: HarmonyOS_Sans_SC;
  color: #000000;
  line-height: 24px;
}
.color-box {
  display: inline-block;
  margin-left: 24px;
  padding-bottom: 16px;
  padding-top: 19px;
  .blue-box {
    margin-right: 24px;
    height: 18px;
    font-size: 12px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: #555555;
    line-height: 18px;
    display: inline-block;
    .box {
      width: 12px;
      height: 12px;
      background: #002fa7;
      margin-right: 8px;
      display: inline-block;
    }
  }
}
.edcolor-box {
  display: flex;
  margin-left: 24px;
  padding-bottom: 20px;

  .blue-box {
    margin-right: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
    .box {
      width: 32px;
      height: 22px;
      background: linear-gradient(45deg, #b461f6 0%, #7d32ea 100%);
      border-radius: 2px;
      font-size: 10px;
      font-family: HarmonyOS_Sans_SC;
      color: #ffffff;
      line-height: 12px;
      text-align: center;
      margin-right: 8px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
  .yellow-box {
    margin-right: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
    .box {
      width: 73px;
      height: 22px;
      background: linear-gradient(45deg, #005cd3 0%, #002fa7 100%);
      border-radius: 2px;
      font-size: 10px;
      font-family: HarmonyOS_Sans_SC;
      color: #ffffff;
      line-height: 12px;
      text-align: center;
      margin-right: 8px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
  .red-box {
    margin-right: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
    .box {
      width: 72px;
      height: 22px;
      background: linear-gradient(225deg, #feb32a 0%, #f6d365 100%);
      border-radius: 2px;
      font-size: 10px;
      font-family: HarmonyOS_Sans_SC;
      color: #ffffff;
      line-height: 12px;
      text-align: center;
      margin-right: 8px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
}
.demo-pagination-block {
  margin-top: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.usertypecolorbox {
  margin-left: 5px;
  background: linear-gradient(var(--color));
  border-radius: 2px;
  font-size: 10px;
  font-family: HarmonyOS_Sans_SC;
  color: #ffffff;
  line-height: 12px;
  height: 16px;
  width: 73px;
  height: 22px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.searchInput {
  width: 350px;
  margin: 10px;
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
}
.searchListInput {
  width: 88%;
  margin-left: 86px;
  margin-top: -16px;
  margin-bottom: 20px;

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
.btnc {
  background-image: url('@/assets/down.png');
  width: 24px;
  height: 24px;
  position: absolute;
  right: -15px;
}
.lastcontributors-panel {
  padding-bottom: 24px;
  background: #fff;
  margin-top: 60px;
  // margin-bottom: 60px;
  .title {
    font-size: 24px;
    color: #000;
    font-weight: normal;
    margin-bottom: 20px;
  }
}
.firstsmalltitle {
  margin-left: 24px;
  width: 280px;
  font-size: 16px;
  font-family: HarmonyOS_Sans_SC;
  color: #000000;
  line-height: 24px;
}
.dropdownItem {
  color: #b461f6;
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
