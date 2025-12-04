import { prisma } from '@/lib/prisma';
import {
	CreateStockMovementInput,
	StockMovement,
	PaginatedResult,
	PaginationParams,
	StockMovementType,
} from '@/types';

export const stockRepository = {
	async findMovementsByVariantId(
		variantId: string,
		params?: PaginationParams
	): Promise<PaginatedResult<StockMovement>> {
		const page = params?.page || 1;
		const pageSize = params?.pageSize || 20;
		const skip = (page - 1) * pageSize;

		const where = { variantId };

		const [data, total] = await Promise.all([
			prisma.stockMovement.findMany({
				where,
				include: {
					variant: true,
				},
				skip,
				take: pageSize,
				orderBy: { createdAt: 'desc' },
			}),
			prisma.stockMovement.count({ where }),
		]);

		return {
			data: data.map((m) => ({
				...m,
				variant: m.variant
					? {
							...m.variant,
							price: Number(m.variant.price),
							costPrice: m.variant.costPrice ? Number(m.variant.costPrice) : null,
							weight: m.variant.weight ? Number(m.variant.weight) : null,
						}
					: undefined,
			})),
			total,
			page,
			pageSize,
			totalPages: Math.ceil(total / pageSize),
		};
	},

	async findMovementsByStoreId(
		storeId: string,
		params?: PaginationParams & { type?: StockMovementType }
	): Promise<PaginatedResult<StockMovement>> {
		const page = params?.page || 1;
		const pageSize = params?.pageSize || 20;
		const skip = (page - 1) * pageSize;

		const where: any = {
			variant: {
				product: { storeId },
			},
		};

		if (params?.type) {
			where.type = params.type;
		}

		const [data, total] = await Promise.all([
			prisma.stockMovement.findMany({
				where,
				include: {
					variant: {
						include: {
							product: {
								select: {
									id: true,
									name: true,
								},
							},
						},
					},
				},
				skip,
				take: pageSize,
				orderBy: { createdAt: 'desc' },
			}),
			prisma.stockMovement.count({ where }),
		]);

		return {
			data: data.map((m) => ({
				...m,
				variant: m.variant
					? {
							...m.variant,
							price: Number(m.variant.price),
							costPrice: m.variant.costPrice ? Number(m.variant.costPrice) : null,
							weight: m.variant.weight ? Number(m.variant.weight) : null,
						}
					: undefined,
			})) as StockMovement[],
			total,
			page,
			pageSize,
			totalPages: Math.ceil(total / pageSize),
		};
	},

	async createMovement(data: CreateStockMovementInput): Promise<StockMovement> {
		// Get current stock
		const variant = await prisma.productVariant.findUnique({
			where: { id: data.variantId },
		});

		if (!variant) {
			throw new Error('Variant not found');
		}

		const previousStock = variant.stock;
		const newStock = previousStock + data.quantity;

		// Create movement and update stock in transaction
		const [movement] = await prisma.$transaction([
			prisma.stockMovement.create({
				data: {
					...data,
					previousStock,
					newStock,
				},
				include: {
					variant: true,
				},
			}),
			prisma.productVariant.update({
				where: { id: data.variantId },
				data: { stock: newStock },
			}),
		]);

		return {
			...movement,
			variant: movement.variant
				? {
						...movement.variant,
						price: Number(movement.variant.price),
						costPrice: movement.variant.costPrice ? Number(movement.variant.costPrice) : null,
						weight: movement.variant.weight ? Number(movement.variant.weight) : null,
					}
				: undefined,
		};
	},

	async adjustStock(
		variantId: string,
		newStock: number,
		notes?: string
	): Promise<StockMovement> {
		const variant = await prisma.productVariant.findUnique({
			where: { id: variantId },
		});

		if (!variant) {
			throw new Error('Variant not found');
		}

		const previousStock = variant.stock;
		const quantity = newStock - previousStock;

		const [movement] = await prisma.$transaction([
			prisma.stockMovement.create({
				data: {
					variantId,
					quantity,
					type: 'ADJUSTMENT',
					previousStock,
					newStock,
					notes,
				},
				include: {
					variant: true,
				},
			}),
			prisma.productVariant.update({
				where: { id: variantId },
				data: { stock: newStock },
			}),
		]);

		return {
			...movement,
			variant: movement.variant
				? {
						...movement.variant,
						price: Number(movement.variant.price),
						costPrice: movement.variant.costPrice ? Number(movement.variant.costPrice) : null,
						weight: movement.variant.weight ? Number(movement.variant.weight) : null,
					}
				: undefined,
		};
	},

	async getLowStockVariants(storeId: string, threshold: number = 5) {
		const variants = await prisma.productVariant.findMany({
			where: {
				product: { storeId },
				stock: { lte: threshold },
			},
			include: {
				product: {
					select: {
						id: true,
						name: true,
						slug: true,
					},
				},
			},
			orderBy: { stock: 'asc' },
		});

		return variants.map((v) => ({
			...v,
			price: Number(v.price),
			costPrice: v.costPrice ? Number(v.costPrice) : null,
			weight: v.weight ? Number(v.weight) : null,
		}));
	},

	async getStockSummary(storeId: string) {
		const variants = await prisma.productVariant.findMany({
			where: {
				product: { storeId },
			},
			select: {
				stock: true,
				price: true,
				costPrice: true,
			},
		});

		const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);
		const totalValue = variants.reduce(
			(sum, v) => sum + v.stock * Number(v.price),
			0
		);
		const totalCost = variants.reduce(
			(sum, v) => sum + v.stock * (v.costPrice ? Number(v.costPrice) : 0),
			0
		);
		const lowStockCount = variants.filter((v) => v.stock <= 5).length;
		const outOfStockCount = variants.filter((v) => v.stock === 0).length;

		return {
			totalStock,
			totalValue,
			totalCost,
			lowStockCount,
			outOfStockCount,
			variantCount: variants.length,
		};
	},
};
