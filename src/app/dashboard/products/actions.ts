'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { storeRepository } from '@/repositories/store.repository';
import { productRepository } from '@/repositories/product.repository';
import { createProductSchema, updateProductSchema, createProductVariantSchema, updateProductVariantSchema } from '@/validation/product';
import { ActionResult, Product, ProductVariant, PaginationParams, ProductStatus } from '@/types';

export async function getProducts(params?: PaginationParams & { status?: ProductStatus; categoryId?: string }) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return { success: false, error: 'Unauthorized' };
		}

		const store = await storeRepository.findByUserId(session.user.id);
		if (!store) {
			return { success: true, data: { data: [], total: 0, page: 1, pageSize: 10, totalPages: 0 } };
		}

		const result = await productRepository.findByStoreId(store.id, params);
		return { success: true, data: result };
	} catch (error) {
		console.error('Error getting products:', error);
		return { success: false, error: 'Gagal memuat produk' };
	}
}

export async function getProductById(id: string): Promise<ActionResult<Product>> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return { success: false, error: 'Unauthorized' };
		}

		const product = await productRepository.findById(id);
		if (!product) {
			return { success: false, error: 'Produk tidak ditemukan' };
		}

		return { success: true, data: product };
	} catch (error) {
		console.error('Error getting product:', error);
		return { success: false, error: 'Gagal memuat produk' };
	}
}

export async function createProduct(formData: FormData): Promise<ActionResult<Product>> {
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

		const data = {
			name: formData.get('name') as string,
			slug: formData.get('slug') as string,
			description: formData.get('description') as string || undefined,
			sku: formData.get('sku') as string || undefined,
			barcode: formData.get('barcode') as string || undefined,
			categoryId: formData.get('categoryId') as string || null,
			status: (formData.get('status') as ProductStatus) || 'DRAFT',
		};

		const validated = createProductSchema.safeParse(data);
		if (!validated.success) {
			return {
				success: false,
				error: 'Validasi gagal',
				errors: validated.error.flatten().fieldErrors as Record<string, string[]>,
			};
		}

		// Check if slug exists
		const slugExists = await productRepository.checkSlugExists(data.slug, store.id);
		if (slugExists) {
			return {
				success: false,
				error: 'Slug sudah digunakan',
				errors: { slug: ['Slug sudah digunakan'] },
			};
		}

		const product = await productRepository.create({
			...validated.data,
			storeId: store.id,
			categoryId: validated.data.categoryId || undefined,
		});

		revalidatePath('/dashboard/products');
		return { success: true, data: product };
	} catch (error) {
		console.error('Error creating product:', error);
		return { success: false, error: 'Gagal membuat produk' };
	}
}

export async function updateProduct(id: string, formData: FormData): Promise<ActionResult<Product>> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return { success: false, error: 'Unauthorized' };
		}

		const store = await storeRepository.findByUserId(session.user.id);
		if (!store) {
			return { success: false, error: 'Store not found' };
		}

		const existingProduct = await productRepository.findById(id);
		if (!existingProduct || existingProduct.storeId !== store.id) {
			return { success: false, error: 'Produk tidak ditemukan' };
		}

		const data = {
			name: formData.get('name') as string || undefined,
			slug: formData.get('slug') as string || undefined,
			description: formData.get('description') as string || undefined,
			sku: formData.get('sku') as string || undefined,
			barcode: formData.get('barcode') as string || undefined,
			categoryId: formData.get('categoryId') as string || null,
			status: formData.get('status') as ProductStatus || undefined,
		};

		const validated = updateProductSchema.safeParse(data);
		if (!validated.success) {
			return {
				success: false,
				error: 'Validasi gagal',
				errors: validated.error.flatten().fieldErrors as Record<string, string[]>,
			};
		}

		// Check if slug exists (excluding current)
		if (data.slug && data.slug !== existingProduct.slug) {
			const slugExists = await productRepository.checkSlugExists(data.slug, store.id, id);
			if (slugExists) {
				return {
					success: false,
					error: 'Slug sudah digunakan',
					errors: { slug: ['Slug sudah digunakan'] },
				};
			}
		}

		const product = await productRepository.update(id, validated.data);

		revalidatePath('/dashboard/products');
		revalidatePath(`/dashboard/products/${id}`);
		return { success: true, data: product };
	} catch (error) {
		console.error('Error updating product:', error);
		return { success: false, error: 'Gagal mengupdate produk' };
	}
}

export async function deleteProduct(id: string): Promise<ActionResult> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return { success: false, error: 'Unauthorized' };
		}

		const store = await storeRepository.findByUserId(session.user.id);
		if (!store) {
			return { success: false, error: 'Store not found' };
		}

		const existingProduct = await productRepository.findById(id);
		if (!existingProduct || existingProduct.storeId !== store.id) {
			return { success: false, error: 'Produk tidak ditemukan' };
		}

		await productRepository.delete(id);

		revalidatePath('/dashboard/products');
		return { success: true };
	} catch (error) {
		console.error('Error deleting product:', error);
		return { success: false, error: 'Gagal menghapus produk' };
	}
}

// Variant Actions
export async function createVariant(formData: FormData): Promise<ActionResult<ProductVariant>> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return { success: false, error: 'Unauthorized' };
		}

		const productId = formData.get('productId') as string;
		const product = await productRepository.findById(productId);
		if (!product) {
			return { success: false, error: 'Produk tidak ditemukan' };
		}

		const data = {
			name: formData.get('name') as string,
			sku: formData.get('sku') as string || undefined,
			barcode: formData.get('barcode') as string || undefined,
			price: parseFloat(formData.get('price') as string),
			costPrice: formData.get('costPrice') ? parseFloat(formData.get('costPrice') as string) : undefined,
			stock: formData.get('stock') ? parseInt(formData.get('stock') as string) : 0,
			weight: formData.get('weight') ? parseFloat(formData.get('weight') as string) : undefined,
		};

		const validated = createProductVariantSchema.safeParse(data);
		if (!validated.success) {
			return {
				success: false,
				error: 'Validasi gagal',
				errors: validated.error.flatten().fieldErrors as Record<string, string[]>,
			};
		}

		const variant = await productRepository.createVariant({
			...validated.data,
			productId,
		});

		revalidatePath(`/dashboard/products/${productId}`);
		return { success: true, data: variant };
	} catch (error) {
		console.error('Error creating variant:', error);
		return { success: false, error: 'Gagal membuat varian' };
	}
}

export async function updateVariant(id: string, formData: FormData): Promise<ActionResult<ProductVariant>> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return { success: false, error: 'Unauthorized' };
		}

		const existingVariant = await productRepository.findVariantById(id);
		if (!existingVariant) {
			return { success: false, error: 'Varian tidak ditemukan' };
		}

		const data = {
			name: formData.get('name') as string || undefined,
			sku: formData.get('sku') as string || undefined,
			barcode: formData.get('barcode') as string || undefined,
			price: formData.get('price') ? parseFloat(formData.get('price') as string) : undefined,
			costPrice: formData.get('costPrice') ? parseFloat(formData.get('costPrice') as string) : undefined,
			weight: formData.get('weight') ? parseFloat(formData.get('weight') as string) : undefined,
		};

		const validated = updateProductVariantSchema.safeParse(data);
		if (!validated.success) {
			return {
				success: false,
				error: 'Validasi gagal',
				errors: validated.error.flatten().fieldErrors as Record<string, string[]>,
			};
		}

		const variant = await productRepository.updateVariant(id, validated.data);

		revalidatePath(`/dashboard/products/${existingVariant.productId}`);
		return { success: true, data: variant };
	} catch (error) {
		console.error('Error updating variant:', error);
		return { success: false, error: 'Gagal mengupdate varian' };
	}
}

export async function deleteVariant(id: string): Promise<ActionResult> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return { success: false, error: 'Unauthorized' };
		}

		const existingVariant = await productRepository.findVariantById(id);
		if (!existingVariant) {
			return { success: false, error: 'Varian tidak ditemukan' };
		}

		await productRepository.deleteVariant(id);

		revalidatePath(`/dashboard/products/${existingVariant.productId}`);
		return { success: true };
	} catch (error) {
		console.error('Error deleting variant:', error);
		return { success: false, error: 'Gagal menghapus varian' };
	}
}

// Image Actions
export async function createProductImage(formData: FormData): Promise<ActionResult> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return { success: false, error: 'Unauthorized' };
		}

		const productId = formData.get('productId') as string;
		const url = formData.get('url') as string;
		const alt = formData.get('alt') as string || undefined;

		await productRepository.createImage({
			productId,
			url,
			alt,
		});

		revalidatePath(`/dashboard/products/${productId}`);
		return { success: true };
	} catch (error) {
		console.error('Error creating image:', error);
		return { success: false, error: 'Gagal menambah gambar' };
	}
}

export async function deleteProductImage(id: string, productId: string): Promise<ActionResult> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return { success: false, error: 'Unauthorized' };
		}

		await productRepository.deleteImage(id);

		revalidatePath(`/dashboard/products/${productId}`);
		return { success: true };
	} catch (error) {
		console.error('Error deleting image:', error);
		return { success: false, error: 'Gagal menghapus gambar' };
	}
}
