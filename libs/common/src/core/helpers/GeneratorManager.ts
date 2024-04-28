import * as crypto from 'crypto';
import { customAlphabet, nanoid } from 'nanoid';

interface GenerateRandomIdInterface {
  length: number;
  type: 'text' | 'number' | 'textAndNumber';
}

class GeneratorManager {
  /**
   * Generate a hashed token
   * @param charLength - The length of the token
   * @returns The generated hashed token
   * @example
   * generateHashedToken(10)
   * returns 'a1b2c3d4e5'
   */
  static generateHashedToken(charLength: number): string {
    const token = crypto.randomBytes(charLength).toString('hex'); // unencrypted token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex'); // encrypted token
    return hashedToken;
  }

  /**
   * Generate a random id
   * @param length - The length of the id
   * @param type - The type of the id
   * @param prefix - The prefix of the id
   * @returns The generated id
   *
   * @example
   * ```typescript
   * generateRandomId({
   *   length: 12,
   *   type: 'number',
   *   prefix: 'RLID',
   * }) // 'RLID123456789'
   * ```
   */
  static generateRandomId({
    length,
    type = 'textAndNumber',
  }: GenerateRandomIdInterface): string {
    const randomId = nanoid(length);

    if (type === 'number') {
      const randomNumber = customAlphabet('0123456789', length);
      return randomNumber();
    }

    if (type === 'text') {
      const randomText = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ', length);
      return randomText();
    }

    if (type === 'textAndNumber') {
      return randomId;
    }
  }
}

export default GeneratorManager;
