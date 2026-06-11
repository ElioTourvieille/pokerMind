import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common'
import Redis from 'ioredis'

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name)
  private readonly client: Redis

  constructor() {
    this.client = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
      lazyConnect: true,
    })
    this.client.on('error', (err) => this.logger.warn(`Redis: ${err.message}`))
  }

  async get<T>(key: string): Promise<T | null> {
    const val = await this.client.get(key)
    return val ? (JSON.parse(val) as T) : null
  }

  async set(key: string, value: unknown, ttlSecondes: number): Promise<void> {
    await this.client.set(key, JSON.stringify(value), 'EX', ttlSecondes)
  }

  async del(key: string): Promise<void> {
    await this.client.del(key)
  }

  onModuleDestroy() {
    this.client.disconnect()
  }
}
