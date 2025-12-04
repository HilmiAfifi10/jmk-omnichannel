'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { storeRepository } from '@/repositories/store.repository';
import { stockRepository } from '@/repositories/stock.repository';
import { stockAdjustmentSchema } from '@/validation/stock';
import { ActionResult, StockMovement, PaginationParams, StockMovementType } from '@/types';

export async function getStockMovements(params?: PaginationParams & { type?: StockMovementType }) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return { success: false, error: 'Unauthorized' };
		}

		const store = await storeRepository.findByUserId(session.user.id);
		if (!store) {
			return { success: true, data: { data: [], total: 0, page: 1, pageSize: 20, totalPages: 0 } };
		}

		const result = await stockRepository.findMovementsByStoreId(store.id, params);
		return { success: true, data: result };
	} catch (error) {
		console.error('Error getting stock movements:', error);
		return { success: false, error: 'Gagal memuat riwayat stok' };
	}
}

export async function getStockSummary() {
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
					totalStock: 0,
					totalValue: 0,
					totalCost: 0,
					lowStockCount: 0,
					outOfStockCount: 0,
					variantCount: 0,
				},
			};
		}

		const summary = await stockRepository.getStockSummary(store.id);
		return { success: true, data: summary };
	} catch (error) {
		console.error('Error getting stock summary:', error);
		return { success: false, error: 'Gagal memuat ringkasan stok' };
	}
}

export async function getLowStockVariants() {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return { success: false, error: 'Unauthorized' };
		}

		const store = await storeRepository.findByUserId(session.user.id);
		if (!store) {
			return { success: true, data: [] };
		}

		const variants = await stockRepository.getLowStockVariants(store.id, 10);
		return { success: true, data: variants };
	} catch (error) {
		console.error('Error getting low stock variants:', error);
		return { success: false, error: 'Gagal memuat data stok rendah' };
	}
}

export async function adjustStock(formData: FormData): Promise<ActionResult<StockMovement>> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return { success: false, error: 'Unauthorized' };
		}

		const data = {
			variantId: formData.get('variantId') as string,
			newStock: parseInt(formData.get('newStock') as string),
			notes: formData.get('notes') as string || undefined,
		};

		const validated = stockAdjustmentSchema.safeParse(data);
		if (!validated.success) {
			return {
				success: false,
				error: 'Validasi gagal',
				errors: validated.error.flatten().fieldErrors as Record<string, string[]>,
			};
		}

		const movement = await stockRepository.adjustStock(
			validated.data.variantId,
			validated.data.newStock,
			validated.data.notes
		);

		revalidatePath('/dashboard/stock');
		revalidatePath('/dashboard/products');
		return { success: true, data: movement };
	} catch (error) {
		console.error('Error adjusting stock:', error);
		return { success: false, error: 'Gagal menyesuaikan stok' };
	}
}

export async function addStockMovement(formData: FormData): Promise<ActionResult<StockMovement>> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return { success: false, error: 'Unauthorized' };
		}

		const data = {
			variantId: formData.get('variantId') as string,
			quantity: parseInt(formData.get('quantity') as string),
			type: formData.get('type') as StockMovementType,
			reference: formData.get('reference') as string || undefined,
			notes: formData.get('notes') as string || undefined,
		};

		const movement = await stockRepository.createMovement(data);

		revalidatePath('/dashboard/stock');
		revalidatePath('/dashboard/products');
		return { success: true, data: movement };
	} catch (error) {
		console.error('Error adding stock movement:', error);
		return { success: false, error: 'Gagal menambah pergerakan stok' };
	}
}
