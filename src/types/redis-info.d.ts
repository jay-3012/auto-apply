declare module 'redis-info' {
  export interface RedisInfo {
    redis_mode: string;
    [key: string]: string | number | undefined;
  }
}
