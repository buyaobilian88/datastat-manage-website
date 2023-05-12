<script setup lang="ts">
import { useCommonData } from "@/stores/common";
import { computed, ref } from "vue";
import IconLeft from "~icons/app/icon-chevron-left.svg";
import IconRight from "~icons/app/icon-chevron-right.svg";
import IconMenu from "~icons/app/icon-menu.svg";
import IconHome from "~icons/app/icon-home.svg";
import IconMail from "~icons/app/icon-mail.svg";
import IconTime from "~icons/app/icon-time.svg";
import IconComment from "~icons/app/icon-comment.svg";
import IconLink from "~icons/app/icon-link.svg";
import { hasPermission, useStoreData } from "@/shared/utils/login";
import { queryApply } from "@/api/api-login";
const { guardAuthClient } = useStoreData();
const { selectAsideItem } = useCommonData();
import { ElMessage } from "element-plus";
const collapse = ref(false);
const collapseBtn = computed(() => (collapse.value ? IconRight : IconLeft));
const clickCollapse = () => {
  collapse.value = !collapse.value;
};
const centerDialogVisible = ref(false);
const getApply = () => {
  const param = {
    community: "openeuler",
    username: guardAuthClient.value.username,
  };
  queryApply(param).then((data) => {
    centerDialogVisible.value = false;
    ElMessage({
      message: "申请中，请稍后",
      type: "success",
    });
  });
};
</script>
<template>
  <div class="app-aside">
    <el-menu :default-active="selectAsideItem" :router="true" class="app-aside-menu">
      <el-menu-item index="/overview">
        <el-icon>
          <OIcon>
            <IconLink></IconLink>
          </OIcon>
        </el-icon>
        <span>总览</span>
      </el-menu-item>
      <el-menu-item index="/users">
        <el-icon>
          <OIcon>
            <IconComment></IconComment>
          </OIcon>
        </el-icon>
        <span>社区用户</span>
      </el-menu-item>
      <el-menu-item index="/developer">
        <el-icon>
          <OIcon>
            <IconMenu></IconMenu>
          </OIcon>
        </el-icon>
        <span>开发者</span>
      </el-menu-item>
      <el-sub-menu
        v-if="hasPermission('SIGread') || hasPermission('companyread_all')"
        index="/organization"
      >
        <template #title>
          <span
            ><el-icon>
              <OIcon>
                <IconHome></IconHome>
              </OIcon>
            </el-icon>
          </span>
          <el-menu-item index="/organization" class="specialTitle">
            <span>组织分析</span>
          </el-menu-item>
        </template>
        <!-- v-if="hasPermission('companyread_all')" -->
        <el-menu-item v-if="hasPermission('companyread_all')" index="/detailcompany">
          <el-icon>
            <OIcon>
              <IconHome></IconHome>
            </OIcon>
          </el-icon>
          <span>公司详情</span>
        </el-menu-item>
        <el-menu-item v-if="hasPermission('SIGread')" index="/detailsig">
          <el-icon>
            <OIcon>
              <IconHome></IconHome>
            </OIcon>
          </el-icon>
          <span>sig详情</span>
        </el-menu-item>
        <el-menu-item index="/detailuser">
          <el-icon>
            <OIcon>
              <IconHome></IconHome>
            </OIcon>
          </el-icon>
          <span>个人详情</span>
        </el-menu-item>
        <el-menu-item index="/detailstudent">
          <el-icon>
            <OIcon>
              <IconHome></IconHome>
            </OIcon>
          </el-icon>
          <span>学生详情</span>
        </el-menu-item>
      </el-sub-menu>
      <el-menu-item v-else>
        <el-icon>
          <OIcon>
            <IconHome></IconHome>
          </OIcon>
        </el-icon>
        <span @click="centerDialogVisible = true">组织分析</span>
      </el-menu-item>
      <el-menu-item index="/sigs">
        <el-icon>
          <OIcon>
            <IconMail></IconMail>
          </OIcon>
        </el-icon>
        <span>SIG分析</span>
      </el-menu-item>
      <el-menu-item index="/warehouse">
        <el-icon>
          <OIcon>
            <IconTime></IconTime>
          </OIcon>
        </el-icon>
        <span>仓库分析</span>
      </el-menu-item>
    </el-menu>
    <!-- <div class="collapseBtn">
      <OIcon class="icon" @click="clickCollapse">
        <component :is="collapseBtn"></component>
      </OIcon>
    </div> -->
  </div>
  <el-dialog v-model="centerDialogVisible" title="提示" width="30%" center>
    <span> 暂无访问组织分析权限！是否要申请访问权限？ </span>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="centerDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="getApply"> 申请 </el-button>
      </span>
    </template>
  </el-dialog>
</template>
<style scoped lang="scss">
.app-aside {
  min-height: calc(100vh - 80px);
  background-color: var(--o-color-bg2);
  position: relative;
  .el-sub-menu .el-menu-item {
    min-width: auto;
  }
  .collapseBtn {
    position: absolute;
    right: -15px;
    top: 60px;
    width: var(--o-spacing-h4);
    height: var(--o-spacing-h4);
    border-radius: 50%;
    background-color: var(--o-color-bg2);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    .icon {
      font-size: var(--o-font-size-h8);
      color: var(--o-color-text1);
    }
  }
}
.app-aside-menu:not(.el-menu--collapse) {
  width: 180px;
  min-height: 400px;
}
.specialTitle {
  padding: 0 0 !important;
}
</style>
