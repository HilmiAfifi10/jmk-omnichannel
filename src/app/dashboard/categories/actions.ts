'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { storeRepository } from '@/repositories/store.repository';
import { categoryRepository } from '@/repositories/category.repository';
import { createCategorySchema, updateCategorySchema } from '@/validation/category';
import { ActionResult, Category, PaginationParams } from '@/types';

export async function getCategories(params?: PaginationParams) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return { success: false, error: 'Unauthorized' };
		}

		const store = await storeRepository.findByUserId(session.user.id);
		if (!store) {
			return { success: true, data: { data: [], total: 0, page: 1, pageSize: 10, totalPages: 0 } };
		}

		const result = await categoryRepository.findByStoreId(store.id, params);
		return { success: true, data: result };
	} catch (error) {
		console.error('Error getting categories:', error);
		return { success: false, error: 'Gagal memuat kategori' };
	}
}

export async function getAllCategories(): Promise<ActionResult<Category[]>> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return { success: false, error: 'Unauthorized' };
		}

		const store = await storeRepository.findByUserId(session.user.id);
		if (!store) {
			return { success: true, data: [] };
		}

		const categories = await categoryRepository.findAllByStoreId(store.id);
		return { success: true, data: categories };
	} catch (error) {
		console.error('Error getting all categories:', error);
		return { success: false, error: 'Gagal memuat kategori' };
	}
}

export async function getCategoryById(id: string): Promise<ActionResult<Category>> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return { success: false, error: 'Unauthorized' };
		}

		const category = await categoryRepository.findById(id);
		if (!category) {
			return { success: false, error: 'Kategori tidak ditemukan' };
		}

		return { success: true, data: category };
	} catch (error) {
		console.error('Error getting category:', error);
		return { success: false, error: 'Gagal memuat kategori' };
	}
}

export async function createCategory(formData: FormData): Promise<ActionResult<Category>> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return { success: false, error: 'Unauthorized' };
		}

		let store = await storeRepository.findByUserId(session.user.id);
		if (!store) {
			// Auto create store
			store = await storeRepository.create({
				name: `Toko ${session.user.name || 'Saya'}`,
				userId: session.user.id,
			});
		}

		const data = {
			name: formData.get('name') as string,
			slug: formData.get('slug') as string,
			description: formData.get('description') as string || undefined,
			image: formData.get('image') as string || undefined,
			parentId: formData.get('parentId') as string || null,
		};

		const validated = createCategorySchema.safeParse(data);
		if (!validated.success) {
			return {
				success: false,
				error: 'Validasi gagal',
				errors: validated.error.flatten().fieldErrors as Record<string, string[]>,
			};
		}

		// Check if slug exists
		const slugExists = await categoryRepository.checkSlugExists(data.slug, store.id);
		if (slugExists) {
			return {
				success: false,
				error: 'Slug sudah digunakan',
				errors: { slug: ['Slug sudah digunakan'] },
			};
		}

		const category = await categoryRepository.create({
			...validated.data,
			storeId: store.id,
			parentId: validated.data.parentId || undefined,
		});

		revalidatePath('/dashboard/categories');
		return { success: true, data: category };
	} catch (error) {
		console.error('Error creating category:', error);
		return { success: false, error: 'Gagal membuat kategori' };
	}
}

export async function updateCategory(id: string, formData: FormData): Promise<ActionResult<Category>> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return { success: false, error: 'Unauthorized' };
		}

		const store = await storeRepository.findByUserId(session.user.id);
		if (!store) {
			return { success: false, error: 'Store not found' };
		}

		const existingCategory = await categoryRepository.findById(id);
		if (!existingCategory || existingCategory.storeId !== store.id) {
			return { success: false, error: 'Kategori tidak ditemukan' };
		}

		const data = {
			name: formData.get('name') as string || undefined,
			slug: formData.get('slug') as string || undefined,
			description: formData.get('description') as string || undefined,
			image: formData.get('image') as string || undefined,
			parentId: formData.get('parentId') as string || null,
		};

		const validated = updateCategorySchema.safeParse(data);
		if (!validated.success) {
			return {
				success: false,
				error: 'Validasi gagal',
				errors: validated.error.flatten().fieldErrors as Record<string, string[]>,
			};
		}

		// Check if slug exists (excluding current)
		if (data.slug && data.slug !== existingCategory.slug) {
			const slugExists = await categoryRepository.checkSlugExists(data.slug, store.id, id);
			if (slugExists) {
				return {
					success: false,
					error: 'Slug sudah digunakan',
					errors: { slug: ['Slug sudah digunakan'] },
				};
			}
		}

		const category = await categoryRepository.update(id, validated.data);

		revalidatePath('/dashboard/categories');
		return { success: true, data: category };
	} catch (error) {
		console.error('Error updating category:', error);
		return { success: false, error: 'Gagal mengupdate kategori' };
	}
}

export async function deleteCategory(id: string): Promise<ActionResult> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return { success: false, error: 'Unauthorized' };
		}

		const store = await storeRepository.findByUserId(session.user.id);
		if (!store) {
			return { success: false, error: 'Store not found' };
		}

		const existingCategory = await categoryRepository.findById(id);
		if (!existingCategory || existingCategory.storeId !== store.id) {
			return { success: false, error: 'Kategori tidak ditemukan' };
		}

		// Check if has children
		if (existingCategory._count?.children && existingCategory._count.children > 0) {
			return { success: false, error: 'Kategori memiliki sub-kategori. Hapus sub-kategori terlebih dahulu.' };
		}

		// Check if has products
		if (existingCategory._count?.products && existingCategory._count.products > 0) {
			return { success: false, error: 'Kategori memiliki produk. Pindahkan atau hapus produk terlebih dahulu.' };
		}

		await categoryRepository.delete(id);

		revalidatePath('/dashboard/categories');
		return { success: true };
	} catch (error) {
		console.error('Error deleting category:', error);
		return { success: false, error: 'Gagal menghapus kategori' };
	}
}
