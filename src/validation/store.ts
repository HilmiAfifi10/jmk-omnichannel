import { z } from 'zod';

export const createStoreSchema = z.object({
	name: z.string().min(2, 'Nama toko minimal 2 karakter').max(100, 'Nama toko maksimal 100 karakter'),
	description: z.string().max(500, 'Deskripsi maksimal 500 karakter').optional(),
	logo: z.string().url('URL logo tidak valid').optional().or(z.literal('')),
});

export const updateStoreSchema = createStoreSchema.partial();

export type CreateStoreSchema = z.infer<typeof createStoreSchema>;
export type UpdateStoreSchema = z.infer<typeof updateStoreSchema>;
