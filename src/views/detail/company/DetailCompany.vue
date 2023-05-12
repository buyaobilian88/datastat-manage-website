<template>
  <div class="container">
    <div class="wrap">
      <div class="main">
        <div class="main-left">
          <div class="main-left-top">
            {{ props.user.org }}
          </div>
          <data-show :user="props.user.org"></data-show>
          <div class="circularPile">
            <div class="circularPile-sp">贡献图</div>
            <div
              v-if="
                oechartData.D0 === 0 &&
                oechartData.D1 === 0 &&
                oechartData.D2 === 0
              "
              class="nosp"
            >
              无贡献
            </div>
            <div v-else class="sp">
              <o-echart-circular-pile
                id="circularPile"
                :data="oechartData"
                width="232px"
                height="232px"
              ></o-echart-circular-pile>
            </div>
          </div>
        </div>
        <div class="main-right">
          <div class="Treemap">
            <h3 id="ecological" class="topstafftitle">
              {{ props.user.org }} 技术生态
            </h3>
            <div class="color-box">
              <div
                v-for="item in oechartTreeGroup"
                :key="item.key"
                class="blue-box"
              >
                <div
                  class="box"
                  :style="{ 'background-color': item.color }"
                ></div>
                {{ item.label }}
              </div>
            </div>
            <div class="firstsmalltitle">贡献者数量</div>
            <div v-if="treeData?.length" class="firstTreemap">
              <o-echart-treemap
                id="firstTreemap"
                :value="(oechartTreeValue as any)"
                :group="(oechartTreeGroup as any)"
                :type="'all'"
              ></o-echart-treemap>
            </div>
            <div class="smalltitle">提交贡献</div>
            <div
              v-if="sumPrMerged !== 0 && treeData?.length"
              class="secondTreemap"
            >
              <o-echart-treemap
                id="secondTreemap"
                :value="(oechartSecondTreeValue as any)"
                :group="(oechartTreeGroup as any)"
                :type="'all'"
              ></o-echart-treemap>
            </div>
          </div>
          <div class="contributors-panel">
            <h3 id="SIGContribution" class="sigContribution">
              {{ props.user.org }} SIG贡献
            </h3>
            <table-list :company="props.user.org" />
          </div>
        <div class="lastcontributors-panel"><Contributor :companyName="props.user.org"></Contributor></div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref, watch, computed } from 'vue';
import { processing } from '@/shared/utils/helper';
import { queryCompanyUsers, queryCompanySigDetails } from '@/api/api-detail';
import OEchartCircularPile from '@/components/OEchartCircularPile.vue';
import TableList from './TableList.vue';
import OEchartTreemap from '@/components/OEchartTreemap.vue';
import Contributor from './Contributor.vue'
import DataShow from './DataShow.vue';
const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
});
const oechartData = ref({
  D0: 0,
  D1: 0,
  D2: 0,
});
// 饼图
const getoechartTreeValue = () => {
  const query = {
    company: props.user.org,
    timeRange: 'all',
    community: 'openeuler',
  };
  queryCompanyUsers(query).then((data) => {
    const Data = processing(data?.data || []);
    oechartData.value.D0 = Data.sigData['0'];
    oechartData.value.D1 = Data.sigData['1'];
    oechartData.value.D2 = Data.sigData['2'];
  });
};
// 树图
const treeData = ref([] as any);
const oechartTreeValue = ref([] as any);
const oechartTreeGroup = ref([] as any);
oechartTreeGroup.value = [];
const oechartSecondTreeValue = ref([] as any);
const sumPrMerged = ref(0);
const param = ref({
  company: computed(() => props.user.org),
  timeRange: 'all',
  community: 'openeuler',
});
const getTreeSearchValue = () => {
  queryCompanySigDetails(param.value).then((data) => {
    treeData.value = data?.data;
    const firstTree: any = [];
    const secondTree: any = [];
    treeData.value.map((item: any) => {
      if (item.feature !== 'null') {
        firstTree.push({
          key: '',
          label: item.sig,
          value: item.user,
          group: item.feature,
        });

        secondTree.push({
          key: '',
          label: item.sig,
          value: item.contribute,
          group: item.feature,
        });
      }
    });
    oechartTreeValue.value = firstTree;
    oechartSecondTreeValue.value = secondTree;
    sumPrMerged.value = secondTree.reduce((pre, next) => pre + next.value, 0);
    const colorArr = [
      '#002FA7',
      '#FEB32A',
      '#4AAEAD',
      '#FC756C',
      '#A4DAFF',
      '#6236FF',
      '#3165F3',
      '#00BB85',
      '#F9762D',
      '#7400A5',
      '#1B7FCA',
      '#00685A',
      '#AC481C',
    ];
    oechartTreeGroup.value = oechartTreeValue.value
      .reduce((pre, next) => {
        const findone = pre.find((item: any) => item.group === next.group);
        if (findone) {
          findone.num += next.value;
        } else if (next.group !== ''&& next.group) {
          pre.push({
            group: next.group,
            num: next.value,
          });
        }
        return pre;
      }, [])
      .sort((a: any, b: any) => b.num - a.num)
      .map((item: any, index: any) => ({
        key: item.group,
        label: item.group,
        color: colorArr[index],
      }));
  });
};
const getAllData = () => {
  getoechartTreeValue();
  getTreeSearchValue();
};
watch(
  () => props.user.org,
  () => getAllData(),
  { immediate: true }
);
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
  grid-template-columns: 20% 70%;
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
