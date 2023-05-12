<script setup lang="ts">
import { computed, ref } from 'vue';
import { useCommon, useCommonData } from '@/stores/common';
import { useI18n } from '@/i18n';
import {
  showGuard,
  logout,
  useStoreData,
  getUserAuth,
} from '@/shared/utils/login';

import logo_light from '@/assets/logo.svg';
import logo_dark from '@/assets/logo_dark.svg';

import IconLogin from '~icons/app/icon-login.svg';

const { token } = getUserAuth();
const { guardAuthClient } = useStoreData();

const i18n = useI18n();
const { theme, community } = useCommonData();

const logo = computed(() => (theme.value === 'light' ? logo_light : logo_dark));

const jumpToUserZone = () => {
  const language = 'zh';
  const origin = import.meta.env.VITE_LOGIN_ORIGIN;
  window.open(`${origin}/${language}/profile`, '_black');
};

const communityOption = [
  {
    value: 'openeuler',
    label: 'openEuler',
  },
  // {
  //   value: 'opengauss',
  //   label: 'openGauss',
  // },
];
</script>

<template>
  <header class="app-header">
    <div class="app-header-body">
      <img class="logo" alt="openEuler logo" :src="logo" />
      <OSelect v-model="community">
        <OOption
          v-for="item in communityOption"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </OSelect>
      <div class="opt-user">
        <div v-if="token">
          <div class="el-dropdown-link opt-info">
            <img
              v-if="guardAuthClient.photo"
              :src="guardAuthClient.photo"
              class="img"
            />
            <div v-else class="img"></div>
            <p class="opt-name">{{ guardAuthClient.username }}</p>
          </div>
          <ul class="menu-list">
            <li @click="jumpToUserZone()">{{ i18n.USER_CENTER }}</li>
            <li @click="logout()">{{ i18n.LOGOUT }}</li>
          </ul>
        </div>
        <div v-else class="login" @click="showGuard()">
          <OIcon class="icon">
            <IconLogin />
          </OIcon>
        </div>
      </div>
    </div>
  </header>
</template>

<style lang="scss" scoped>
.app-header {
  background-color: var(--o-color-bg2);
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  z-index: 99;
  box-shadow: var(--o-shadow-l1);
  &-body {
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 1504px;
    padding: 0 44px;
    margin: 0 auto;
    height: 80px;
    @media (max-width: 1439px) {
      padding: 0 24px;
    }
    @media (max-width: 1100px) {
      padding: 0 16px;
      height: 48px;
      justify-content: space-between;
      position: relative;
    }
  }
}
.logo {
  height: 32px;
  cursor: pointer;
  margin-right: var(--o-spacing-h4);
  @media (max-width: 1100px) {
    height: 24px;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    top: 12px;
    margin-right: 0;
  }
}
.opt-user {
  margin-left: 8px;
  height: 100%;
  display: flex;
  align-items: center;
  position: relative;
  .opt-info {
    display: flex;
    align-items: center;
    .img {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      cursor: pointer;
      vertical-align: middle;
      @media (max-width: 1100px) {
        width: 28px;
        height: 28px;
      }
    }
    .opt-name {
      color: var(--o-color-text1);
      margin-left: 8px;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      width: 72px;
      line-height: var(--o-line-height-h8);
      @media (max-width: 1100px) {
        display: none;
      }
    }
  }
  &:hover {
    .menu-list {
      display: block;
    }
  }
  .menu-list {
    display: none;
    position: absolute;
    top: 70px;
    left: 0;
    @media (max-width: 1100px) {
      top: 48px;
      left: -60px;
    }
    background: var(--o-color-bg2);
    cursor: pointer;
    z-index: 999;
    box-shadow: var(--o-shadow-l1);
    min-width: 78px;
    li {
      line-height: var(--o-line-height-h3);
      text-align: center;
      font-size: var(--o-font-size-text);
      color: var(--o-color-text1);
      border-bottom: 1px solid var(--o-color-division1);
      padding: 0 var(--o-spacing-h5);
      &:last-child {
        border-bottom: 0 none;
      }

      &:hover {
        background: var(--o-color-brand1);
        color: var(--o-color-text2);
      }
      &.active {
        color: var(--o-color-brand1);
        background: none;
        cursor: default;
      }
    }
  }
}
.login {
  .icon {
    font-size: var(--o-font-size-h6);
    color: var(--o-color-text1);
    cursor: pointer;
  }
}
</style>
