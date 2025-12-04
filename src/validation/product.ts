import { z } from 'zod';

export const productStatusEnum = z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']);

export const createProductSchema = z.object({
	name: z.string().min(2, 'Nama produk minimal 2 karakter').max(200, 'Nama produk maksimal 200 karakter'),
	slug: z.string().min(2, 'Slug minimal 2 karakter').max(200, 'Slug maksimal 200 karakter').regex(/^[a-z0-9-]+$/, 'Slug hanya boleh huruf kecil, angka, dan strip'),
	description: z.string().max(2000, 'Deskripsi maksimal 2000 karakter').optional(),
	sku: z.string().max(100, 'SKU maksimal 100 karakter').optional(),
	barcode: z.string().max(100, 'Barcode maksimal 100 karakter').optional(),
	categoryId: z.string().optional().nullable(),
	status: productStatusEnum.optional().default('DRAFT'),
});

export const updateProductSchema = createProductSchema.partial();

export const createProductVariantSchema = z.object({
	name: z.string().min(1, 'Nama varian wajib diisi').max(100, 'Nama varian maksimal 100 karakter'),
	sku: z.string().max(100, 'SKU maksimal 100 karakter').optional(),
	barcode: z.string().max(100, 'Barcode maksimal 100 karakter').optional(),
	price: z.number().min(0, 'Harga tidak boleh negatif'),
	costPrice: z.number().min(0, 'Harga modal tidak boleh negatif').optional(),
	stock: z.number().int().min(0, 'Stok tidak boleh negatif').optional().default(0),
	weight: z.number().min(0, 'Berat tidak boleh negatif').optional(),
});

export const updateProductVariantSchema = createProductVariantSchema.partial();

export const createProductImageSchema = z.object({
	url: z.string().url('URL gambar tidak valid'),
	alt: z.string().max(200, 'Alt text maksimal 200 karakter').optional(),
	position: z.number().int().min(0).optional().default(0),
});

export type CreateProductSchema = z.infer<typeof createProductSchema>;
export type UpdateProductSchema = z.infer<typeof updateProductSchema>;
export type CreateProductVariantSchema = z.infer<typeof createProductVariantSchema>;
export type UpdateProductVariantSchema = z.infer<typeof updateProductVariantSchema>;
export type CreateProductImageSchema = z.infer<typeof createProductImageSchema>;
