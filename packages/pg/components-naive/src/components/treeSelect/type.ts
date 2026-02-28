export interface NodeField {
  // key 字段名称
  keyField: string;
  // label 字段名称
  labelField: string;
  // 上级 字段
  parentField: string;
  // 选中时，是否只允许选中最后一个节点
  selectLast?: boolean;
}
