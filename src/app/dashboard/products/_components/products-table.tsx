'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Package, Eye } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { DataTablePagination } from '@/components/dashboard/data-table-pagination';
import { Product, Category, PaginatedResult, ProductStatus } from '@/types';
import { deleteProduct, getProducts } from '../actions';

interface ProductsTableProps {
	initialData: PaginatedResult<Product>;
	categories: Category[];
}

const statusLabels: Record<ProductStatus, string> = {
	DRAFT: 'Draft',
	ACTIVE: 'Aktif',
	ARCHIVED: 'Arsip',
};

const statusVariants: Record<ProductStatus, 'default' | 'success' | 'secondary'> = {
	DRAFT: 'secondary',
	ACTIVE: 'success',
	ARCHIVED: 'default',
};

function formatCurrency(value: number): string {
	return new Intl.NumberFormat('id-ID', {
		style: 'currency',
		currency: 'IDR',
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(value);
}

export function ProductsTable({ initialData, categories }: ProductsTableProps) {
	const [data, setData] = useState(initialData);
	const [search, setSearch] = useState('');
	const [statusFilter, setStatusFilter] = useState<ProductStatus | 'all'>('all');
	const [categoryFilter, setCategoryFilter] = useState<string>('all');
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
	const [, startTransition] = useTransition();

	const fetchData = async () => {
		startTransition(async () => {
			const result = await getProducts({
				page,
				pageSize,
				search,
				status: statusFilter === 'all' ? undefined : statusFilter,
				categoryId: categoryFilter === 'all' ? undefined : categoryFilter,
			});
			if (result.success && result.data) {
				setData(result.data);
			}
		});
	};

	const handleSearch = (value: string) => {
		setSearch(value);
		setPage(1);
		setTimeout(fetchData, 300);
	};

	const handleStatusFilter = (value: string) => {
		setStatusFilter(value as ProductStatus | 'all');
		setPage(1);
		setTimeout(fetchData, 100);
	};

	const handleCategoryFilter = (value: string) => {
		setCategoryFilter(value);
		setPage(1);
		setTimeout(fetchData, 100);
	};

	const handlePageChange = (newPage: number) => {
		setPage(newPage);
		fetchData();
	};

	const handlePageSizeChange = (newPageSize: number) => {
		setPageSize(newPageSize);
		setPage(1);
		fetchData();
	};

	const handleDelete = async () => {
		if (!deletingProduct) return;

		const result = await deleteProduct(deletingProduct.id);
		if (result.success) {
			toast.success('Produk berhasil dihapus');
			fetchData();
		} else {
			toast.error(result.error || 'Gagal menghapus produk');
		}
		setDeletingProduct(null);
	};

	const getMinPrice = (product: Product) => {
		if (!product.variants || product.variants.length === 0) return 0;
		return Math.min(...product.variants.map((v) => v.price));
	};

	const getTotalStock = (product: Product) => {
		if (!product.variants || product.variants.length === 0) return 0;
		return product.variants.reduce((sum, v) => sum + v.stock, 0);
	};

	if (data.data.length === 0 && !search && statusFilter === 'all' && categoryFilter === 'all') {
		return (
			<EmptyState
				icon={Package}
				title="Belum ada produk"
				description="Mulai dengan menambahkan produk pertama ke katalog Anda"
				action={{
					label: 'Tambah Produk',
					onClick: () => window.location.href = '/dashboard/products/new',
				}}
			/>
		);
	}

	return (
		<>
			<div className="space-y-4">
				{/* Toolbar */}
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex flex-1 items-center gap-4">
						<div className="relative flex-1 max-w-sm">
							<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Cari produk..."
								value={search}
								onChange={(e) => handleSearch(e.target.value)}
								className="pl-8"
							/>
						</div>
						<Select value={statusFilter} onValueChange={handleStatusFilter}>
							<SelectTrigger className="w-32">
								<SelectValue placeholder="Status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Semua Status</SelectItem>
								<SelectItem value="DRAFT">Draft</SelectItem>
								<SelectItem value="ACTIVE">Aktif</SelectItem>
								<SelectItem value="ARCHIVED">Arsip</SelectItem>
							</SelectContent>
						</Select>
						<Select value={categoryFilter} onValueChange={handleCategoryFilter}>
							<SelectTrigger className="w-40">
								<SelectValue placeholder="Kategori" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Semua Kategori</SelectItem>
								{categories.map((cat) => (
									<SelectItem key={cat.id} value={cat.id}>
										{cat.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<Button asChild>
						<Link href="/dashboard/products/new">
							<Plus className="mr-2 h-4 w-4" />
							Tambah Produk
						</Link>
					</Button>
				</div>

				{/* Table */}
				<div className="rounded-md border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="w-20">Gambar</TableHead>
								<TableHead>Nama Produk</TableHead>
								<TableHead>Kategori</TableHead>
								<TableHead>Status</TableHead>
								<TableHead className="text-right">Harga</TableHead>
								<TableHead className="text-center">Stok</TableHead>
								<TableHead className="w-20"></TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{data.data.map((product) => (
								<TableRow key={product.id}>
									<TableCell>
										{product.images && product.images[0] ? (
											<div className="relative h-12 w-12 overflow-hidden rounded-md bg-muted">
												<Image
													src={product.images[0].url}
													alt={product.name}
													fill
													className="object-cover"
												/>
											</div>
										) : (
											<div className="flex h-12 w-12 items-center justify-center rounded-md bg-muted">
												<Package className="h-5 w-5 text-muted-foreground" />
											</div>
										)}
									</TableCell>
									<TableCell>
										<div>
											<p className="font-medium">{product.name}</p>
											{product.sku && (
												<p className="text-sm text-muted-foreground">
													SKU: {product.sku}
												</p>
											)}
										</div>
									</TableCell>
									<TableCell>
										{product.category ? (
											<Badge variant="outline">{product.category.name}</Badge>
										) : (
											<span className="text-muted-foreground">-</span>
										)}
									</TableCell>
									<TableCell>
										<Badge variant={statusVariants[product.status]}>
											{statusLabels[product.status]}
										</Badge>
									</TableCell>
									<TableCell className="text-right">
										{formatCurrency(getMinPrice(product))}
									</TableCell>
									<TableCell className="text-center">
										<Badge
											variant={getTotalStock(product) <= 5 ? 'warning' : 'secondary'}
										>
											{getTotalStock(product)}
										</Badge>
									</TableCell>
									<TableCell>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="ghost" size="icon">
													<MoreHorizontal className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuItem asChild>
													<Link href={`/dashboard/products/${product.id}`}>
														<Eye className="mr-2 h-4 w-4" />
														Lihat Detail
													</Link>
												</DropdownMenuItem>
												<DropdownMenuItem asChild>
													<Link href={`/dashboard/products/${product.id}/edit`}>
														<Pencil className="mr-2 h-4 w-4" />
														Edit
													</Link>
												</DropdownMenuItem>
												<DropdownMenuItem
													className="text-destructive focus:text-destructive"
													onClick={() => setDeletingProduct(product)}
												>
													<Trash2 className="mr-2 h-4 w-4" />
													Hapus
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>

				{/* Pagination */}
				<DataTablePagination
					page={data.page}
					pageSize={data.pageSize}
					total={data.total}
					totalPages={data.totalPages}
					onPageChange={handlePageChange}
					onPageSizeChange={handlePageSizeChange}
				/>
			</div>

			{/* Delete Confirmation */}
			<AlertDialog open={!!deletingProduct} onOpenChange={(open) => !open && setDeletingProduct(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Hapus Produk</AlertDialogTitle>
						<AlertDialogDescription>
							Apakah Anda yakin ingin menghapus produk &quot;{deletingProduct?.name}&quot;?
							Semua varian dan gambar produk juga akan dihapus. Tindakan ini tidak dapat dibatalkan.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Batal</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							Hapus
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
