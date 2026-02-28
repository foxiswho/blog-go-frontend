<script lang="ts" setup>
import type { RowVO } from '@pg/types';

import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue';

import { useMessage } from 'naive-ui';
import { type VxeGridInstance, type VxeGridProps } from 'vxe-table';

const props = defineProps({
  // 是否开启异步加载
  async: {
    default: false,
    type: Boolean,
  },
  columnWidth: {
    default: 150,
    type: Number,
  },
  // 是否显示 sku 选择栏
  disabled: {
    default: false,
    type: Boolean,
  },
  editRules: {
    default: {},
    type: Object,
  },
  // 无规格的 sku
  emptySku: {
    default: '',
    type: String,
  },
  // skuData 字段分隔符
  separator: {
    default: ';',
    type: String,
  },
  /**
   * 原始规格数据
   * sourceAttribute: [
   *   { name: '颜色', item: ['黑', '金', '白'] },
   *   { name: '内存', item: ['16G', '32G'] },
   *   { name: '运营商', item: ['电信', '移动', '联通'] }
   * ]
   */
  // sourceAttribute: {
  //   type: Array,
  //   default: () => []
  // },
  /**
   * 已使用的规格数据，用于复原数据
   * attribute: [
   *   { name: '颜色', item: ['黑'] },
   *   { name: '运营商', item: ['电信', '移动', '联通'] }
   * ]
   */
  // attribute: {
  //   type: Array,
  //   default: () => []
  // },
  /**
   * 用于复原skuData数据，支持
   * skuData: [
   *   { skuData: '黑;电信', price: 1, stock: 1 },
   *   { skuData: '黑;移动', price: 2, stock: 2 },
   *   { skuData: '黑;联通', price: 3, stock: 3 }
   * ]
   */
  // skuData: {
  //   type: Array,
  //   default: () => []
  // },
  /**
   * 表格结构，注意name字段，用于输出skuData数据
   */
  structure: {
    default: () => [
      { field: 'name', title: 'Name' },
      { field: 'sex', title: 'Sex' },
      { field: 'role', title: 'Role' },
      { field: 'address', title: 'Address' },
    ],
    type: Array,
  },
  // 主题风格
  theme: {
    default: 1,
    type: Number,
  },
});
const skuData = defineModel('skuData', { default: () => [], type: Array });
const attribute = defineModel('attribute', { default: () => [], type: Array });
const sourceAttribute = defineModel('sourceAttribute', {
  default: () => [],
  type: Array,
});
const message = useMessage();
// const emit = defineEmits(['update:sourceAttribute'])
const isInit = ref(false);
const myAttribute = ref([]);
const form = ref({
  skuData: [],
});
const formSkuData = ref([]);
const batch = ref({});
const formRef = ref(null);

const specBtnShow = ref(true);
const specInputShow = ref(false);
const specForm = ref({
  name: '',
  value: '',
});
const addValue = reactive([]);

const xGrid = ref<VxeGridInstance<RowVO>>();
const PREFIX = 'skus';
const rules = computed(() => {
  // 重新生成验证规则
  const rules = {};
  props.structure.forEach((v) => {
    if (v.type == 'input') {
      rules[v.name] = [];
      if (v.required) {
        rules[v.name].push({
          message: `${v.label}不能为空`,
          required: true,
          trigger: 'blur',
        });
      }
      if (v.validate) {
        rules[v.name].push({ trigger: 'blur', validator: customizeValidate });
      }
    } else if (v.type == 'slot') {
      rules[v.name] = [];
      if (v.required) {
        rules[v.name].push({
          message: `${v.label}不能为空`,
          required: true,
          trigger: ['change', 'blur'],
        });
      }
      if (v.validate) {
        rules[v.name].push({
          trigger: ['change', 'blur'],
          validator: customizeValidate,
        });
      }
    }
  });
  return rules;
});
const isBatch = computed(() => {
  return props.structure.some((item) => {
    return item.type == 'input' && item.batch != false;
  });
});
// 将 myAttribute 数据还原会 attribute 数据的结构，用于更新 attribute
const emitAttribute = computed(() => {
  const attribute = [];
  myAttribute.value.forEach((v1) => {
    const obj = {
      item: [],
      name: v1.name,
    };
    v1.item.forEach((v2) => {
      v2.checked = !!v1.itemChecked.includes(v2.name);
      if (v2.checked) {
        obj.item.push(v2.name);
      }
    });
    if (obj.item.length > 0) {
      attribute.push(obj);
    }
  });
  // console.log('watch.myAttribute.value2', myAttribute.value)
  return attribute;
});

watch(
  () => myAttribute.value,
  () => {
    // console.log('watch.myAttribute.value1', myAttribute.value)
    if (!isInit.value) {
      addColumBy();
      // 更新父组件
      attribute.value = emitAttribute.value;
      // emit('update:attribute', emitAttribute.value)
    }

    // 解决通过 emit 更新后无法拿到 attribute 最新数据的问题
    nextTick(() => {
      if (emitAttribute.value.length > 0) {
        combinationAttribute();
      } else {
        formSkuData.value = [];
        const obj = {
          skuData: props.emptySku,
        };
        props.structure.forEach((v) => {
          // console.log('structure',v)
          if (v.hasOwnProperty('defaultValue') && undefined != v.defaultValue) {
            obj[v.field] = v.defaultValue;
          }
        });
        formSkuData.value.push(obj);
      }
      clearValidate();
    });
  },
  { deep: true },
);

watch(
  () => formSkuData.value,
  (newValue, oldValue) => {
    // console.log('watch.skuData.value', skuData.value)
    if (
      (!isInit.value ||
        (newValue.length == 1 && newValue[0].skuData == props.emptySku)) && // console.log('skuData.newValue',newValue)
      // console.log('skuData.oldValue',oldValue)
      // 如果有老数据，或者 sku 数据为空，则更新父级 sku 数据
      (oldValue.length > 0 || skuData.value.length <= 0)
    ) {
      // 更新父组件
      const arr = [];
      newValue.forEach((obj) => {
        props.structure.forEach((v2) => {
          if (
            v2.hasOwnProperty('defaultValue') &&
            undefined != v2.defaultValue &&
            !obj[v2.field]
          ) {
            obj[v2.field] = v2.defaultValue;
          }
        });
        arr.push(obj);
      });
      skuData.value = arr;
    }
  },
  { deep: true },
);

// watch(()=>props.attribute,
//     (newValue, oldValue) => {
//       console.log('watch.props.attribute.newValue', newValue)
//       console.log('watch.props.attribute.oldValue', oldValue)
//
//     },
//     { deep: true}
// )

function init() {
  nextTick(() => {
    isInit.value = true;
    // 初始化 myAttribute
    const myAttribute2 = [];
    // 根据 sourceAttribute 复原 myAttribute 的结构
    sourceAttribute.value.forEach((v) => {
      const temp = {
        addAttribute: '',
        canAddAttribute:
          v.canAddAttribute === undefined ? true : v.canAddAttribute,
        item: [],
        itemChecked: [],
        name: v.name,
      };
      v.item.forEach((itemName) => {
        temp.item.push({
          checked: false,
          name: itemName,
        });
      });
      myAttribute2.push(temp);
    });
    // 根据 attribute 更新 myAttribute
    // console.log('init.props.attribute',props.attribute)
    attribute.value.forEach((attrVal) => {
      myAttribute2.forEach((myAttrVal) => {
        if (attrVal.name === myAttrVal.name) {
          attrVal.item.forEach((attrName) => {
            if (
              !myAttrVal.item.some((myAttrItem) => {
                if (attrName === myAttrItem.name) {
                  myAttrItem.checked = true;
                  myAttrVal.itemChecked.push(attrName);
                }
                return attrName === myAttrItem.name;
              })
            ) {
              myAttrVal.item.push({
                checked: true,
                name: attrName,
              });
              myAttrVal.itemChecked.push(attrName);
            }
          });
        }
      });
    });
    // console.log('init.myAttribute2', myAttribute2)
    myAttribute.value = myAttribute2;
    // 通过 sku 更新 skuData，但因为 skuData 是实时监听 myAttribute 变化并自动生成，而 watch 是在 methods 后执行，所以增加 setTimeout 方法，确保 skuData 生成后在执行下面的代码
    setTimeout(() => {
      skuData.value.forEach((skuItem) => {
        // console.log('skuItem=>',skuItem)
        formSkuData.value.forEach((skuDataItem) => {
          // /console.log('skuDataItem=>',skuDataItem)
          if (skuItem.skuData === skuDataItem.skuData) {
            for (const key in skuItem) {
              // console.log('skuDataItem=>key',key)
              if (!skuItem.hasOwnProperty('key')) {
                skuDataItem[key] = skuItem[key];
              }
            }
          }
          // console.log('skuDataItem=>',skuDataItem)
        });
      });
      isInit.value = false;
    }, 0);

    addColumBy();
  });
}

// 根据 attribute 进行排列组合，生成 skuData 数据
function combinationAttribute(index = 0, dataTemp = []) {
  if (index === 0) {
    for (let i = 0; i < attribute.value[0].item.length; i++) {
      const obj = {
        [PREFIX + attribute.value[0].name]: attribute.value[0].item[i],
        skuData: attribute.value[0].item[i],
      };
      props.structure.forEach((v) => {
        if (v.hasOwnProperty('defaultValue') && undefined != v.defaultValue) {
          obj[v.field] = v.defaultValue;
        }
      });
      // console.log('structure.obj',obj)
      dataTemp.push(obj);
    }
  } else {
    const temp = [];
    for (const element of dataTemp) {
      for (let j = 0; j < attribute.value[index].item.length; j++) {
        temp.push(JSON.parse(JSON.stringify(element)));
        temp[temp.length - 1][PREFIX + attribute.value[index].name] =
          attribute.value[index].item[j];
        temp[temp.length - 1].skuData = [
          temp[temp.length - 1].skuData,
          attribute.value[index].item[j],
        ].join(props.separator);
      }
    }
    dataTemp = temp;
  }
  if (index === attribute.value.length - 1) {
    if (!isInit.value || props.async) {
      // 将原有的 sku 数据和新的 sku 数据比较，相同的 sku 则把原有的 sku 数据覆盖到新的 sku 数据里
      for (let i = 0; i < formSkuData.value.length; i++) {
        for (let j = 0; j < dataTemp.length; j++) {
          if (formSkuData.value[i].skuData === dataTemp[j].skuData) {
            dataTemp[j] = formSkuData.value[i];
          }
        }
      }
    }
    // console.log('structure.dataTemp',dataTemp)
    formSkuData.value = dataTemp;
  } else {
    combinationAttribute(index + 1, dataTemp);
  }
}

// 新增一个规格值
function onAddAttribute(index) {
  myAttribute.value[index].addAttribute =
    myAttribute.value[index].addAttribute.trim();
  if (myAttribute.value[index].addAttribute !== '') {
    if (myAttribute.value[index].addAttribute.includes(props.separator)) {
      message.error(
        `规格里不允许出现「 ${props.separator} 」字符，请检查后重新添加`,
      );
    } else {
      const flag = myAttribute.value[index].item.some((item) => {
        return item.name === myAttribute.value[index].addAttribute;
      });
      if (flag) {
        message.error(`请勿添加相同规格`);
      } else {
        myAttribute.value[index].item.push({
          checked: true,
          name: myAttribute.value[index].addAttribute,
        });
        if (!myAttribute.value[index].itemChecked) {
          myAttribute.value[index].itemChecked = [];
        }
        myAttribute.value[index].itemChecked.push(
          myAttribute.value[index].addAttribute,
        );

        myAttribute.value[index].addAttribute = '';
      }
    }
  }
}

function onBatchSet(type) {
  if (batch.value[type] != '') {
    formSkuData.value.forEach((v) => {
      v[type] = batch.value[type];
    });
    batch.value[type] = '';
    // 批量设置完成后，触发一次当前列的验证
    validateFieldByColumns([type], () => {});
  }
}

// 自定义输入框验证，通过调用 structure 里的 validate 方法实现，重点是 callback 要带过去
function customizeValidate(rule, value, callback) {
  const [model, index, name] = rule.field.split('.');
  props.structure.forEach((v) => {
    if (v.field == name) {
      v.validate(form.value[model], index, callback);
    }
  });
}

// sku 表单验证
function validate(callback) {
  formRef.value.validate((valid) => {
    callback(valid);
  });
}

function validateFieldByColumns(colums, callback) {
  const props = [];
  formSkuData.value.forEach((v, i) => {
    colums.forEach((v) => {
      props.push(`skuData.${i}.${v}`);
    });
  });
  formRef.value.validateField(props, (valid) => {
    callback(valid);
  });
}

function validateFieldByRows(index, prop, callback) {
  formRef.value.validateField([`skuData.${index}.${prop}`], (valid) => {
    callback(valid);
  });
}

function clearValidate() {
  // formRef.value.clearValidate()
}

const gridOptions3 = reactive<VxeGridProps<RowVO>>({
  border: true,
  columnConfig: {
    resizable: true,
  },
  columns: [],
  data: [],
  editConfig: {
    autoClear: false,
    mode: 'row',
    showStatus: true,
    trigger: 'click',
  },
  expandConfig: {
    expandAll: true,
  },
  loading: false,
  // editRules:props.editRules,
  style: {
    '--vxe-table-cell-padding-left': '0px',
    '--vxe-table-cell-padding-right': '0px',
  },
});
const tabColumnsFirst = [
  { align: 'center', type: 'seq', width: 50 },
  {
    slots: {
      content: 'expandContent',
    },
    type: 'expand',
    width: 30,
  },
];
const addColumBy = () => {
  const newArr = [];
  tabColumnsFirst.forEach((item) => {
    newArr.push(item);
  });
  if (emitAttribute.value && emitAttribute.value.length > 0) {
    emitAttribute.value.forEach((item) => {
      newArr.push({
        align: 'center',
        field: PREFIX + item.name,
        headerAlign: 'center',
        key: gridOptions3.columns.length + 1,
        title: item.name,
        width: props.columnWidth,
      });
    });
  }
  props.structure.forEach((item) => {
    newArr.push(item);
  });
  gridOptions3.columns = newArr;
};

onMounted(() => {
  !props.async && init();
});

function addSpecShow() {
  specBtnShow.value = false;
  specInputShow.value = true;
}

function addSpecClose() {
  specBtnShow.value = true;
  specInputShow.value = false;
}

function addSpecSubmit() {
  const temp = {
    addAttribute: '',
    canAddAttribute: true,
    item: [
      {
        checked: true,
        name: specForm.value.value,
      },
    ],
    itemChecked: [specForm.value.value],
    name: specForm.value.name,
  };
  myAttribute.value.push(temp);

  specForm.value.name = '';
  specForm.value.value = '';

  addSpecClose();
}
</script>

<template>
  <div class="sku-container">
    <div v-if="!disabled" class="sku-check">
      <div v-if="theme == 1" class="theme-1">
        <n-card
          v-for="(item, index) in myAttribute"
          :key="index"
          class="item"
          shadow="never"
        >
          <template #header>
            <div class="header">{{ item.name }}</div>
          </template>
          <n-checkbox-group v-model:value="item.itemChecked">
            <n-checkbox
              v-for="(item2, index2) in item.item"
              :key="index2"
              :label="item2.name"
              :value="item2.name"
              size="small"
            />
          </n-checkbox-group>
          <n-input-group style="width: 230px">
            <n-input
              v-if="item.canAddAttribute"
              v-model:value="addValue[index]"
              placeholder="新增一个值"
              size="small"
            />
            <n-button
              ghost
              icon="el-icon-plus"
              size="small"
              @click="
                () => {
                  item.addAttribute = addValue[index];
                  onAddAttribute(index);
                }
              "
            >
              添加
            </n-button>
          </n-input-group>
        </n-card>
      </div>
      <div class="btn">
        <div v-if="specBtnShow">
          <n-button style="margin-left: 27px" type="info" @click="addSpecShow">
            添加规格
          </n-button>
        </div>
        <div v-if="specInputShow">
          <n-form
            ref="formRef"
            v-model:value="specForm"
            :label-width="80"
            inline
            label-placement="left"
            size="medium"
          >
            <n-form-item :path="specForm.name" label="规格">
              <n-input v-model:value="specForm.name" placeholder="请输入" />
            </n-form-item>
            <n-form-item :path="specForm.value" label="规格值">
              <n-input v-model:value="specForm.value" placeholder="请输入" />
            </n-form-item>
            <n-form-item size="small">
              <n-button type="info" @click="addSpecSubmit"> 确定 </n-button>
              <n-button style="margin-left: 10px" @click="addSpecClose">
                取消
              </n-button>
            </n-form-item>
          </n-form>
        </div>
      </div>
    </div>
    <div class="sku-list">
      <vxe-grid
        ref="xGrid"
        v-bind="gridOptions3"
        :data="formSkuData"
        :edit-rules="props.editRules"
      >
        <template #expandContent="data">
          <slot name="expandContent" v-bind="data" :key="data.rowIndex"></slot>
        </template>
        <template
          v-for="item in Object.keys($slots)"
          :key="item"
          #[item]="data"
        >
          <slot :name="item" v-bind="data || {}"></slot>
        </template>
      </vxe-grid>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.sku-container {
  width: 100%;

  :deep(.n-card) {
    //margin: 10px 0;

    //.n-card__header {
    //  line-height: initial;
    //  padding: 10px 20px;
    //  font-size: xx-large;
    //}
    .n-card__content {
      .header {
        font-size: x-large;
      }
    }
  }

  .sku-check {
    .theme-1 {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      margin-bottom: 10px;

      .item {
        width: 99%;

        &:last-child:nth-child(3n - 1) {
          margin-right: calc(100% - 32% * 2 - 4% / 2) !important;
        }

        .add-attr {
          width: 100%;
          margin-top: 10px;
        }
      }
    }

    .theme-2 {
      border: 1px solid #ebeef5;
      border-bottom: 0;
      margin-bottom: 20px;
    }

    .btn {
      height: 58px;
    }
  }

  .sku-name {
    text-align: right;
  }

  .batch-set {
    width: 100%;
    margin-top: 5px;
  }

  .sku-list {
    line-height: initial;

    & .el-input__inner {
      text-align: center;
    }

    & .el-table__append-wrapper {
      overflow: initial;

      .el-table {
        overflow: initial;

        .el-table__body-wrapper {
          overflow: initial;
        }
      }
    }

    & .el-form-item {
      margin-bottom: 0;

      .el-form-item__content {
        line-height: initial;

        .el-form-item__error {
          margin-left: 0;
        }
      }
    }

    .required_title::before {
      content: '*';
      color: #f56c6c;
    }
  }
}
</style>
