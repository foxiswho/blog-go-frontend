import { dialog, message } from '#/adapter';
import { requestClient } from '#/api/request';

enum Api {
  create = '/xianfu/sys/basic/data-dictionary/create',
  createUpdate = '/xianfu/sys/basic/data-dictionary/createUpdate',
  delete = '/xianfu/sys/basic/data-dictionary/delete',
  detail = '/xianfu/sys/basic/data-dictionary/detail/',
  disable = '/xianfu/sys/basic/data-dictionary/disable',
  enable = '/xianfu/sys/basic/data-dictionary/enable',
  existName = '/xianfu/sys/basic/data-dictionary/existName',
  existCode = '/xianfu/sys/basic/data-dictionary/existCode',
  existValue = '/xianfu/sys/basic/data-dictionary/existValue',
  exportExcel = '/xianfu/sys/basic/data-dictionary/exportExcel',
  list = '/xianfu/sys/basic/data-dictionary/query',
  physicalDeletion = '/xianfu/sys/basic/data-dictionary/physicalDeletion',
  recovery = '/xianfu/sys/basic/data-dictionary/recovery',
  selectNodeAllPublic = '/xianfu/sys/basic/data-dictionary/selectNodeAllPublic',
  selectNodePublic = '/xianfu/sys/basic/data-dictionary/selectNodePublic',
  selectPublic = '/xianfu/sys/basic/data-dictionary/selectPublic',
  state = '/xianfu/sys/basic/data-dictionary/state',
  update = '/xianfu/sys/basic/data-dictionary/update',
  typeCodePublic = '/xianfu/sys/basic/data-dictionary/typeCodePublic',
}

/**
 * 列表
 * @constructor
 * @param data
 */
export async function List(data?: any) {
  return requestClient.post(Api.list, data);
}

/**
 * 公共树展示
 * @param data
 */
export const selectNodePublic = (data?: any) => {
  return requestClient.post(Api.selectNodePublic, data);
};

/**
 * 公共树展示
 * @param data
 */
export const selectNodeAllPublic = (data?: any) => {
  return requestClient.post(Api.selectNodeAllPublic, data);
};
/**
 * 公共树展示
 * @param data
 */
export const typeCodePublic = async (param) => {
  let typeCode ='';
  if (param && param?.typeCode) {
    typeCode= param.typeCode;
  } else if (typeof param === 'string') {
    typeCode = param;
  }
  return requestClient.get(Api.typeCodePublic+'/'+typeCode);
};

/**
 * 公共树展示
 * @param data
 */
export const typeCodePublicPost = async (param) => {
  let data = {typeCode:''};
  if (param && param?.typeCode) {
    data= param;
  } else if (typeof param === 'string') {
    data.typeCode = param;
  }
  return requestClient.post(Api.typeCodePublic, data);
};

/**
 * 详情
 * @param data
 */
export const detail = (data?: any) => {
  return requestClient.get(Api.detail + data);
};

/**
 * 保存或者更新
 * @param data
 * @param isUpdate
 */
export const saveOrUpdate = (data: any) => {
  return requestClient.post(Api.createUpdate, data, {
    errorMessageMode: 'message',
    successMessageMode: 'notification',
  });
};

/**
 * 删除
 * @param params
 */
export const deleteId = (params: any) => {
  return requestClient.post(Api.delete, { ids: [params] });
};

/**
 * 删除
 * @param params
 */
export const deleteIds = (params: any) => {
  return requestClient.post(Api.delete, { ids: params });
};

/**
 * 批量选中-删除
 * @param params
 */
export const batchSelectDelete = (params, handleSuccess) => {
  dialog.warning({
    title: '确认删除',
    content: '是否删除选中数据',
    positiveText: '确认',
    negativeText: '取消',
    onPositiveClick: () => {
      return requestClient
        .post(
          Api.delete,
          { ids: params },
          { errorMessageMode: 'message', successMessageMode: 'message' },
        )
        .then((item) => {
          handleSuccess(item);
        })
        .catch(() => {
          message.warning('操作失败');
        });
    },
  });
};

/**
 * 批量选中-启用
 * @param params
 */
export const batchSelectEnable = (params, handleSuccess) => {
  dialog.warning({
    title: '确认设置有效',
    content: '是否[批量有效]选中数据',
    positiveText: '确认',
    negativeText: '取消',
    onPositiveClick: () => {
      return requestClient
        .post(
          Api.enable,
          { ids: params },
          { errorMessageMode: 'message', successMessageMode: 'message' },
        )
        .then((item) => {
          handleSuccess(item);
        })
        .catch(() => {
          message.warning('操作失败');
        });
    },
  });
};

/**
 * 批量选中-禁用
 * @param params
 */
export const batchSelectDisable = (params, handleSuccess) => {
  dialog.warning({
    title: '确认设置停用',
    content: '是否[批量停用]选中数据',
    positiveText: '确认',
    negativeText: '取消',
    onPositiveClick: () => {
      return requestClient
        .post(
          Api.disable,
          { ids: params },
          { errorMessageMode: 'message', successMessageMode: 'message' },
        )
        .then((item) => {
          handleSuccess(item);
        })
        .catch(() => {
          message.warning('操作失败');
        });
    },
  });
};

/**
 * 批量选中-恢复
 * @param params
 */
export const batchSelectRecovery = (params, handleSuccess) => {
  dialog.warning({
    title: '确认设置恢复',
    content: '是否[批量恢复]选中数据',
    positiveText: '确认',
    negativeText: '取消',
    onPositiveClick: () => {
      return requestClient
        .post(
          Api.recovery,
          { ids: params },
          { errorMessageMode: 'message', successMessageMode: 'message' },
        )
        .then((item) => {
          handleSuccess(item);
        })
        .catch(() => {
          message.warning('操作失败');
        });
    },
  });
};

/**
 * 批量选中-物理删除
 * @param params
 */
export const batchSelectPhysicalDeletion = (params, handleSuccess) => {
  dialog.warning({
    title: '确认物理删除',
    content: '是否[物理删除]选中数据，操作后数据不可恢复',
    positiveText: '确认',
    negativeText: '取消',
    onPositiveClick: () => {
      return requestClient
        .post(
          Api.physicalDeletion,
          { ids: params },
          { errorMessageMode: 'message', successMessageMode: 'message' },
        )
        .then((item) => {
          handleSuccess(item);
        })
        .catch(() => {
          message.warning('操作失败');
        });
    },
  });
};

/**
 * 批量-设置状态
 * @param id
 * @param status 1 有效 2 停用
 */
export const setStateEnableDisable = (id: number, status: number) =>
  requestClient.post(
    status === 1 ? Api.enable : Api.disable,
    { ids: [id], state: status },
    { errorMessageMode: 'message', successMessageMode: 'message' },
  );
/**
 * 导出excel url地址
 */
export const exportExcelUrl = Api.exportExcel;

/**
 * 查询名称是否存在
 * @param params
 */
export const existName = (wd, id?) => {
  id = id || '0';
  return requestClient.post(
    Api.existName,
    { wd, id },
    { errorMessageMode: 'message', successMessageMode: 'notification' },
  );
};
/**
 * 查询名称是否存在
 * @param params
 */
export const existCode = (wd, id?) => {
  id = id || '0';
  return requestClient.post(
    Api.existCode,
    { wd, id },
    { errorMessageMode: 'message', successMessageMode: 'notification' },
  );
};

/**
 * 查询名称是否存在
 * @param params
 */
export const existValue = (wd, id?) => {
  id = id || '0';
  return requestClient.post(
    Api.existValue,
    { wd, id },
    { errorMessageMode: 'message', successMessageMode: 'notification' },
  );
};
