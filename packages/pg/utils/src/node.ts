import { get } from 'lodash-es';

export interface Node {
  // 是否禁用节点的 checkbox
  checkboxDisabled?: boolean;
  // 节点的子节点
  children?: Array<Node>;
  // 数据
  data: object;
  // 是否禁用节点
  disabled?: boolean;
  // 节点是否是叶节点，在异步展开状态下是必须的
  isLeaf?: boolean;
  // id
  key: number | string;
  // 名称
  label: string;
  parentId: number | string;
}

export interface NodeProps {
  data: Array<Node>;
  // id
  keyField?: string;
  // 名称
  labelField?: string;
  parentField?: string;
  // 选中时，是否只允许选中最后一个节点
  selectLast?: boolean;
  isNodeAll?: boolean;
}

export function useNode(props: NodeProps) {
  if (!props.labelField) {
    props.labelField = 'label';
  }
  if (!props.keyField) {
    props.keyField = 'key';
  }
  if (!props.parentField) {
    props.parentField = 'parentId';
  }
  if (!Object.prototype.hasOwnProperty.call(props, 'selectLast')) {
    props.selectLast = false;
  }
  if (!Object.prototype.hasOwnProperty.call(props, 'isNodeAll')) {
    props.isNodeAll = false;
  }

  /**
   * @param  {Array} data   数据
   * @return {Array} result 数组树状数据
   */
  async function arrayToTree(data: Array<Node>): Node[] {
    const map = new Map();
    const result = []; // 存放树形结果
    // 生成一个用 id 作为 key，用原对象值并添加 children 以作为值的 Map 对象
    data.forEach((item) => {
      //console.log('_get(item,props[\'keyField\'])',get(item,props['keyField']))
      // console.log('_get(item,props[\'parentField\'])',_get(item,props['parentField']))
      map.set(get(item, props.keyField), {
        data: props.isNodeAll ? (item?.extend ? item.extend : item) : item,
        disabled: false,
        isLeaf: true,
        key: get(item, props.keyField),
        label: get(item, props.labelField),
        parentId: get(item, props.parentField, ''),
        children: [],
      });
    });
    // console.log('map',map)
    // 循环 map 数组
    map.forEach((item) => {
      if (map.has(item.parentId)) {
        const parentNode = map.get(item.parentId);
        parentNode.children.push(item);
        parentNode.isLeaf = false;
        if (props.selectLast) {
          parentNode.disabled = true;
        }
      } else {
        result.push(map.get(item.key));
      }
    });

    return result;
  }

  /**
   * @param  {Array} data   数据
   * @return {Array} result 数组树状数据
   */
  async function arrayToTreeEl(data: Array<Node>): Node[] {
    const map = new Map();
    const result: Node[] = []; // 存放树形结果
    // 生成一个用 id 作为 key，用原对象值并添加 children 以作为值的 Map 对象
    if (data) {
      data.forEach((item) => {
        // console.log('_get(item,props[\'keyField\'])',get(item,props['keyField']))
        // console.log('_get(item,props[\'parentField\'])',_get(item,props['parentField']))
        map.set(get(item, props.keyField), {
          data: item,
          disabled: false,
          id: get(item, props.keyField),
          key: get(item, props.keyField),
          isLeaf: true,
          label: get(item, props.labelField),
          parentId: get(item, props.parentField, ''),
          children: [],
        });
      });
    }
    // console.log('map',map)
    // 循环 map 数组
    map.forEach((item) => {
      if (map.has(item.parentId)) {
        const parentNode = map.get(item.parentId);
        parentNode.children.push(item);
        parentNode.isLeaf = false;
        parentNode.disabled = true;
      } else {
        result.push(map.get(item.key));
      }
    });

    return result;
  }

  /**
   * @param  {Array} data   数据
   * @return {Array} result 数组树状数据
   */
  async function arrayToTreeSelectEl(data: Array<Node>): Node[] {
    const map = new Map();
    const result = []; // 存放树形结果
    // 生成一个用 id 作为 key，用原对象值并添加 children 以作为值的 Map 对象
    data.forEach((item) => {
      // console.log('_get(item,props[\'keyField\'])',get(item,props['keyField']))
      // console.log('_get(item,props[\'parentField\'])',_get(item,props['parentField']))
      map.set(get(item, props.keyField), {
        data: item,
        disabled: false,
        id: get(item, props.keyField),
        key: get(item, props.keyField),
        value: get(item, props.keyField),
        isLeaf: true,
        label: get(item, props.labelField),
        parentId: get(item, props.parentField, ''),
        children: [],
      });
    });
    // console.log('map',map)
    // 循环 map 数组
    map.forEach((item) => {
      if (map.has(item.parentId)) {
        const parentNode = map.get(item.parentId);
        parentNode.children.push(item);
        parentNode.isLeaf = false;
        parentNode.disabled = true;
      } else {
        result.push(map.get(item.key));
      }
    });

    return result;
  }

  /**
   * @param  {Array} data   数据
   * @return {Array} result 数组树状数据
   */
  const arrayToTree2 = (data: Array<Node>): Node[] => {
    const map = new Map();
    const result = []; // 存放树形结果
    // 生成一个用 id 作为 key，用原对象值并添加 children 以作为值的 Map 对象
    data.forEach((item) =>
      map.set(item[props.keyField], {
        data: item,
        key: item[props.keyField],
        label: item[props.labelField],
        parentId: item[props.parentField],
        children: [],
      }),
    );

    // 循环 map 数组
    map.forEach((item) => {
      if (map.has(item.parentId)) {
        const parentNode = map.get(item.parentId);
        parentNode.children.push(item);
      } else {
        result.push(map.get(item.key));
      }
    });

    return result;
  };

  return {
    getTreeData: arrayToTree(props.data),
    getTreeDataEl: arrayToTreeEl(props.data),
    getTreeSelectDataEl: arrayToTreeSelectEl(props.data),
  };
}
