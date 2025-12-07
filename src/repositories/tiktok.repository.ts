import { prisma } from '@/lib/prisma';
import { TikTokIntegration } from '@/types';

export const tiktokRepository = {
  async findByStoreId(storeId: string): Promise<TikTokIntegration | null> {
    return prisma.tikTokIntegration.findUnique({ where: { storeId } }) as Promise<TikTokIntegration | null>;
  },

  async upsertByStoreId(storeId: string, data: Omit<TikTokIntegration, 'id' | 'storeId' | 'createdAt' | 'updatedAt'>): Promise<TikTokIntegration> {
    return prisma.tikTokIntegration.upsert({
      where: { storeId },
      update: data,
      create: {
        storeId,
        ...data,
      },
    }) as Promise<TikTokIntegration>;
  },

  async deleteByStoreId(storeId: string): Promise<void> {
    await prisma.tikTokIntegration.delete({ where: { storeId } });
  },
};
