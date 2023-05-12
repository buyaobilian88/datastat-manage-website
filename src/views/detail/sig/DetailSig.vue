<script setup lang="ts">
import { ref, onMounted, watch, computed, nextTick } from 'vue';
import TableList from './TableList.vue';
import ContributList from './ContributList.vue';
import { getSigScore, querySigInfo } from '@/api/api-detail';
import VisualIndex from './VisualIndex.vue';
interface IObject<T = any> {
  [key: string]: T;
}
const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
});
const getAllData = () => {
  querySigInfoData();
  // querySorceData();
};

// 获取活力指数
const sorceData = ref({} as IObject);
const querySorceData = () => {
  const param = {
    community: 'openeuler',
    sig: 'aaa',
    timeRange: 'lastonemonth',
  };
  getSigScore(param).then((data) => {
    sorceData.value = data.data.pop();
  });
};
// querySorceData()
// 获取侧边栏明细
const sigInfo = ref({
  mailing_list: '',
} as IObject);
const querySigInfoData = () => {
  const params = {
    community: 'openeuler',
    sig: props.user.org,
  };
  querySigInfo(params).then((data) => {
    sigInfo.value = data?.data[0] || {};
  });
};
watch(
  () => props.user.org,
  () => getAllData(),
  { immediate: true }
);
</script>
<template>
  <div class="container">
    <div class="wrap">
      <div class="main">
        <div class="main-left">
          <div class="main-left-top">
            <div class="edropdown">
              <div class="main-left-title">
                {{ props.user.org }}
              </div>
            </div>
          </div>
          <div class="main-left-sp">
            <div class="slogan">
              {{ sigInfo.description === '.' ? '' : sigInfo.description }}
            </div>
            <div class="first">
              <div class="home"></div>
              <div class="toHome">
                <a
                  style="color: #002fa7"
                  target="_blank"
                  :href="`https://gitee.com/openeuler/community/tree/master/sig/${props.user.org}`"
                >
                  前往首页</a
                >
              </div>
            </div>
            <div class="first">
              <div class="email"></div>
              <div class="List">
                <span>邮件列表：</span>
                <a
                  v-if="sigInfo.mailing_list"
                  :href="`https://mailweb.openeuler.org/postorius/lists/${
                    sigInfo.mailing_list.split('@')[0]
                  }.${sigInfo.mailing_list.split('@')[1]}`"
                  class="item"
                  target="_blank"
                >
                  {{
                    sigInfo.mailing_list === 'NA' ? '' : sigInfo.mailing_list
                  }}
                </a>
              </div>
            </div>
            <div class="first">
              <div class="Maintainer"></div>
              <div class="List">
                <span>Maintainers： </span>
                <a
                  v-for="item in sigInfo.maintainers"
                  :key="item.value"
                  class="item"
                  target="_blank"
                  :href="`https://gitee.com/${item}`"
                >
                  @{{ item }}
                </a>
              </div>
            </div>
            <div class="first">
              <div class="Mentor"></div>
              <div class="List">
                <span>Mentors：</span>
                <span
                  v-for="item in sigInfo.mentor"
                  :key="item.value"
                  class="item"
                >
                  {{ item }}
                </span>
                <span v-if="!sigInfo.mentor" class="noitem"> 暂无Mentor </span>
              </div>
            </div>
            <div class="first">
              <div class="store"></div>
              <div class="List">
                <span>仓库：</span>
                <div class="atlas">
                  <a
                    v-for="item in sigInfo.repos"
                    :key="item"
                    class="item"
                    :href="`https://gitee.com/${item}`"
                    target="_blank"
                  >
                    ./{{ item }}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="main-right">
          <div>
            <!-- <visual-index
              :sencond-title="props.user.org"
              :sorce-data="sorceData"
            ></visual-index> -->
          </div>

          <!-- <div class="contributors-panel">
            <h3 id="historicalVitalityIndicators" class="title">
              {{ sencondTitle + ' ' + t('historicalVitalityIndicators') }}
            </h3>
            <historical-trend :sig="sencondTitle"></historical-trend>
          </div> -->
          <div class="contributors-panel">
            <h3 id="companyContributor" class="title">
              {{ props.user.org }} 贡献
            </h3>
            <table-list :sig="props.user.org" />
          </div>
          <div class="contributors-panel-last">
            <h3 id="userContributor" class="title">
              {{ props.user.org }} 个人会员贡献
            </h3>
            <contribut-list :sig="props.user.org"></contribut-list>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.contributors-panel {
  padding: 24px;
  background: #fff;
  margin-bottom: 24px;
  .title {
    font-size: 16px;
    color: #000;
    font-weight: 600;
    margin-bottom: 24px;
  }
  .img {
    display: flex;
  }
}
.contributors-panel-last {
  padding: 24px;
  background: #fff;
  // margin-bottom: 24px;
  .title {
    font-size: 16px;
    color: #000;
    font-weight: 600;
    margin-bottom: 24px;
  }
  .img {
    display: flex;
  }
}
.container {
  // margin-top: 80px;
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
    .edropdown {
      .btnc {
        background-image: url('@/assets/down.png');
        width: 24px;
        height: 24px;
        position: absolute;
        right: -15px;
      }
    }
    &-title {
      font-size: 24px;
      font-family: HarmonyOS_Sans_SC_Medium;
      color: #002fa7;
      line-height: 32px;
      text-overflow: ellipsis;
      width: 350px;
      white-space: nowrap;
      overflow: hidden;
    }
    &-top {
      display: flex;
      position: relative;
    }
    &-sp {
      display: flex;
      flex-direction: column;
      margin-top: 24px;
      .first {
        margin-top: 18px;
        display: flex;
        position: relative;
        .toHome {
          padding-top: 3px;
          color: #002fa7;
          cursor: pointer;
        }
        .List {
          padding-top: 3px;
          display: flex;
          flex-direction: column;
          .item {
            margin-top: 8px;
            font-size: 14px;
            font-family: HarmonyOS_Sans_SC_Medium;
            color: #002fa7;
            line-height: 22px;
          }
        }
        .home {
          background-image: url('@/assets/home-outlined.png');
          width: 24px;
          height: 24px;
          margin-right: 8px;
        }
        .email {
          background-image: url('@/assets/email.png');
          width: 24px;
          height: 24px;
          margin-right: 8px;
        }
        .IRC {
          background-image: url('@/assets/chat.png');
          width: 24px;
          height: 24px;
          margin-right: 8px;
        }
        .Maintainer {
          background-image: url('@/assets/use-square.png');
          width: 24px;
          height: 24px;
          margin-right: 8px;
        }
        .Mentor {
          background-image: url('@/assets/user.png');
          width: 24px;
          height: 24px;
          margin-right: 8px;
        }
        .store {
          background-image: url('@/assets/cube.png');
          width: 24px;
          height: 24px;
          margin-right: 8px;
        }
      }
    }
  }
}
.rank {
  font-size: 12px;
  color: #4e5865;
  line-height: 16px;
  &-num {
    font-size: 40px;
    color: #000000;
  }
}

.stafftitle {
  padding-left: 24px;
  margin-bottom: 22px;
  margin-top: 22px;
  font-size: 16px;
  font-family: HarmonyOS_Sans_SC;
  color: #000000;
  line-height: 24px;
}
.topstafftitle {
  padding: 24px;
  font-size: 16px;
  font-family: HarmonyOS_Sans_SC;
  color: #000000;
  line-height: 24px;
}
.smalltitle {
  margin-bottom: 20px;
  margin-left: 20px;
  width: 280px;
  height: 24px;
  font-size: 16px;
  font-family: HarmonyOS_Sans_SC;
  color: #000000;
  line-height: 24px;
}
.color-box {
  display: flex;
  margin-left: 20px;
  padding-bottom: 20px;
  .blue-box {
    margin-right: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
    .box {
      width: 12px;
      height: 12px;
      background: #002fa7;
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
      margin-right: 8px;
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
      margin-right: 8px;
    }
  }
  .green-box {
    margin-right: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
    .box {
      width: 12px;
      height: 12px;
      background: #fc756c;
      margin-right: 8px;
    }
  }
}
.atlas {
  // width: 350px;
  display: flex;
  flex-direction: column;
  margin-bottom: 24px;
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
.noitem {
  margin-top: 8px;
  font-size: 14px;
  font-family: HarmonyOS_Sans_SC_Medium;
  line-height: 22px;
}
</style>
