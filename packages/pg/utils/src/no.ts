import { customAlphabet } from 'nanoid';

export function getNanoidNumber(num?: number) {
  const nanoidNumber = customAlphabet('1234567890', num);
  return nanoidNumber();
}

export function getNanoidNo(num?: number) {
  const nanoidNumber = customAlphabet(
    '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
    num,
  );
  return nanoidNumber();
}
