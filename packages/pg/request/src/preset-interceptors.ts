import type { ResponseInterceptorConfig } from '@vben/request';

import { isFunction } from '@vben/utils';

export const defaultResponseInterceptorPg = ({
  callFn,
  codeField = 'code',
  dataField = 'data',
  successCode = 0,
}: {
  /** 执行自定义方法 */
  callFn: ((response: any) => any) | string;
  /** 响应数据中代表访问结果的字段名 */
  codeField: string;
  /** 响应数据中装载实际数据的字段名，或者提供一个函数从响应数据中解析需要返回的数据 */
  dataField: ((response: any) => any) | string;
  /** 当codeField所指定的字段值与successCode相同时，代表接口访问成功。如果提供一个函数，则返回true代表接口访问成功 */
  successCode: ((code: any) => boolean) | number | string;
}): ResponseInterceptorConfig => {
  return {
    fulfilled: (response) => {
      const { config, data: responseData, status } = response;

      if (config.responseReturn === 'raw') {
        return response;
      }
      const { code, data } = responseData;

      if (code === 0 || code === '200') {
        if (undefined !== callFn && isFunction(callFn)) {
          callFn(response);
        }
        return data;
      } else if (status >= 200 && status < 400) {
        if (config.responseReturn === 'body') {
          return responseData;
        } else if (
          isFunction(successCode)
            ? successCode(responseData[codeField])
            : responseData[codeField] === successCode
        ) {
          return isFunction(dataField)
            ? dataField(responseData)
            : responseData[dataField];
        }
      }
      throw Object.assign({}, response, { response });
    },
  };
};
