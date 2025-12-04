import { prisma } from '@/lib/prisma';
import {
	CreateStoreInput,
	UpdateStoreInput,
	Store,
} from '@/types';

export const storeRepository = {
	async findById(id: string): Promise<Store | null> {
		return prisma.store.findUnique({
			where: { id },
		});
	},

	async findByUserId(userId: string): Promise<Store | null> {
		return prisma.store.findFirst({
			where: { userId },
		});
	},

	async create(data: CreateStoreInput): Promise<Store> {
		return prisma.store.create({
			data,
		});
	},

	async update(id: string, data: UpdateStoreInput): Promise<Store> {
		return prisma.store.update({
			where: { id },
			data,
		});
	},

	async delete(id: string): Promise<void> {
		await prisma.store.delete({
			where: { id },
		});
	},
};
