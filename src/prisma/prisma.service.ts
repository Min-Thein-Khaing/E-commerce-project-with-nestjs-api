import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

type ModelDelegate = {
  deleteMany: () => Promise<unknown>;
};

function isModelDelegate(value: unknown): value is ModelDelegate {
  return (
    typeof value === 'object' &&
    value !== null &&
    'deleteMany' in value &&
    typeof value.deleteMany === 'function'
  );
}

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    });
    super({
      adapter,
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'error', 'warn']
          : ['error'],
    });
  }
  async onModuleInit() {
    await this.$connect();
  }
  async onModuleDestroy() {
    await this.$disconnect();
  }

  async clearDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot clear database in production');
    }

    const modelNames = Reflect.ownKeys(this).filter(
      (key) =>
        typeof key === 'string' && !key.startsWith('$') && !key.startsWith('_'),
    ) as string[];

    const prismaClient = this as unknown as Record<string, unknown>;

    for (const modelName of modelNames) {
      // ⭐️ 'this[modelName] as any' ဆိုပြီး Type ပြောင်းပေးလိုက်ခြင်းဖြင့်
      // TypeScript Error အားလုံး ချက်ချင်း ပျောက်သွားပါလိမ့်မယ်ဗျာ
      const modelDelegate = prismaClient[modelName];

      if (isModelDelegate(modelDelegate)) {
        await modelDelegate.deleteMany();
      }
    }
  }
}
