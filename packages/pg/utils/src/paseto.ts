
export function decodePaseto(token) {
  // 按 '.' 分割 Token，获取各部分
  const parts = token.split('.');
  if (parts.length < 3) {
    throw new Error('无效的Token：至少需要包含 Version、Purpose 和 Payload 三部分');
  }

  const [version, purpose, payloadBase64Url, footerBase64Url] = parts;
  // 将 Base64url 转换为标准 Base64 格式
  const toStandardBase64 = (str) => {
    if (!str) return '';
    return str.replace(/-/g, '+').replace(/_/g, '/');
  };

  let decodedPayload;

  // 解码 Payload
  try {
    const body = parseUnverified(token);
    decodedPayload = JSON.parse(body);
  } catch (error) {
    throw new Error(`Payload 解码失败或不是有效的 JSON: ${error.message}`);
  }

  return {
    version,
    purpose,
    payload: decodedPayload
  };
}

/**
 * 将 Base64Url 字符串转换为 Uint8Array
 */
function base64UrlToBytes(base64Url: string): Uint8Array {
  // 替换字符为标准 Base64
  let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  // 补齐填充
  while (base64.length % 4) {
    base64 += '=';
  }
  // 解码为二进制字符串
  const binaryStr = atob(base64);
  // 转换为 Uint8Array
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }
  return bytes;
}

/**
 * 获取载荷内容，不验证签名
 * @param body JWT 格式的令牌字符串
 * @returns 载荷内容，如果格式错误则返回空字符串
 */
function parseUnverified(body: string): string {
  const parts = body.split('.');
  if (parts.length < 3) {
    console.log("令牌格式不正确");
    return "";
  }

  const payloadEncoded = parts[2];
  const decodedBytes = base64UrlToBytes(payloadEncoded);
  const payloadLength = decodedBytes.length - 64;

  if (payloadLength <= 0) {
    console.log("载荷长度错误");
    return "";
  }

  const payloadOnly = decodedBytes.subarray(0, payloadLength);
  return new TextDecoder("utf-8").decode(payloadOnly);
}
