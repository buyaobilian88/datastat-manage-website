<template>
  <div class="edropdown">
    <el-dropdown placement="bottom-start">
      <div class="main-left-title">
        {{ timeTitle }}的贡献
        <span class="btnc"></span>
      </div>
      <template #dropdown>
        <el-dropdown-item
          v-for="item in timeRange"
          :key="item.value"
          class="dropdownItem"
          @click="clickDrownItem(item)"
        >
          {{ item.label }}的贡献</el-dropdown-item
        >
      </template>
    </el-dropdown>
  </div>
  <div class="left-first">
    <div class="left-first-child">
      <span :title="`${'Mergerequest'} PR`">合并请求 PR</span>
      <div class="left-first-child-data">
        {{ toThousands(mergeRequest) }}
      </div>
    </div>
    <div class="left-first-child">
      <span :title="`${'NeedsProblems'} Issue`">需求&问题 Issue</span>
      <div class="left-first-child-data">
        {{ toThousands(issueData) }}
      </div>
    </div>
    <div class="left-first-child">
      <span :title="`${'review'} Comment`">评审 Comment</span>
      <div class="left-first-child-data">
        {{ toThousands(comment) }}
      </div>
    </div>
    <div class="left-first-child">
      <span :title="`${'SIGNumber'}`">SIG数量</span>
      <div class="left-first-child-data">
        {{ toThousands(contributors) }}
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { toRefs, ref, onMounted, watch } from 'vue';
import {
  queryCompanyUsers,
  queryCompanyUserContribute,
} from '@/api/api-detail';
import { toThousands, processing } from '@/shared/utils/helper';
interface IObject<T = any> {
  [key: string]: T;
}
const props = defineProps({
  user: {
    type: String,
    required: true,
    default: '',
  },
});
const { user } = toRefs(props);
const mergeRequest = ref(0);
const issueData = ref(0);
const comment = ref(0);
const contributors = ref(0);
const timeRange = [
  {
    label: '最近一个月',
    value: 'lastonemonth',
  },
  { label: '最近半年', value: 'lasthalfyear' },
  { label: '最近一年', value: 'lastoneyear' },
  { label: '全部', value: 'all' },
];
const time = ref('');
const getItemListData = (data: IObject[], template: string) => {
  return data.reduce((sum, e) => sum + Number(e[template]), 0);
};
const getprlistData = () => {
  const query = {
    company: user.value,
    timeRange: time.value,
    community: 'openeuler',
    contributeType: 'pr',
  };
  queryCompanyUserContribute(query).then((data: any) => {
    const value = data?.data || [];
    mergeRequest.value = getItemListData(value, 'contribute');
    // mergeRequest.value = value.totalCount;
  });
};
const siglistData = () => {
  const query = {
    company: user.value,
    timeRange: time.value,
    community: 'openeuler',
    contributeType: 'pr',
  };
  queryCompanyUsers(query).then((data: any) => {
    const Data = processing(data?.data || []);
    contributors.value = Data.sigData['0'];
  });
};

const getissuelistData = () => {
  const query = {
    company: user.value,
    timeRange: time.value,
    community: 'openeuler',
    contributeType: 'issue',
  };
  queryCompanyUserContribute(query).then((data: any) => {
    const value = data?.data || [];
    issueData.value = getItemListData(value, 'contribute');
    // issueData.value = value.totalCount;
  });
};

const getcommentlistData = () => {
  const query = {
    company: user.value,
    timeRange: time.value,
    community: 'openeuler',
    contributeType: 'comment',
  };
  queryCompanyUserContribute(query).then((data: any) => {
    const value = data?.data || [];
    comment.value = getItemListData(value, 'contribute');
    // comment.value = value.totalCount;
  });
};
// const getcontributeListData = () => {
//   const query = {
//     company: company.value,
//     timeRange: time.value,
//     community: 'openeuler',
//   };
//   queryCompanyUsers(query).then((data) => {
//     const Data = processing(data?.data || []);
//     contributors.value = Data.sigData['0'];
//   });
// };
const getAllData = () => {
  getprlistData();
  getissuelistData();
  getcommentlistData();
  siglistData();
  // getcontributeListData();
};
watch(
  () => user.value,
  () => {
    getAllData();
  }
);
const timeTitle = ref('');
const clickDrownItem = (item: IObject) => {
  time.value = item.value;
  timeTitle.value = item.label;
  getAllData();
};
onMounted(() => {
  time.value = 'all';
  timeTitle.value = '全部';
  getAllData();
});
</script>
<style scoped lang="scss">
.left-first {
  width: 370px;
  height: 176px;
  display: flex;
  flex-wrap: wrap;
  margin-top: 24px;
  &-child {
    text-align: center;
    width: 180px;
    height: 80px;
    font-size: 16px;
    font-family: HarmonyOS_Sans_SC;
    color: #4e5865;
    line-height: 24px;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    &-data {
      font-size: 40px;
      font-family: HarmonyOS_Sans_SC;
      color: #000000;
      line-height: 48px;
    }
  }
}
.btnc {
  background-image: url('@/assets/linedown.png');
  width: 24px;
  height: 24px;
  margin-left: 8px;
}
.main-left-title {
  display: flex;
  // width: 160px;
  height: 24px;
  font-size: 16px;
  font-family: PingFangSC-Medium, PingFang SC;
  font-weight: 500;
  color: #000000;
  line-height: 24px;
  align-items: center;
}
.edropdown {
  margin-top: 24px;
}
</style>
