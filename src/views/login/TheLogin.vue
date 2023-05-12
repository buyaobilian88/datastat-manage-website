<script lang="ts" setup>
import { OButton } from '@/components/button';
import OIcon from '@/components/OIcon.vue';
import { showGuard } from '@/shared/utils/login';
import IconArrowRight from '~icons/app/icon-arrow-right.svg';
import notFoundImg from '@/assets/404.png';
</script>
<template>
  <div class="login">
    <img :src="notFoundImg" alt="" />
    <p>请先登录openEuler账号验证权限！</p>
    <OButton class="login-btn" type="primary" animation @click="showGuard()"
      >前往登录
      <template #suffixIcon>
        <OIcon>
          <IconArrowRight></IconArrowRight>
        </OIcon>
      </template>
    </OButton>
  </div>
</template>

<style scoped lang="scss">
.login {
  display: flex;
  margin: 0 auto;
  flex-direction: column;
  width: 640px;
  padding: 40px;
  background-color: #fff;
  // background-image: url(@/assets/bg/bg.jpg);
  align-items: center;
  p {
    margin: 24px 0;
  }
  img {
    width: 240px;
    height: 240px;
  }
}
</style>
