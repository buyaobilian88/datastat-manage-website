<template>
  <div class="container">
    <div class="wrap">
      <div class="main">
        <div class="main-left">
          <div class="main-left-sp">
            <!-- <div class="userInfo">
              <div class="title">个人简介</div>
            </div> -->
            <div class="first">
              <div class="home"></div>
              <div class="toHome">
                <a
                  style="color: #002fa7"
                  target="_blank"
                  :href="`https://gitee.com/${props.user.org}`"
                >
                  前往主页</a
                >
              </div>
            </div>
            <div class="firstLast">
              <div class="Maintainer"></div>
              <div class="List">
                <span>社区角色： </span>
                <span v-for="items in sigInfo" :key="items.value" class="item">
                  <span
                    v-if="items.sig === 'TC'"
                    class="usertypecolorboxTC"
                    :style="({
                              '--color': '45deg, #B461F6 0%, #7D32EA 100%',
                            } as any)"
                    >TC</span
                  >
                  <span v-if="items.sig !== 'TC'" style="cursor: pointer">{{
                    items.sig
                  }}</span>

                  <span v-for="item in items.type" :key="item.value"
                    ><span
                      v-if="item === 'committers'"
                      class="usertypecolorbox"
                      :style="({
                              '--color': '225deg, #FEB32A 0%, #F6D365 100%',
                            } as any)"
                      >Committer</span
                    ><span
                      v-if="item === 'maintainers' && items.sig !== 'TC'"
                      class="usertypecolorbox"
                      :style="({
                              '--color': '45deg, #005CD3 0%, #002FA7 100%',
                            } as any)"
                      >Maintainer
                    </span></span
                  >
                </span>
              </div>
            </div>
            <data-show :user="props.user.org"></data-show>
          </div>
        </div>
        <div class="main-right">
          <div class="contributors-panel">
            <h3 id="SIGContribution" class="title">
              {{ props.user.org }} SIG贡献
            </h3>
            <sig-contribution :user="props.user.org"></sig-contribution>
          </div>
          <div class="contributors-panel-last">
            <h3 id="DynamicContribute" class="title">
              {{ props.user.org }} 贡献动态
            </h3>
            <contribution-dynamic :sig="props.user.org"></contribution-dynamic>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { queryUserList, queryUserOwnertype } from '@/api/api-detail';
import { ref, onMounted, watch, reactive, toRefs, computed } from 'vue';
import DataShow from './DataShow.vue';
import SigContribution from './SigContribution.vue';
import ContributionDynamic from './ContributionDynamic.vue';
const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
});
interface IObject<T = any> {
  [key: string]: T;
}
// 获取侧边栏明细
const sigInfo = ref({
  mailing_list: '',
} as IObject);
const querySigInfoData = () => {
  const params = {
    community: 'openeuler',
    user: 'jwzhangcn',
  };
  queryUserOwnertype(params).then((data) => {
    sigInfo.value = data?.data || {};
    sigInfo.value?.sort((a: any, b: any) =>
      a['sig'].localeCompare(b['sig'], 'zh')
    );
    sigInfo.value.forEach((item: any, index: any) => {
      if (item.sig === 'TC') {
        sigInfo.value.unshift(sigInfo.value.splice(index, 1)[0]);
      }
    });
    sigInfo.value.map((item: any) =>
      item.type.sort((a: any, b: any) => b.length - a.length)
    );
    sigInfo.value.sort((a: any, b: any) =>
      b['type'][0].localeCompare(a['type'][0], 'zh')
    );
  });
};
querySigInfoData();
</script>

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
}
.container {
  // margin-top: 80px;
  min-height: 900px;
  background-color: #f5f6f8;
}
.step {
  // padding: 40px 0;
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
    // padding-left: 24px;
    .edropdown {
      .btnc {
        background-image: url('@/assets/linedown.png');
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
        margin-bottom: 18px;
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
            display: flex;
          }
        }
        .home {
          background-image: url('@/assets/home-outlined.png');
          width: 24px;
          height: 24px;
          margin-right: 8px;
        }
        .Maintainer {
          background-image: url('@/assets/cose.png');
          width: 24px;
          height: 24px;
          margin-right: 8px;
        }
      }
      .firstLast {
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
            display: flex;
          }
        }
        .home {
          background-image: url('@/assets/home-outlined.png');
          width: 24px;
          height: 24px;
          margin-right: 8px;
        }
        .Maintainer {
          background-image: url('@/assets/cose.png');
          width: 24px;
          height: 24px;
          margin-right: 8px;
        }
      }
    }
  }
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
.userInfo {
  .title {
    margin-bottom: 16px;
  }
  .slogan {
    margin-top: 16px;
  }
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
.usertypecolorboxTC {
  background: linear-gradient(var(--color));
  border-radius: 2px;
  font-size: 10px;
  font-family: HarmonyOS_Sans_SC;
  color: #ffffff;
  line-height: 12px;
  width: 32px;
  height: 22px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
