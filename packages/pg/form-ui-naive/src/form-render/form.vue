<script setup lang="ts">
import type { GenericObject } from 'vee-validate';
import type { ZodTypeAny } from 'zod';

import type {
  FormCommonConfig,
  FormRenderProps,
  FormSchema,
  FormShape,
} from '../types';

import { computed, ref } from 'vue';
import { NTabPane, NTabs } from 'naive-ui';

import { Form } from '@vben-core/shadcn-ui';
import {
  cn,
  isFunction,
  isString,
  mergeWithArrayOverride,
} from '@vben-core/shared/utils';

import { provideFormRenderProps } from './context';
import { useExpandable } from './expandable';
import FormField from './form-field.vue';
import { getBaseRules, getDefaultValueInZodStack } from './helper';

interface Props extends FormRenderProps {}

const props = withDefaults(
  defineProps<Props & { globalCommonConfig?: FormCommonConfig }>(),
  {
    collapsedRows: 1,
    commonConfig: () => ({}),
    globalCommonConfig: () => ({}),
    showCollapseButton: false,
    tabs: {
      active: 'home',
      group: [{ label: '首页', value: 'home' }],
      hide: false,
    },
    wrapperClass: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
  },
);

const emits = defineEmits<{
  submit: [event: any];
}>();

const wrapperClass = computed(() => {
  const cls = ['flex'];
  if (props.layout === 'inline') {
    cls.push('flex-wrap gap-x-2');
  } else {
    cls.push(props.compact ? 'gap-x-2' : 'gap-x-4', 'flex-col grid');
  }
  return cn(...cls, props.wrapperClass);
});

provideFormRenderProps(props);

// @ts-expect-error unused
const { isCalculated, keepFormItemIndex, wrapperRef } = useExpandable(props);

const shapes = computed(() => {
  const resultShapes: FormShape[] = [];
  props.schema?.forEach((schema) => {
    const { fieldName } = schema;
    const rules = schema.rules as ZodTypeAny;

    let typeName = '';
    if (rules && !isString(rules)) {
      typeName = rules._def.typeName;
    }

    const baseRules = getBaseRules(rules) as ZodTypeAny;

    resultShapes.push({
      default: getDefaultValueInZodStack(rules),
      fieldName,
      required: !['ZodNullable', 'ZodOptional'].includes(typeName),
      rules: baseRules,
    });
  });
  return resultShapes;
});

const formComponent = computed(() => (props.form ? 'form' : Form));

const formComponentProps = computed(() => {
  return props.form
    ? {
        onSubmit: props.form.handleSubmit((val) => emits('submit', val)),
      }
    : {
        onSubmit: (val: GenericObject) => emits('submit', val),
      };
});

const formCollapsed = computed(() => {
  return props.collapsed && isCalculated.value;
});

const computedSchema = computed(
  (): (Omit<FormSchema, 'formFieldProps'> & {
    commonComponentProps: Record<string, any>;
    formFieldProps: Record<string, any>;
  })[] => {
    const {
      colon = false,
      componentProps = {},
      controlClass = '',
      disabled,
      disabledOnChangeListener = true,
      disabledOnInputListener = true,
      emptyStateValue = undefined,
      formFieldProps = {},
      formItemClass = '',
      hideLabel = false,
      hideRequiredMark = false,
      labelClass = '',
      labelWidth = 100,
      modelPropName = '',
      wrapperClass = '',
    } = mergeWithArrayOverride(props.commonConfig, props.globalCommonConfig);
    return (props.schema || []).map((schema, index) => {
      const keepIndex = keepFormItemIndex.value;

      const hidden =
        // 折叠状态 & 显示折叠按钮 & 当前索引大于保留索引
        props.showCollapseButton && !!formCollapsed.value && keepIndex
          ? keepIndex <= index
          : false;

      // 处理函数形式的formItemClass
      let resolvedSchemaFormItemClass = schema.formItemClass;
      if (isFunction(schema.formItemClass)) {
        try {
          resolvedSchemaFormItemClass = schema.formItemClass();
        } catch (error) {
          console.error('Error calling formItemClass function:', error);
          resolvedSchemaFormItemClass = '';
        }
      }

      return {
        colon,
        disabled,
        disabledOnChangeListener,
        disabledOnInputListener,
        emptyStateValue,
        hideLabel,
        hideRequiredMark,
        labelWidth,
        modelPropName,
        wrapperClass,
        ...schema,
        commonComponentProps: componentProps,
        componentProps: schema.componentProps,
        controlClass: cn(controlClass, schema.controlClass),
        formFieldProps: {
          ...formFieldProps,
          ...schema.formFieldProps,
        },
        formItemClass: cn(
          'flex-shrink-0',
          { hidden },
          formItemClass,
          resolvedSchemaFormItemClass,
        ),
        labelClass: cn(labelClass, schema.labelClass),
      };
    });
  },
);
const activeTab = ref('home');
if (props?.tabs?.active) {
  activeTab.value = props?.tabs?.active;
}
const computedTab = computed(() => {
  // console.log('props', props);
  if (props?.tabs && props?.tabs?.group) {
    return props?.tabs?.group;
  }
  return [{ label: '首页', value: 'home' }];
});
const computedTabHide = computed(() => {
  // console.log('props', props);
  if (props?.tabs && props?.tabs.hasOwnProperty('hide')) {
    return props?.tabs?.hide;
  }
  return false;
});

const tabId = ref([
  `tabId-${Math.random().toString(36).slice(2, 11)}`,
  'tabId-hide',
]);
const display = computed(() => {
  return computedTabHide.value ? 'none' : 'flex';
});
const tabsComputedProps = computed(() => {
  return props.tabs && props.tabs.props ? props.tabs.props : {};
});
</script>

<template>
  <component :is="formComponent" v-bind="formComponentProps">
    <div ref="wrapperRef" :class="wrapperClass">
      <template v-for="cSchema in computedSchema" :key="cSchema.fieldName">
        <template
          v-if="
            cSchema.hasOwnProperty('tabGroup') &&
            '_no_tabs' === cSchema.tabGroup
          "
        >
          <!-- <div v-if="$slots[cSchema.fieldName]" :class="cSchema.formItemClass">
          <slot :definition="cSchema" :name="cSchema.fieldName"> </slot>
        </div> -->
          <FormField
            v-bind="cSchema"
            :class="cSchema.formItemClass"
            :rules="cSchema.rules"
          >
            <template #default="slotProps">
              <slot v-bind="slotProps" :name="cSchema.fieldName"> </slot>
            </template>
          </FormField>
        </template>
      </template>
    </div>
    <NTabs type="segment" :class="tabId" v-bind="tabsComputedProps">
      <NTabPane
        v-for="gp in computedTab"
        :key="gp.value"
        :name="gp.value"
        :tab="gp.label"
        :class="gp.class"
        display-directive="show"
      >
        <div ref="wrapperRef" :class="wrapperClass" class="grid">
          <template v-for="cSchema in computedSchema" :key="cSchema.fieldName">
            <!-- <div v-if="$slots[cSchema.fieldName]" :class="cSchema.formItemClass">
                <slot :definition="cSchema" :name="cSchema.fieldName"> </slot>
              </div> -->
            <template
              v-if="
                cSchema.hasOwnProperty('tabGroup') &&
                (gp.value === cSchema.tabGroup || !gp.value)
              "
            >
              <FormField
                v-bind="cSchema"
                :class="cSchema.formItemClass"
                :rules="cSchema.rules"
              >
                <template #default="slotProps">
                  <slot v-bind="slotProps" :name="cSchema.fieldName"> </slot>
                </template>
              </FormField>
            </template>
          </template>
        </div>
      </NTabPane>
    </NTabs>
    <slot :shapes="shapes"></slot>
  </component>
</template>
<style scoped>
:deep(.tabId-hide) {
  .n-tabs-nav {
    display: v-bind(display);
  }
}
</style>
