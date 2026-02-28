/**
 * @description 时间戳转化为年 月 日 时 分 秒
 * @method formatTime(format,num)
 * @param {string} [format='yyyy-MM-dd HH:mm:ss'] 时间格式,不填时默认使用'yyyy-MM-dd HH:MM:SS'格式,更改只需替换中间连接符号就行'yyyy年MM月dd日 HH时MM分SS秒'
 * @param {number} [num = new Date().getTime()] 时间戳,默认使用当前时间戳, new Date().getTime(); 获取当前时间戳（毫秒）
 * @example
 *  var sjc = 1472048779952; //js一般获取的时间戳是13位，PHP一般是10位
 formatTime('yyyy-MM-dd HH:MM:SS',sjc)
 */
export const formatTime = (format = '', num = new Date().getTime()) => {
  format = format || 'yyyy-MM-dd HH:mm:ss'; //第一个参数不填时，使用默认格式
  let ret, date, renum;
  // 处理时间戳，js一般获取的时间戳是13位，PHP一般是10位,根据实际情况做判断处理
  if (num.toString().length == 10) {
    date = new Date(parseInt(num) * 1000);
  } else {
    date = new Date(parseInt(num));
  }
  const opt = {
    y: date.getFullYear().toString(), // 年
    Y: date.getFullYear().toString(), // 年
    M: (date.getMonth() + 1).toString(), // 月
    d: date.getDate().toString(), // 日
    H: date.getHours().toString(), // 时
    m: date.getMinutes().toString(), // 分
    S: date.getSeconds().toString(), // 秒
    s: date.getSeconds().toString(), // 秒
    // 目前用的是这六种符号,有其他格式化字符需求可以继续添加，值必须转化成字符串
  };
  for (const k in opt) {
    ret = new RegExp('(' + k + '+)').exec(format);
    if (ret) {
      renum = ret[1].length == 1 ? opt[k] : opt[k].padStart(ret[1].length, '0'); //根据复数前面是否补零,如“mm”补零，单“m”前面不补零
      format = format.replace(ret[1], renum); //替换
    }
  }
  return format;
};
