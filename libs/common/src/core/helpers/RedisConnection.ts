import Redis from 'ioredis';

interface ConnectionConfig {
  port: number;
  host: string;
  password?: string;
}

class RedisConnection {
  protected instance: Redis;

  protected connect(config: ConnectionConfig): Redis {
    if (!this.instance) {
      this.instance = new Redis({
        port: Number(config.port),
        host: config.host as string,
        [config.password ? 'password' : null]: config.password
          ? config.password
          : undefined,
      });
    }
    return this.instance;
  }
}

export { RedisConnection };
