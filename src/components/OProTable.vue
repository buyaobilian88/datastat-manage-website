<script setup lang="ts">
import { determiningType } from '@/shared/utils/utils';
import IconSetting from '~icons/app/icon-setting.svg';
import IconSearch from '~icons/app/icon-search.svg';
import IconFilter from '~icons/app/icon-filter.svg';
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { ProTableColConfig } from '@/shared/protable.interface';

const props = defineProps({
  // 必传，用于记忆缓存列显示隐藏
  id: {
    type: String,
    required: true,
    default: '',
  },
  // 异步数据表格：true/同步数据表格：false
  isAsync: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Array<any>,
    required: true,
    default: [],
  },
  tableConfig: {
    type: Array<ProTableColConfig>,
    required: true,
    default: [],
  },
  pageSizes: {
    type: Array<number>,
    default: [10, 20, 50, 100],
  },
  width: {
    type: String,
    default: '100%',
  },
  height: {
    type: Number || String,
    default: '300px',
  },
  total: {
    type: Number,
    default: 0,
  },
});

const calcContainerHeight = computed(() => {
  if (typeof props.height === 'number') {
    return `${props.height + 50}px`;
  }
  const num = parseFloat(props.height);
  return `${num + 50}${String(props.height).replace(String(num), '')}`;
});

const currentPage = ref(1);
const pageSize = ref(props.pageSizes[0]);
// 当前页表格数据
const currentData = ref<any>([]);
// 同步数据分页时全部数据
const totalData = ref<any>([]);
watch(
  () => props.data,
  () => {
    if (props.isAsync) {
      currentData.value = props.data;
    } else {
      filterTableData();
    }
  }
);
onMounted(() => {
  if (props.isAsync) {
    currentData.value = props.data;
  } else {
    filterTableData();
  }
});
// 列显示隐藏
const columnList = ref<any>([]);

const getColumnLabel = computed(() => {
  return props.tableConfig.reduce((pre, next) => {
    if (next.children) {
      next.children.forEach((it) => (pre[it.key] = it.label));
    } else {
      pre[next.key] = next.label;
    }
    return pre;
  }, {} as any);
});

const getCheckedColumnList = () => {
  const str = localStorage.getItem('tableCol') || '{}';
  try {
    const obj = JSON.parse(str);
    if (determiningType(obj, 'Object') && obj[props.id]) {
      return obj[props.id];
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
};
const checkedColumnList = ref<any>([]);
const setCheckedColumnList = (key: string) => {
  if (checkedColumnList.value.includes(key)) {
    checkedColumnList.value = checkedColumnList.value.filter(
      (item: string) => item !== key
    );
  } else {
    checkedColumnList.value.push(key);
  }
  if (props.id) {
    const str = localStorage.getItem('tableCol') || '{}';
    let obj: any = {};
    try {
      obj = JSON.parse(str);
      if (determiningType(obj, 'Object')) {
        obj[props.id] = checkedColumnList.value;
      } else {
        return null;
      }
    } catch (error) {
      return null;
    }
    localStorage.setItem('tableCol', JSON.stringify(obj));
  }
};

// 过滤配置
const getFilterConfig = () => {
  const arr = props.tableConfig.map((item) => {
    return [
      item.key,
      {
        key: item.key,
        searchValue: '',
        selectValue: '',
        visible: false,
      },
    ];
  });
  return Object.fromEntries(arr);
};
const filterConfig = reactive(getFilterConfig());

// 过滤方法
const search = (key: string) => {
  filterConfig[key].visible = false;
  filterTableData();
};

const select = (value: string, key: string) => {
  filterConfig[key].visible = false;
  filterConfig[key].selectValue = value;
  filterTableData();
};
const isActive = (key: string) => {
  return filterConfig[key].visible ||
    filterConfig[key].searchValue ||
    filterConfig[key].selectValue
    ? 'header-active'
    : '';
};

const emits = defineEmits(['filter']);
// 过滤表格
const filterTableData = () => {
  const arr = Object.entries(filterConfig).filter(
    (item: any) => item[1].searchValue || item[1].selectValue
  );
  const filters = arr.map((item: any) => {
    const { visible, ...obj } = item[1];
    visible;
    return obj;
  });
  const filterParam = {
    filters,
    currentPage: currentPage.value,
    pageSize: pageSize.value,
  };
  // 异步的则返回过滤条件
  if (props.isAsync) {
    emits('filter', filterParam);
  } else {
    currentData.value = syncFilterData(filterParam);
  }
};

const syncFilterData = (filterParam: any) => {
  totalData.value = props.data.filter((item) => {
    return filterParam.filters.every(
      (it: any) =>
        (!it.searchValue || String(item[it.key]).includes(it.searchValue)) &&
        (!it.selectValue || it.selectValue === item[it.key])
    );
  });
  return totalData.value.slice(
    (currentPage.value - 1) * pageSize.value,
    currentPage.value * pageSize.value
  );
};

const sizeChange = () => {
  currentPage.value = 1;
  filterTableData();
};
watch(
  () => [props.tableConfig, props.id],
  () => {
    columnList.value = props.tableConfig
      .map((item) => {
        if (item.children) {
          return item.children.map((it) => it.key);
        }
        return item.key;
      })
      .flat();
    checkedColumnList.value = getCheckedColumnList() || columnList.value;
  },
  { immediate: true, deep: true }
);
</script>
<template>
  <div :style="{ 'max-height': calcContainerHeight, width }">
    <ElTable
      :id="id"
      :max-height="height"
      :style="{ width: '100%' }"
      :data="currentData"
      row-key="name"
    >
      <transition-group name="table">
        <template v-for="item in tableConfig" :key="item.key">
          <template
            v-if="
              !item?.children?.length && checkedColumnList.includes(item.key)
            "
          >
            <ElTableColumn :prop="item.key" :label="item.label">
              <template #header>
                <div class="header-filter">
                  <span :class="isActive(item.key)">
                    {{ item.label }}
                  </span>
                  <el-popover
                    v-if="item?.filtersConfig?.search"
                    v-model:visible="filterConfig[item.key].visible"
                    width="286"
                    trigger="click"
                  >
                    <template #reference>
                      <OIcon class="header-icon" :class="isActive(item.key)">
                        <IconSearch></IconSearch>
                      </OIcon>
                    </template>
                    <div>
                      <OSearch
                        v-model="filterConfig[item.key].searchValue"
                        @change="search(item.key)"
                      ></OSearch>
                    </div>
                  </el-popover>
                  <ODropdown
                    v-if="item?.filtersConfig?.select"
                    :max-height="250"
                    trigger="click"
                    @command="select($event, item.key)"
                    @visible-change="(val:boolean) => filterConfig[item.key].visible = val"
                  >
                    <OIcon class="header-icon" :class="isActive(item.key)">
                      <IconFilter></IconFilter>
                    </OIcon>
                    <template #dropdown>
                      <div class="search-box">
                        <ODropdownItem v-if="true" :command="''">
                          取消选项
                        </ODropdownItem>
                      </div>
                      <ODropdownItem
                        v-for="it in item?.filtersConfig?.select?.options"
                        :key="it.value"
                        :class="
                          it.value === filterConfig[item.key].selectValue
                            ? 'is-active'
                            : ''
                        "
                        :command="it.value"
                      >
                        {{ it.label }}
                      </ODropdownItem>
                    </template>
                  </ODropdown>
                </div>
              </template>
            </ElTableColumn>
          </template>
          <template
            v-else-if="
              item?.children?.length &&
              item.children.some((it) => checkedColumnList.includes(it.key))
            "
          >
            <ElTableColumn :label="item.label">
              <template v-for="it in item.children" :key="it.key">
                <ElTableColumn
                  v-if="checkedColumnList.includes(it.key)"
                  :prop="it.key"
                  :label="it.label"
                ></ElTableColumn>
              </template>
            </ElTableColumn>
          </template>
        </template>
        <OTableColumn
          v-if="columnList.length > 1"
          key="setting"
          width="50"
          fixed="right"
          class-name="setting-title"
        >
          <template #header>
            <el-popover width="286" trigger="click">
              <template #reference>
                <OIcon>
                  <IconSetting></IconSetting>
                </OIcon>
              </template>
              <div class="filter-title">
                <OTag
                  v-for="item in columnList"
                  :key="item"
                  checkable
                  checked
                  :type="checkedColumnList.includes(item) ? 'primary' : 'text'"
                  @click="setCheckedColumnList(item)"
                >
                  {{ getColumnLabel[item] }}
                </OTag>
              </div>
            </el-popover>
          </template>
        </OTableColumn>
      </transition-group>
    </ElTable>
    <OPagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      class="pagin"
      :page-sizes="pageSizes"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total || totalData.length"
      :hide-on-single-page="true"
      @size-change="sizeChange"
      @current-change="filterTableData"
    ></OPagination>
  </div>
</template>
<style lang="scss" scoped>
.setting-title {
  .cell {
    justify-content: center;
    padding: 0;
  }
  .o-icon {
    cursor: pointer;
    font-size: 18px;
  }
}
.header-filter {
  display: flex;
  align-items: center;
  gap: 4px;
  .header-icon {
    cursor: pointer;
    font-size: 16px;
  }
  .header-active {
    color: var(--o-color-link3);
  }
}

.filter-title {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  max-width: 260px;
  background-color: #fff;
}
.pagin {
  margin-top: var(--o-spacing-h6);
}
</style>
