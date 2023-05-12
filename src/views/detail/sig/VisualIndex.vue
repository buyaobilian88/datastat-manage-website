<template>
  <div class="contributors-panel">
    <h3 id="currentVitalityIndex" class="title">
      {{ props.sencondTitle }}
    </h3>
    <div class="rank">
      <span></span>
      <span> # </span>
      <span class="rank-num">{{ props.sorceData.rank }} </span>
      <!-- <span>/ {{ props.drownData?.length }}</span> -->
    </div>
    <div class="img">
      <o-echart-gauge
        id="combinedActivity"
        :name="'combinedActivity'"
        :value="props.sorceData.score"
        width="280px"
      ></o-echart-gauge>
      <!-- <current-trend :sig="props.sencondTitle"></current-trend> -->
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue';
import OEchartGauge from '@/components/OEchartGauge.vue';
// import CurrentTrend from './CurrentTrend.vue';
interface IObject<T = any> {
  [key: string]: T;
}
// 获取活力指数
const props = defineProps({
  sencondTitle: { type: String },
  // drownData: {
  //   type: Array,
  // },
  sorceData: {
    type:Object,
    required: true,

  },
});

</script>
<style scoped lang="scss">
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
.rank {
  font-size: 12px;
  color: #4e5865;
  line-height: 16px;
  &-num {
    font-size: 40px;
    color: #000000;
  }
}
</style>
