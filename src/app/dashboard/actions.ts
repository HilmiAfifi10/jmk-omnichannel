'use server';

import { auth } from '@/lib/auth';
import { storeRepository } from '@/repositories/store.repository';
import { productRepository } from '@/repositories/product.repository';
import { categoryRepository } from '@/repositories/category.repository';
import { stockRepository } from '@/repositories/stock.repository';
import { ActionResult } from '@/types';

export async function getOrCreateStore(): Promise<ActionResult<{ id: string; name: string }>> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return { success: false, error: 'Unauthorized' };
		}

		let store = await storeRepository.findByUserId(session.user.id);

		if (!store) {
			store = await storeRepository.create({
				name: `Toko ${session.user.name || 'Saya'}`,
				userId: session.user.id,
			});
		}

		return {
			success: true,
			data: { id: store.id, name: store.name },
		};
	} catch (error) {
		console.error('Error getting/creating store:', error);
		return { success: false, error: 'Gagal memuat data toko' };
	}
}

export async function getDashboardStats() {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return { success: false, error: 'Unauthorized' };
		}

		const store = await storeRepository.findByUserId(session.user.id);
		if (!store) {
			return {
				success: true,
				data: {
					totalProducts: 0,
					activeProducts: 0,
					totalCategories: 0,
					lowStockItems: 0,
					totalStock: 0,
					totalValue: 0,
				},
			};
		}

		const [productStats, categories, stockSummary] = await Promise.all([
			productRepository.getProductStats(store.id),
			categoryRepository.findAllByStoreId(store.id),
			stockRepository.getStockSummary(store.id),
		]);

		return {
			success: true,
			data: {
				totalProducts: productStats.total,
				activeProducts: productStats.active,
				draftProducts: productStats.draft,
				totalCategories: categories.length,
				lowStockItems: stockSummary.lowStockCount,
				outOfStockItems: stockSummary.outOfStockCount,
				totalStock: stockSummary.totalStock,
				totalValue: stockSummary.totalValue,
				totalCost: stockSummary.totalCost,
			},
		};
	} catch (error) {
		console.error('Error getting dashboard stats:', error);
		return { success: false, error: 'Gagal memuat statistik' };
	}
}

export async function getLowStockProducts() {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return { success: false, error: 'Unauthorized' };
		}

		const store = await storeRepository.findByUserId(session.user.id);
		if (!store) {
			return { success: true, data: [] };
		}

		const lowStockVariants = await stockRepository.getLowStockVariants(store.id, 5);
		return { success: true, data: lowStockVariants };
	} catch (error) {
		console.error('Error getting low stock products:', error);
		return { success: false, error: 'Gagal memuat data stok rendah' };
	}
}
