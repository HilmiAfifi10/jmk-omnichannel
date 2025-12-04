import { prisma } from '@/lib/prisma';
import {
	CreateProductInput,
	UpdateProductInput,
	CreateProductVariantInput,
	UpdateProductVariantInput,
	CreateProductImageInput,
	Product,
	ProductVariant,
	ProductImage,
	PaginatedResult,
	PaginationParams,
	ProductStatus,
} from '@/types';

// Helper to serialize Prisma Decimal to number
function serializeVariant(variant: any): ProductVariant {
	return {
		...variant,
		price: Number(variant.price),
		costPrice: variant.costPrice ? Number(variant.costPrice) : null,
		weight: variant.weight ? Number(variant.weight) : null,
	};
}

function serializeProduct(product: any): Product {
	return {
		...product,
		variants: product.variants?.map(serializeVariant) || [],
	};
}

export const productRepository = {
	async findById(id: string): Promise<Product | null> {
		const product = await prisma.product.findUnique({
			where: { id },
			include: {
				category: true,
				images: {
					orderBy: { position: 'asc' },
				},
				variants: {
					orderBy: { createdAt: 'asc' },
				},
			},
		});
		return product ? serializeProduct(product) : null;
	},

	async findBySlug(slug: string, storeId: string): Promise<Product | null> {
		const product = await prisma.product.findUnique({
			where: { slug_storeId: { slug, storeId } },
			include: {
				category: true,
				images: {
					orderBy: { position: 'asc' },
				},
				variants: {
					orderBy: { createdAt: 'asc' },
				},
			},
		});
		return product ? serializeProduct(product) : null;
	},

	async findByStoreId(
		storeId: string,
		params?: PaginationParams & { status?: ProductStatus; categoryId?: string }
	): Promise<PaginatedResult<Product>> {
		const page = params?.page || 1;
		const pageSize = params?.pageSize || 10;
		const skip = (page - 1) * pageSize;

		const where: any = { storeId };

		if (params?.status) {
			where.status = params.status;
		}

		if (params?.categoryId) {
			where.categoryId = params.categoryId;
		}

		if (params?.search) {
			where.OR = [
				{ name: { contains: params.search, mode: 'insensitive' } },
				{ description: { contains: params.search, mode: 'insensitive' } },
				{ sku: { contains: params.search, mode: 'insensitive' } },
			];
		}

		const [data, total] = await Promise.all([
			prisma.product.findMany({
				where,
				include: {
					category: true,
					images: {
						orderBy: { position: 'asc' },
						take: 1,
					},
					variants: {
						orderBy: { createdAt: 'asc' },
					},
				},
				skip,
				take: pageSize,
				orderBy: {
					[params?.sortBy || 'createdAt']: params?.sortOrder || 'desc',
				},
			}),
			prisma.product.count({ where }),
		]);

		return {
			data: data.map(serializeProduct),
			total,
			page,
			pageSize,
			totalPages: Math.ceil(total / pageSize),
		};
	},

	async create(data: CreateProductInput): Promise<Product> {
		const product = await prisma.product.create({
			data,
			include: {
				category: true,
				images: true,
				variants: true,
			},
		});
		return serializeProduct(product);
	},

	async update(id: string, data: UpdateProductInput): Promise<Product> {
		const product = await prisma.product.update({
			where: { id },
			data,
			include: {
				category: true,
				images: {
					orderBy: { position: 'asc' },
				},
				variants: {
					orderBy: { createdAt: 'asc' },
				},
			},
		});
		return serializeProduct(product);
	},

	async delete(id: string): Promise<void> {
		await prisma.product.delete({
			where: { id },
		});
	},

	async checkSlugExists(slug: string, storeId: string, excludeId?: string): Promise<boolean> {
		const product = await prisma.product.findFirst({
			where: {
				slug,
				storeId,
				...(excludeId && { NOT: { id: excludeId } }),
			},
		});
		return !!product;
	},

	// Variant methods
	async createVariant(data: CreateProductVariantInput): Promise<ProductVariant> {
		const variant = await prisma.productVariant.create({
			data: {
				...data,
				price: data.price,
				costPrice: data.costPrice,
				weight: data.weight,
			},
		});
		return {
			...variant,
			price: Number(variant.price),
			costPrice: variant.costPrice ? Number(variant.costPrice) : null,
			weight: variant.weight ? Number(variant.weight) : null,
		};
	},

	async updateVariant(id: string, data: UpdateProductVariantInput): Promise<ProductVariant> {
		const variant = await prisma.productVariant.update({
			where: { id },
			data: {
				...data,
				price: data.price,
				costPrice: data.costPrice,
				weight: data.weight,
			},
		});
		return {
			...variant,
			price: Number(variant.price),
			costPrice: variant.costPrice ? Number(variant.costPrice) : null,
			weight: variant.weight ? Number(variant.weight) : null,
		};
	},

	async deleteVariant(id: string): Promise<void> {
		await prisma.productVariant.delete({
			where: { id },
		});
	},

	async findVariantById(id: string): Promise<ProductVariant | null> {
		const variant = await prisma.productVariant.findUnique({
			where: { id },
		});
		if (!variant) return null;
		return {
			...variant,
			price: Number(variant.price),
			costPrice: variant.costPrice ? Number(variant.costPrice) : null,
			weight: variant.weight ? Number(variant.weight) : null,
		};
	},

	// Image methods
	async createImage(data: CreateProductImageInput): Promise<ProductImage> {
		return prisma.productImage.create({
			data,
		});
	},

	async deleteImage(id: string): Promise<void> {
		await prisma.productImage.delete({
			where: { id },
		});
	},

	async reorderImages(productId: string, imageIds: string[]): Promise<void> {
		await Promise.all(
			imageIds.map((id, index) =>
				prisma.productImage.update({
					where: { id },
					data: { position: index },
				})
			)
		);
	},

	// Stats
	async getProductStats(storeId: string): Promise<{
		total: number;
		active: number;
		draft: number;
		archived: number;
		lowStock: number;
	}> {
		const [total, active, draft, archived, lowStockVariants] = await Promise.all([
			prisma.product.count({ where: { storeId } }),
			prisma.product.count({ where: { storeId, status: 'ACTIVE' } }),
			prisma.product.count({ where: { storeId, status: 'DRAFT' } }),
			prisma.product.count({ where: { storeId, status: 'ARCHIVED' } }),
			prisma.productVariant.count({
				where: {
					product: { storeId },
					stock: { lte: 5 },
				},
			}),
		]);

		return { total, active, draft, archived, lowStock: lowStockVariants };
	},
};
