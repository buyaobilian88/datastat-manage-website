import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { router } from './routers';

import App from './App.vue';
import ElementPlus from 'element-plus';
import OpenDesign from 'opendesign';
import vue3JsonExcel from 'vue3-json-excel';
import '@/shared/styles/index.scss';

import * as ECharts from 'echarts';
import { ECHARTOPTION } from './shared/common.const';

ECharts.registerTheme('dark', ECHARTOPTION);

const app = createApp(App);
app.use(vue3JsonExcel);
app.use(createPinia());
app.use(ElementPlus);
app.use(OpenDesign);
app.use(router);

app.mount('#app');
