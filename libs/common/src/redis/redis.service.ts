import { RedisConnection } from '@common/core/helpers/RedisConnection';
import { Injectable } from '@nestjs/common';
import type { Redis } from 'ioredis';

type TExecuteCommandOptions = {
  parseJson?: 'parse' | 'no-parse';
};

type TRedisKey = {
  prefix: string;
  suffix: string;
  separator?: string;
};

type TRedisCommand<TRedisKey> = (
  instance: Redis,
  redisKey: TRedisKey,
) => Promise<string | number>;

@Injectable()
export class RedisService extends RedisConnection {
  public instance: Redis;

  constructor() {
    super();
    this.instance = this.connection();
  }

  connection() {
    return this.connect({
      port: Number(process.env.REDIS_PORT),
      host: process.env.REDIS_HOST,
      [process.env.NODE_ENV === 'production' ? 'password' : null]:
        process.env.REDIS_PASSWORD,
    });
  }

  /**
   * Execute a command on the Redis instance.
   * Default options will parse the result as JSON.
   *
   * ```ts
   * const result = await redisManager.executeCommand((instance) => instance.get('key'));
   * const result = await redisManager.executeCommand((instance) => instance.get('key'), { parseJson: false });
   * ```
   */
  async executeCommand<TReturnType>(
    redisCommand: TRedisCommand<typeof this.generateRedisKey>,
    options: TExecuteCommandOptions = { parseJson: 'no-parse' },
  ): Promise<TReturnType> {
    const result = await redisCommand(this.instance, this.generateRedisKey);

    if (options.parseJson === 'parse' && typeof result === 'string') {
      return this.safeJsonParse<TReturnType>(result);
    }

    return result as TReturnType;
  }

  protected safeJsonParse<T>(str: string) {
    try {
      return JSON.parse(str) as T;
    } catch (e) {
      return undefined;
    }
  }

  /**
   * Generate a redis key
   *
   * ```ts
   * const key = redisManager.generateRedisKey({
   *  prefix: 'user',
   *  suffix: '123456789',
   * });
   * ```
   */
  generateRedisKey({ prefix, suffix, separator = '#' }: TRedisKey): string {
    return `${prefix}${separator}${suffix}`;
  }
}
