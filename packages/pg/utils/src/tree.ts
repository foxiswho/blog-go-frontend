/**
 *  找到所有节点
 * */
export function getTreeAll(data: any[]): any[] {
  const treeAll: any[] = [];
  data.map((item) => {
    treeAll.push(item.key);
    if (item.children && item.children.length) {
      const ids = getTreeAll(item.children);
      if (ids && ids.length > 0) {
        ids.forEach((id) => {
          treeAll.push(id);
        });
      }
    }
  });
  return treeAll;
}
