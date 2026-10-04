# NestJS Cache & Queue Management Setup Guide

This guide details how to implement a production-ready cache management system using **NestJS**, **Redis**, and **BullMQ**.

---

## 🛠️ Step 1: Install Dependencies

Run the following commands in your terminal to install the necessary packages:

```bash
npm install @nestjs/bullmq bullmq ioredis
npm install --save-dev @types/ioredis
```

---

## ⚙️ Step 2: Configure Global Redis Connection

Register the global Redis connection inside `AppModule`.

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { CacheModule } from './cache/cache.module';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),
    CacheModule,
  ],
})
export class AppModule {}
```

---

## 📦 Step 3: Implement Cache Service (Get / Set & Pattern Invalidation)

Create `CacheService` to handle `getOrSetCache` logic (supporting optional `userId` for dynamic key generation) and safe Redis pattern invalidation using stream pipelines.

```typescript
// src/cache/cache.service.ts
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class CacheService implements OnModuleDestroy {
  private readonly redis: Redis;

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    });
  }

  // Get or Set Cache Logic
  async getOrSetCache<T>(
    key: string,
    callback: () => Promise<T>,
    userId?: string | number,
    ttl: number = 3600 // Default 1 hour (in seconds)
  ): Promise<T> {
    const cacheKey = userId ? `user:${userId}:${key}` : `global:${key}`;

    try {
      const cacheData = await this.redis.get(cacheKey);
      if (cacheData) {
        console.log(`[Cache Hit] Key: ${cacheKey}`);
        return JSON.parse(cacheData);
      }

      console.log(`[Cache Miss] Key: ${cacheKey}`);
      const freshData = await callback();
      await this.redis.set(cacheKey, JSON.stringify(freshData), 'EX', ttl);
      return freshData;
    } catch (error) {
      console.error(`[Redis Error] Key: ${cacheKey}`, error);
      throw error;
    }
  }

  // Scan and Delete Keys safely (for Queue Worker)
  async invalidateCachePattern(pattern: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const stream = this.redis.scanStream({
        match: pattern,
        count: 100,
      });

      let totalKeys = 0;

      stream.on('data', async (keys: string[]) => {
        if (keys.length > 0) {
          totalKeys += keys.length;
          const pipeline = this.redis.pipeline();
          keys.forEach((key) => pipeline.del(key));

          stream.pause();
          try {
            await pipeline.exec();
          } catch (err) {
            return reject(err);
          }
          stream.resume();
        }
      });

      stream.on('end', () => {
        console.log(`[Cache Invalidation] Successfully cleared ${totalKeys} keys for pattern: ${pattern}`);
        resolve();
      });

      stream.on('error', (err) => reject(err));
    });
  }

  onModuleDestroy() {
    this.redis.disconnect();
  }
}
```

---

## 🔄 Step 4: Create Queue Processor / Worker

Create a BullMQ processor to process invalidation jobs asynchronously in the background.

```typescript
// src/cache/cache-invalidation.processor.ts
import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { CacheService } from './cache.service';

@Processor('cache-invalidation', {
  concurrency: 5, // Production အတွက် တစ်ပြိုင်နက်တည်း Process 5 ခုထိ လက်ခံမည်
})
export class CacheInvalidationProcessor extends WorkerHost {
  private readonly logger = new Logger(CacheInvalidationProcessor.name);

  constructor(private readonly cacheService: CacheService) {
    super();
  }

  // Queue ထဲမှ Job ကို Background တွင် အလုပ်လုပ်ခြင်း
  async process(job: Job<{ pattern: string }>): Promise<void> {
    const { pattern } = job.data;
    this.logger.log(`Processing cache invalidation for pattern: ${pattern}`);

    await this.cacheService.invalidateCachePattern(pattern);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Job ${job.id} completed successfully.`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, err: Error) {
    this.logger.error(`Job ${job.id} failed with error: ${err.message}`);
  }
}
```

---

## 🧱 Step 5: Register Everything in CacheModule

Combine the service, processor, and queue registration inside `CacheModule`.

```typescript
// src/cache/cache.module.ts
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { CacheService } from './cache.service';
import { CacheInvalidationProcessor } from './cache-invalidation.processor';

@Module({
  imports: [
    // Queue Name ကို စနစ်တကျ သတ်မှတ်ခြင်း
    BullModule.registerQueue({
      name: 'cache-invalidation',
      defaultJobOptions: {
        attempts: 3, // Invalidation ပျက်စီးပါက ၃ ကြိမ်အထိ Retries လုပ်မည်
        backoff: {
          type: 'exponential',
          delay: 1000, // Error တက်ပါက ၁ စက္ကန့်ခြားပြီးမှ Retry ပြန်စမည်
        },
        removeOnComplete: true, // Complete ဖြစ်ပြီးသား Job များကို Memory ထဲမှ ရှင်းမည်
        removeOnFail: 100, // Fail ဖြစ်သွားသည့် Job ၁၀၀ ကိုသာ Log အဖြစ် သိမ်းမည်
      },
    }),
  ],
  providers: [CacheService, CacheInvalidationProcessor],
  exports: [CacheService, BullModule], // အခြား Module များတွင် ပြန်သုံးနိုင်ရန် Export လုပ်ပါ
})
export class CacheModule {}
```

---

## 🚀 Step 6: Usage Example in Application Services

Inject `CacheService` and the `cache-invalidation` Queue into your domain services (e.g., `UserService`).

```typescript
// src/user/user.service.ts
import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class UserService {
  constructor(
    private readonly cacheService: CacheService,
    @InjectQueue('cache-invalidation') private readonly cacheQueue: Queue,
  ) {}

  // 1. Customer သို့မဟုတ် Admin အတွက် Cache Get/Set ပြုလုပ်ခြင်း
  async getUserOrders(userId: string) {
    return this.cacheService.getOrSetCache(
      'orders',
      async () => {
        // DB Call Example
        return [{ id: 1, amount: 500 }];
      },
      userId, // User Specific Key ဖြစ်သွားမည် (user:123:orders)
      1800   // TTL: 30 minutes
    );
  }

  // 2. Data Update ဖြစ်သွားပါက Queue ထို့သို့ Invalidation Job ထည့်သွင်းခြင်း
  async updateUserOrders(userId: string) {
    // Database Update ပြုလုပ်ပြီးပါက...

    // Queue ထဲသို့ Background Job အဖြစ် ထည့်သွင်းမည်
    await this.cacheQueue.add('clear-user-cache', {
      pattern: `user:${userId}:*`, // အဆိုပါ User ရဲ့ Cache အားလုံးကို Background ကနေ ရှင်းထုတ်ပါမည်
    });

    return { message: 'Order updated and cache cleanup queued' };
  }
}
```