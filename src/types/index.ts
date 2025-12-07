// ==================== COMMON TYPES ====================

export type ActionResult<T = void> = {
	success: boolean;
	data?: T;
	error?: string;
	errors?: Record<string, string[]>;
};

export type PaginatedResult<T> = {
	data: T[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
};

export type SortOrder = 'asc' | 'desc';

export interface PaginationParams {
	page?: number;
	pageSize?: number;
	sortBy?: string;
	sortOrder?: SortOrder;
	search?: string;
}

// ==================== STORE TYPES ====================

export interface Store {
	id: string;
	name: string;
	slug?: string | null;
	description?: string | null;
	logo?: string | null;
	currency: string;
	phone?: string | null;
	email?: string | null;
	address?: string | null;
	userId: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface CreateStoreInput {
	name: string;
	slug?: string;
	description?: string;
	logo?: string;
	currency?: string;
	phone?: string;
	email?: string;
	address?: string;
	userId: string;
}

export interface UpdateStoreInput {
	name?: string;
	slug?: string;
	description?: string;
	logo?: string;
	currency?: string;
	phone?: string;
	email?: string;
	address?: string;
}

// ==================== CATEGORY TYPES ====================

export interface Category {
	id: string;
	name: string;
	slug: string;
	description?: string | null;
	image?: string | null;
	parentId?: string | null;
	storeId: string;
	parent?: Category | null;
	children?: Category[];
	_count?: {
		products: number;
		children: number;
	};
	createdAt: Date;
	updatedAt: Date;
}

export interface CreateCategoryInput {
	name: string;
	slug: string;
	description?: string;
	image?: string;
	parentId?: string;
	storeId: string;
}

export interface UpdateCategoryInput {
	name?: string;
	slug?: string;
	description?: string;
	image?: string;
	parentId?: string | null;
}

// ==================== PRODUCT TYPES ====================

export type ProductStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';

export interface ProductImage {
	id: string;
	url: string;
	alt?: string | null;
	position: number;
	productId: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface ProductVariant {
	id: string;
	name: string;
	sku?: string | null;
	gtin?: string | null;
	barcodeImage?: string | null;
	price: number;
	costPrice?: number | null;
	stock: number;
	weight?: number | null;
	tiktokId?: string | null;
	productId: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface Product {
	id: string;
	name: string;
	slug: string;
	description?: string | null;
	storeId: string;
	categoryId?: string | null;
	status: ProductStatus;
	 tiktokId?: string | null;
	category?: Category | null;
	images?: ProductImage[];
	variants?: ProductVariant[];
	createdAt: Date;
	updatedAt: Date;
}

export interface CreateProductInput {
	name: string;
	slug: string;
	description?: string;
	storeId: string;
	categoryId?: string;
	status?: ProductStatus;
}

export interface UpdateProductInput {
	name?: string;
	slug?: string;
	description?: string;
	categoryId?: string | null;
	status?: ProductStatus;
}

export interface CreateProductVariantInput {
	name: string;
	sku?: string;
	gtin?: string;
	barcodeImage?: string;
	price: number;
	costPrice?: number;
	stock?: number;
	weight?: number;
	productId: string;
}

export interface UpdateProductVariantInput {
	name?: string;
	sku?: string;
	gtin?: string;
	barcodeImage?: string;
	price?: number;
	costPrice?: number;
	stock?: number;
	weight?: number;
}

// ==================== TIKTOK TYPES ====================

export interface TikTokIntegration {
	 id: string;
	 storeId: string;
	 shopId: string;
	 accessToken: string;
	 refreshToken: string;
	 accessTokenExpiry: Date;
	 scopes?: string | null;
	 createdAt: Date;
	 updatedAt: Date;
}

export interface CreateProductImageInput {
	url: string;
	alt?: string;
	position?: number;
	productId: string;
}

// ==================== STOCK TYPES ====================

export type StockMovementType = 'ADJUSTMENT' | 'SALE' | 'RETURN' | 'RESTOCK' | 'TRANSFER';

export interface StockMovement {
	id: string;
	variantId: string;
	quantity: number;
	type: StockMovementType;
	reference?: string | null;
	notes?: string | null;
	previousStock: number;
	newStock: number;
	variant?: ProductVariant;
	createdAt: Date;
}

export interface CreateStockMovementInput {
	variantId: string;
	quantity: number;
	type: StockMovementType;
	reference?: string;
	notes?: string;
}

export interface StockAdjustmentInput {
	variantId: string;
	newStock: number;
	notes?: string;
}
