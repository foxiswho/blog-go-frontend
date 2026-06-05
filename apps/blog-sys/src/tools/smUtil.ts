import { sm2 } from 'sm-crypto';
import { publicPrivateKey } from '#/viewsRam/accountSessionAccessKey/api';
import { message } from '#/adapter/naive';
import { usePubPreStore } from '#/store';

/**
 * SM2 加密（Hex 格式，与 Java Hutool 互通）
 * @param plainText 明文
 * @param publicKey 公钥（130字符，以04开头）
 * @returns Hex 格式密文
 */
export function sm2EncryptHex(plainText: string, publicKey: string): string {
  // Hutool 生成的公钥带 04 前缀，需要去除或保留取决于 sm-crypto 版本
  // 推荐：先尝试带 04，失败则去除
  const key = publicKey;
  if (key.startsWith('04')) {
    //key = key.substring(2) // sm-crypto 大多数版本需要去除 04
  }
  // cipherMode: 1 - C1C3C2 格式（Hutool 默认使用此格式）
  return sm2.doEncrypt(plainText, key, 1);
}

/**
 * SM2 解密（Hex 格式，与 Java Hutool 互通）
 * @param cipherText Hex 格式密文
 * @param privateKey 私钥（64字符）
 * @returns 明文
 */
export function sm2DecryptHex(cipherText: string, privateKey: string): string {
  // cipherMode: 1 - C1C3C2 格式（Hutool 默认使用此格式）
  return sm2.doDecrypt(cipherText, privateKey, 1);
}

export class SmUtil {
  publicKey: string | null | undefined;

  /**
   * 获取密钥
   */
  fetchPublicKey() {
    publicPrivateKey({ type: 'code' })
      .then((res) => {
        this.publicKey = res.publicKey;
        if (res.publicKey) {
          //存储公钥
          const pubPreStore = usePubPreStore();
          pubPreStore.setLoginPub(res.publicKey);
        }
      })
      .catch((err) => {
        console.error(err);
      });
    return this.publicKey;
  }

  setPublicKey(publicKey: string): void {
    this.publicKey = publicKey;
  }
  /**
   * 加密
   * @param str
   */
  encryptHex(str: string): string {
    if (this.publicKey == null) {
      message.warning('获取密钥失败');
      return '';
    }
    return sm2EncryptHex(str, this.publicKey);
  }
}
