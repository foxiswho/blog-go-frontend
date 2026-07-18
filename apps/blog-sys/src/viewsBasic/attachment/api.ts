import { dialog, message } from '#/adapter';
import { requestClient } from '#/api/request';

enum Api {
  create = '/xianfu/sys/basic/attachment/create',
  delete = '/xianfu/sys/basic/attachment/delete',
  detail = '/xianfu/sys/basic/attachment/detail/',
  disable = '/xianfu/sys/basic/attachment/disable',
  enable = '/xianfu/sys/basic/attachment/enable',
  existName = '/xianfu/sys/basic/attachment/existName',
  exportExcel = '/xianfu/sys/basic/attachment/exportExcel',
  list = '/xianfu/sys/basic/attachment/query',
  physicalDeletion = '/xianfu/sys/basic/attachment/physicalDeletion',
  recovery = '/xianfu/sys/basic/attachment/recovery',
  selectNodeAllPublic = '/xianfu/sys/basic/attachment/selectNodeAllPublic',
  selectNodePublic = '/xianfu/sys/basic/attachment/selectNodePublic',
  selectPublic = '/xianfu/sys/basic/attachment/selectPublic',
  state = '/xianfu/sys/basic/attachment/state',
  update = '/xianfu/sys/basic/attachment/update',
  makeFileOwnerPublic = '/xianfu/sys/basic/attachment/makeFileOwnerPublic',
  makeFileOwnerAllPublic = '/xianfu/sys/basic/attachment/upload-makeFileOwnerAllPublic',
  upload = '/xianfu/sys/basic/filePub/upload',
  uploadQr = '/xianfu/sys/basic/filePub/upload-qr',
  uploadLink = '/xianfu/sys/basic/filePub/upload-link',
  uploadList = '/xianfu/sys/basic/filePub/upload-list',
  updateByFileOwner = '/xianfu/sys/basic/filePub/upload-updateByFileOwner',
  updateDetail = '/xianfu/sys/basic/filePub/upload-detail',
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
export const batchSelectDelete = (params:any, handleSuccess:any) => {
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
export const batchSelectEnable = (params:any, handleSuccess:any) => {
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
export const batchSelectDisable = (params:any, handleSuccess:any) => {
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
export const batchSelectRecovery = (params:any, handleSuccess:any) => {
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
export const batchSelectPhysicalDeletion = (params:any, handleSuccess:any) => {
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
 * 设置文件拥有者
 * @param data {
 *   num: 1, //生成数量
 *   mark : '标记',
 *   rule : [
 *   //自定义规则
 *      {
 *        mark : '标记',
 *      }
 *   ]
 * }
 */
export const makeFileOwnerAllPublic = (data?) => {
  data = data || {};
  return requestClient.post(Api.makeFileOwnerAllPublic, data);
};

/**
 * 设置文件拥有者
 * @param data {
 *   mark : '标记'
 * }
 */
export const makeFileOwnerPublic = (data?) => {
  data = data || {};
  return requestClient.post(Api.makeFileOwnerPublic, data);
};

/**
 * 设置文件拥有者
 * @param data {
 *   mark : '标记'
 * }
 */
export const uploadUpByFileOwner = (data?) => {
  data = data || {};
  return requestClient.post(Api.updateByFileOwner, { data: data });
};

/**
 * 设置文件拥有者
 * @param data {
 *   mark : '标记'
 * }
 * @param setting
 */
export const uploadFn = (data?: any, setting?: {
  type?:string,
  url?:string,
  config?:object,
}) => {
  let url = Api.upload;
  data = data || {};
  let config = {};
  if (setting) {
    if (setting.type) {
      data['type'] = setting.type;
    }
    if (setting.url) {
      url = setting.url;
    } else {
      url = `${Api.upload}-${  setting.type}`;
    }
    if (setting.config) {
      config = setting.config;
    }
    if(setting.type && setting.type === 'formdata') {
      url = Api.upload;
      config = setting?.config || {
        errorMessageMode: 'message',
        isTransformResponse: false,
        successMessageMode: 'notification',
        withToken: true,
        headers: {
          'Content-Type': `multipart/form-data;boundary = ${Date.now()}`,
        },
      };
    }
  }
  return requestClient.post(url, data, config);
};


/**
 * 定义自定义上传函数
 * @param
 */
export const uploadFnByMarkdown = (data:any, setting?: {
  type?:string,
  url?:string,
  config?:object,
})=> {
  let config = setting?.config || {
    errorMessageMode: '',
    isTransformResponse: false,
    successMessageMode: '',
    withToken: true,
    headers: {
      'Content-Type': `multipart/form-data;boundary = ${Date.now()}`,
    },
  };
    return requestClient.post(Api.upload+'-more', data,config);
}
/**
 * key 详情
 * @param data {
 *   mark : '标记'
 * }
 */
export const updateDetail = (key:string) => {
  return requestClient.post(Api.updateDetail, { fileOwner:key });
};
