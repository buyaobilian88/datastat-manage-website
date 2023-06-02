import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { hasPermission } from '@/shared/utils/login';
import TheOverview from '@/views/overview/TheOverview.vue';
import TheUsers from '@/views/users/TheUsers.vue';
import TheDeveloper from '@/views/developer/TheDeveloper.vue';
import TheOrganization from '@/views/organization/TheOrganization.vue';
import TheSigs from '@/views/sigs/TheSigs.vue';
import TheWarehouse from '@/views/warehouse/TheWarehouse.vue';
import TheUser from '@/views/detail/user/TheUser.vue';
import TheSig from '@/views/detail/sig/TheSig.vue';
import TheCompany from '@/views/detail/company/TheCompany.vue';
import TheStudent from '@/views/detail/student/TheStudent.vue';
import TheLogin from '@/views/login/TheLogin.vue';
import { useCommonData } from '@/stores/common';
import { getUserAuth } from '@/shared/utils/login';
export const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/login' },
  {
    path: '/login',
    name: 'login',
    component: TheLogin,
  },
  {
    path: '/overview',
    name: 'overview',
    component: TheOverview,
  },
  {
    path: '/users',
    name: 'users',
    component: TheUsers,
  },
  {
    path: '/developer',
    name: 'developer',
    component: TheDeveloper,
  },
  {
    path: '/organization',
    name: 'organization',
    component: TheOrganization,
  },
  {
    path: '/sigs',
    name: 'sigs',
    component: TheSigs,
  },
  {
    path: '/warehouse',
    name: 'warehouse',
    component: TheWarehouse,
  },
  {
    path: '/detailuser',
    name: 'detailuser',
    component: TheUser,
  },
  {
    path: '/detailsig',
    name: 'detailsig',
    component: TheSig,
  },
  {
    path: '/detailcompany',
    name: 'detailcompany',
    component: TheCompany,
  },
  {
    path: '/detailstudent',
    name: 'detailstudent',
    component: TheStudent,
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});
const { token } = getUserAuth();
// 路由守卫，可在此处进行页面权限处理
router.beforeEach((to, from, next) => {
  // if (token) {
  //   if (to.path === '/login') {
  //     next('/overview');
  //   } else {
  //     next();
  //   }
  // } else {
  //   next('/login');
  // }
  if (to.path === '/login' || token) {
    next();
  } else {
    next('/login');
  }
});
