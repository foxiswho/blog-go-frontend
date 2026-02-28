import { dialog, message } from '#/adapter';
import { requestClient } from '#/api/request';

enum Api {
  create = '/pg2lq/sys/iam/resource/create',
  delete = '/pg2lq/sys/iam/resource/delete',
  detail = '/pg2lq/sys/iam/resource/detail/',
  disable = '/pg2lq/sys/iam/resource/disable',
  enable = '/pg2lq/sys/iam/resource/enable',
  existName = '/pg2lq/sys/iam/resource/existName',
  exportExcel = '/pg2lq/sys/iam/resource/exportExcel',
  list = '/pg2lq/sys/iam/resource/query',
  physicalDeletion = '/pg2lq/sys/iam/resource/physicalDeletion',
  recovery = '/pg2lq/sys/iam/resource/recovery',
  selectCategoryPublic = '/pg2lq/sys/iam/resource/selectCategoryPublic',
  selectNodeAllPublic = '/pg2lq/sys/iam/resource/selectNodeAllPublic',
  selectNodePublic = '/pg2lq/sys/iam/resource/selectNodePublic',
  selectPublic = '/pg2lq/sys/iam/resource/selectPublic',
  state = '/pg2lq/sys/iam/resource/state',
  update = '/pg2lq/sys/iam/resource/update',
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
 * 公共列表展示
 * @param data
 */
export const selectPublic = (data?: any) => {
  return requestClient.post(Api.selectPublic, data);
};

/**
 * 公共分类
 * @param data
 */
export const selectCategoryPublic = (data?: any) => {
  return requestClient.post(Api.selectCategoryPublic, data);
};

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
export const saveOrUpdate = (data: any, isUpdate: boolean) => {
  return requestClient.post(isUpdate ? Api.update : Api.create, data, {
    errorMessageMode: 'message',
    successMessageMode: 'notification',
  });
};

/**
 * 删除
 * @param params
 */
export const deleteId = (params: any) => {
  return requestClient.post(Api.physicalDeletion, { ids: [params] });
};

/**
 * 删除
 * @param params
 */
export const deleteIds = (params: any) => {
  return requestClient.post(Api.physicalDeletion, { ids: params });
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
    Api.state,
    { ids: [id], state: status },
    { errorMessageMode: 'message', successMessageMode: 'message' },
  );

/**
 * 导出excel url地址
 */
export const exportExcelUrl = Api.exportExcel;

/**
 * 查询名称是否存在
 * @param wd
 * @param id
 */
export const existName = (wd: string, id?: number | string) => {
  id = id || '0';
  return requestClient.post(
    Api.existName,
    { wd, id },
    { errorMessageMode: 'message', successMessageMode: 'notification' },
  );
};
