import { prisma } from '@/lib/prisma';
import {
	CreateCategoryInput,
	UpdateCategoryInput,
	Category,
	PaginatedResult,
	PaginationParams,
} from '@/types';

export const categoryRepository = {
	async findById(id: string): Promise<Category | null> {
		return prisma.category.findUnique({
			where: { id },
			include: {
				parent: true,
				children: true,
				_count: {
					select: {
						products: true,
						children: true,
					},
				},
			},
		}) as Promise<Category | null>;
	},

	async findBySlug(slug: string, storeId: string): Promise<Category | null> {
		return prisma.category.findUnique({
			where: { slug_storeId: { slug, storeId } },
			include: {
				parent: true,
				children: true,
				_count: {
					select: {
						products: true,
						children: true,
					},
				},
			},
		}) as Promise<Category | null>;
	},

	async findByStoreId(
		storeId: string,
		params?: PaginationParams
	): Promise<PaginatedResult<Category>> {
		const page = params?.page || 1;
		const pageSize = params?.pageSize || 10;
		const skip = (page - 1) * pageSize;

		const where: any = { storeId };

		if (params?.search) {
			where.OR = [
				{ name: { contains: params.search, mode: 'insensitive' } },
				{ description: { contains: params.search, mode: 'insensitive' } },
			];
		}

		const [data, total] = await Promise.all([
			prisma.category.findMany({
				where,
				include: {
					parent: true,
					_count: {
						select: {
							products: true,
							children: true,
						},
					},
				},
				skip,
				take: pageSize,
				orderBy: {
					[params?.sortBy || 'createdAt']: params?.sortOrder || 'desc',
				},
			}),
			prisma.category.count({ where }),
		]);

		return {
			data: data as Category[],
			total,
			page,
			pageSize,
			totalPages: Math.ceil(total / pageSize),
		};
	},

	async findAllByStoreId(storeId: string): Promise<Category[]> {
		return prisma.category.findMany({
			where: { storeId },
			include: {
				parent: true,
				children: true,
				_count: {
					select: {
						products: true,
						children: true,
					},
				},
			},
			orderBy: { name: 'asc' },
		}) as Promise<Category[]>;
	},

	async findRootCategories(storeId: string): Promise<Category[]> {
		return prisma.category.findMany({
			where: { storeId, parentId: null },
			include: {
				children: true,
				_count: {
					select: {
						products: true,
						children: true,
					},
				},
			},
			orderBy: { name: 'asc' },
		}) as Promise<Category[]>;
	},

	async create(data: CreateCategoryInput): Promise<Category> {
		return prisma.category.create({
			data,
			include: {
				parent: true,
				children: true,
				_count: {
					select: {
						products: true,
						children: true,
					},
				},
			},
		}) as Promise<Category>;
	},

	async update(id: string, data: UpdateCategoryInput): Promise<Category> {
		return prisma.category.update({
			where: { id },
			data,
			include: {
				parent: true,
				children: true,
				_count: {
					select: {
						products: true,
						children: true,
					},
				},
			},
		}) as Promise<Category>;
	},

	async delete(id: string): Promise<void> {
		await prisma.category.delete({
			where: { id },
		});
	},

	async checkSlugExists(slug: string, storeId: string, excludeId?: string): Promise<boolean> {
		const category = await prisma.category.findFirst({
			where: {
				slug,
				storeId,
				...(excludeId && { NOT: { id: excludeId } }),
			},
		});
		return !!category;
	},
};
