import { z } from 'zod';

export const createCategorySchema = z.object({
	name: z.string().min(2, 'Nama kategori minimal 2 karakter').max(100, 'Nama kategori maksimal 100 karakter'),
	slug: z.string().min(2, 'Slug minimal 2 karakter').max(100, 'Slug maksimal 100 karakter').regex(/^[a-z0-9-]+$/, 'Slug hanya boleh huruf kecil, angka, dan strip'),
	description: z.string().max(500, 'Deskripsi maksimal 500 karakter').optional(),
	image: z.string().url('URL gambar tidak valid').optional().or(z.literal('')),
	parentId: z.string().optional().nullable(),
});

export const updateCategorySchema = createCategorySchema.partial();

export type CreateCategorySchema = z.infer<typeof createCategorySchema>;
export type UpdateCategorySchema = z.infer<typeof updateCategorySchema>;
