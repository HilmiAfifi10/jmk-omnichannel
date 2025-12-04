'use client';

import { useState, useTransition } from 'react';
import { Plus, Search, MoreHorizontal, Pencil, Trash2, FolderTree } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { DataTablePagination } from '@/components/dashboard/data-table-pagination';
import { CategoryFormDialog } from './category-form-dialog';
import { Category, PaginatedResult } from '@/types';
import { deleteCategory, getCategories } from '../actions';

interface CategoriesTableProps {
	initialData: PaginatedResult<Category>;
	allCategories: Category[];
}

export function CategoriesTable({ initialData, allCategories }: CategoriesTableProps) {
	const [data, setData] = useState(initialData);
	const [search, setSearch] = useState('');
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [editingCategory, setEditingCategory] = useState<Category | null>(null);
	const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
	const [, startTransition] = useTransition();

	const fetchData = async () => {
		startTransition(async () => {
			const result = await getCategories({ page, pageSize, search });
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
		if (!deletingCategory) return;

		const result = await deleteCategory(deletingCategory.id);
		if (result.success) {
			toast.success('Kategori berhasil dihapus');
			fetchData();
		} else {
			toast.error(result.error || 'Gagal menghapus kategori');
		}
		setDeletingCategory(null);
	};

	const handleFormSuccess = () => {
		setIsCreateOpen(false);
		setEditingCategory(null);
		fetchData();
	};

	if (data.data.length === 0 && !search) {
		return (
			<>
				<EmptyState
					icon={FolderTree}
					title="Belum ada kategori"
					description="Mulai dengan membuat kategori pertama untuk mengorganisir produk Anda"
					action={{
						label: 'Tambah Kategori',
						onClick: () => setIsCreateOpen(true),
					}}
				/>
				<CategoryFormDialog
					open={isCreateOpen}
					onOpenChange={setIsCreateOpen}
					categories={allCategories}
					onSuccess={handleFormSuccess}
				/>
			</>
		);
	}

	return (
		<>
			<div className="space-y-4">
				{/* Toolbar */}
				<div className="flex items-center justify-between gap-4">
					<div className="relative flex-1 max-w-sm">
						<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Cari kategori..."
							value={search}
							onChange={(e) => handleSearch(e.target.value)}
							className="pl-8"
						/>
					</div>
					<Button onClick={() => setIsCreateOpen(true)}>
						<Plus className="mr-2 h-4 w-4" />
						Tambah Kategori
					</Button>
				</div>

				{/* Table */}
				<div className="rounded-md border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Nama</TableHead>
								<TableHead>Slug</TableHead>
								<TableHead>Parent</TableHead>
								<TableHead className="text-center">Produk</TableHead>
								<TableHead className="text-center">Sub-kategori</TableHead>
								<TableHead className="w-20"></TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{data.data.map((category) => (
								<TableRow key={category.id}>
									<TableCell className="font-medium">{category.name}</TableCell>
									<TableCell>
										<code className="rounded bg-muted px-2 py-1 text-sm">
											{category.slug}
										</code>
									</TableCell>
									<TableCell>
										{category.parent ? (
											<Badge variant="outline">{category.parent.name}</Badge>
										) : (
											<span className="text-muted-foreground">-</span>
										)}
									</TableCell>
									<TableCell className="text-center">
										{category._count?.products || 0}
									</TableCell>
									<TableCell className="text-center">
										{category._count?.children || 0}
									</TableCell>
									<TableCell>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="ghost" size="icon">
													<MoreHorizontal className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuItem onClick={() => setEditingCategory(category)}>
													<Pencil className="mr-2 h-4 w-4" />
													Edit
												</DropdownMenuItem>
												<DropdownMenuItem
													className="text-destructive focus:text-destructive"
													onClick={() => setDeletingCategory(category)}
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

			{/* Create Dialog */}
			<CategoryFormDialog
				open={isCreateOpen}
				onOpenChange={setIsCreateOpen}
				categories={allCategories}
				onSuccess={handleFormSuccess}
			/>

			{/* Edit Dialog */}
			<CategoryFormDialog
				open={!!editingCategory}
				onOpenChange={(open) => !open && setEditingCategory(null)}
				category={editingCategory || undefined}
				categories={allCategories.filter((c) => c.id !== editingCategory?.id)}
				onSuccess={handleFormSuccess}
			/>

			{/* Delete Confirmation */}
			<AlertDialog open={!!deletingCategory} onOpenChange={(open) => !open && setDeletingCategory(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Hapus Kategori</AlertDialogTitle>
						<AlertDialogDescription>
							Apakah Anda yakin ingin menghapus kategori &quot;{deletingCategory?.name}&quot;?
							Tindakan ini tidak dapat dibatalkan.
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
