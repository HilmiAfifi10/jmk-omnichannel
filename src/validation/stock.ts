import { z } from 'zod';

export const stockMovementTypeEnum = z.enum(['ADJUSTMENT', 'SALE', 'RETURN', 'RESTOCK', 'TRANSFER']);

export const createStockMovementSchema = z.object({
	variantId: z.string().min(1, 'Variant ID wajib diisi'),
	quantity: z.number().int('Quantity harus berupa angka bulat'),
	type: stockMovementTypeEnum,
	reference: z.string().max(200, 'Reference maksimal 200 karakter').optional(),
	notes: z.string().max(500, 'Notes maksimal 500 karakter').optional(),
});

export const stockAdjustmentSchema = z.object({
	variantId: z.string().min(1, 'Variant ID wajib diisi'),
	newStock: z.number().int('Stok harus berupa angka bulat').min(0, 'Stok tidak boleh negatif'),
	notes: z.string().max(500, 'Notes maksimal 500 karakter').optional(),
});

export const bulkStockUpdateSchema = z.object({
	updates: z.array(z.object({
		variantId: z.string().min(1),
		newStock: z.number().int().min(0),
	})),
	notes: z.string().max(500).optional(),
});

export type CreateStockMovementSchema = z.infer<typeof createStockMovementSchema>;
export type StockAdjustmentSchema = z.infer<typeof stockAdjustmentSchema>;
export type BulkStockUpdateSchema = z.infer<typeof bulkStockUpdateSchema>;
