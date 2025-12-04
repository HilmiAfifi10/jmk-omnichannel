'use client';

import { useState, useTransition } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
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
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading';
import { ProductVariant } from '@/types';
import { createVariant, updateVariant, deleteVariant } from '../actions';

interface VariantsManagerProps {
	productId: string;
	variants: ProductVariant[];
}

function formatCurrency(value: number): string {
	return new Intl.NumberFormat('id-ID', {
		style: 'currency',
		currency: 'IDR',
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(value);
}

export function VariantsManager({ productId, variants: initialVariants }: VariantsManagerProps) {
	const [variants, setVariants] = useState(initialVariants);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);
	const [deletingVariant, setDeletingVariant] = useState<ProductVariant | null>(null);
	const [isPending, startTransition] = useTransition();
	const [errors, setErrors] = useState<Record<string, string[]>>({});

	// Form state
	const [name, setName] = useState('');
	const [sku, setSku] = useState('');
	const [barcode, setBarcode] = useState('');
	const [price, setPrice] = useState('');
	const [costPrice, setCostPrice] = useState('');
	const [stock, setStock] = useState('');
	const [weight, setWeight] = useState('');

	const resetForm = () => {
		setName('');
		setSku('');
		setBarcode('');
		setPrice('');
		setCostPrice('');
		setStock('');
		setWeight('');
		setErrors({});
	};

	const openCreateDialog = () => {
		resetForm();
		setEditingVariant(null);
		setIsDialogOpen(true);
	};

	const openEditDialog = (variant: ProductVariant) => {
		setEditingVariant(variant);
		setName(variant.name);
		setSku(variant.sku || '');
		setBarcode(variant.barcode || '');
		setPrice(variant.price.toString());
		setCostPrice(variant.costPrice?.toString() || '');
		setStock(variant.stock.toString());
		setWeight(variant.weight?.toString() || '');
		setErrors({});
		setIsDialogOpen(true);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrors({});

		const formData = new FormData();
		formData.append('productId', productId);
		formData.append('name', name);
		formData.append('sku', sku);
		formData.append('barcode', barcode);
		formData.append('price', price);
		formData.append('costPrice', costPrice);
		formData.append('stock', stock);
		formData.append('weight', weight);

		startTransition(async () => {
			const result = editingVariant
				? await updateVariant(editingVariant.id, formData)
				: await createVariant(formData);

			if (result.success) {
				toast.success(editingVariant ? 'Varian berhasil diupdate' : 'Varian berhasil dibuat');
				setIsDialogOpen(false);
				// Refresh page to get updated data
				window.location.reload();
			} else {
				if (result.errors) {
					setErrors(result.errors);
				}
				toast.error(result.error || 'Terjadi kesalahan');
			}
		});
	};

	const handleDelete = async () => {
		if (!deletingVariant) return;

		const result = await deleteVariant(deletingVariant.id);
		if (result.success) {
			toast.success('Varian berhasil dihapus');
			setVariants(variants.filter((v) => v.id !== deletingVariant.id));
		} else {
			toast.error(result.error || 'Gagal menghapus varian');
		}
		setDeletingVariant(null);
	};

	return (
		<>
			<Card>
				<CardHeader className="flex flex-row items-center justify-between">
					<div>
						<CardTitle>Varian Produk</CardTitle>
						<CardDescription>
							Kelola varian produk dengan harga dan stok yang berbeda
						</CardDescription>
					</div>
					<Button onClick={openCreateDialog}>
						<Plus className="mr-2 h-4 w-4" />
						Tambah Varian
					</Button>
				</CardHeader>
				<CardContent>
					{variants.length > 0 ? (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Nama Varian</TableHead>
									<TableHead>SKU</TableHead>
									<TableHead className="text-right">Harga</TableHead>
									<TableHead className="text-right">Modal</TableHead>
									<TableHead className="text-center">Stok</TableHead>
									<TableHead className="w-[100px]"></TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{variants.map((variant) => (
									<TableRow key={variant.id}>
										<TableCell className="font-medium">{variant.name}</TableCell>
										<TableCell>
											{variant.sku ? (
												<code className="rounded bg-muted px-2 py-1 text-sm">
													{variant.sku}
												</code>
											) : (
												<span className="text-muted-foreground">-</span>
											)}
										</TableCell>
										<TableCell className="text-right">
											{formatCurrency(variant.price)}
										</TableCell>
										<TableCell className="text-right">
											{variant.costPrice ? formatCurrency(variant.costPrice) : '-'}
										</TableCell>
										<TableCell className="text-center">
											<Badge variant={variant.stock <= 5 ? 'warning' : 'secondary'}>
												{variant.stock}
											</Badge>
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-1">
												<Button
													variant="ghost"
													size="icon"
													onClick={() => openEditDialog(variant)}
												>
													<Pencil className="h-4 w-4" />
												</Button>
												<Button
													variant="ghost"
													size="icon"
													onClick={() => setDeletingVariant(variant)}
												>
													<Trash2 className="h-4 w-4 text-destructive" />
												</Button>
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					) : (
						<div className="py-8 text-center text-muted-foreground">
							Belum ada varian. Tambahkan varian untuk mengatur harga dan stok.
						</div>
					)}
				</CardContent>
			</Card>

			{/* Create/Edit Dialog */}
			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent className="sm:max-w-[500px]">
					<DialogHeader>
						<DialogTitle>
							{editingVariant ? 'Edit Varian' : 'Tambah Varian Baru'}
						</DialogTitle>
						<DialogDescription>
							{editingVariant
								? 'Perbarui informasi varian produk'
								: 'Tambah varian baru dengan harga dan stok'}
						</DialogDescription>
					</DialogHeader>

					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="variantName">Nama Varian *</Label>
							<Input
								id="variantName"
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="Contoh: Merah - L"
								disabled={isPending}
							/>
							{errors.name && (
								<p className="text-sm text-destructive">{errors.name[0]}</p>
							)}
						</div>

						<div className="grid gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="variantSku">SKU</Label>
								<Input
									id="variantSku"
									value={sku}
									onChange={(e) => setSku(e.target.value)}
									placeholder="SKU varian"
									disabled={isPending}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="variantBarcode">Barcode</Label>
								<Input
									id="variantBarcode"
									value={barcode}
									onChange={(e) => setBarcode(e.target.value)}
									placeholder="Barcode varian"
									disabled={isPending}
								/>
							</div>
						</div>

						<div className="grid gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="variantPrice">Harga Jual *</Label>
								<Input
									id="variantPrice"
									type="number"
									value={price}
									onChange={(e) => setPrice(e.target.value)}
									placeholder="0"
									disabled={isPending}
								/>
								{errors.price && (
									<p className="text-sm text-destructive">{errors.price[0]}</p>
								)}
							</div>
							<div className="space-y-2">
								<Label htmlFor="variantCostPrice">Harga Modal</Label>
								<Input
									id="variantCostPrice"
									type="number"
									value={costPrice}
									onChange={(e) => setCostPrice(e.target.value)}
									placeholder="0"
									disabled={isPending}
								/>
							</div>
						</div>

						<div className="grid gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="variantStock">Stok Awal</Label>
								<Input
									id="variantStock"
									type="number"
									value={stock}
									onChange={(e) => setStock(e.target.value)}
									placeholder="0"
									disabled={isPending || !!editingVariant}
								/>
								{editingVariant && (
									<p className="text-xs text-muted-foreground">
										Gunakan menu Stok untuk mengubah stok
									</p>
								)}
							</div>
							<div className="space-y-2">
								<Label htmlFor="variantWeight">Berat (gram)</Label>
								<Input
									id="variantWeight"
									type="number"
									value={weight}
									onChange={(e) => setWeight(e.target.value)}
									placeholder="0"
									disabled={isPending}
								/>
							</div>
						</div>

						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => setIsDialogOpen(false)}
								disabled={isPending}
							>
								Batal
							</Button>
							<Button type="submit" disabled={isPending}>
								{isPending && <LoadingSpinner className="mr-2" size="sm" />}
								{editingVariant ? 'Simpan' : 'Tambah'}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{/* Delete Confirmation */}
			<AlertDialog open={!!deletingVariant} onOpenChange={(open) => !open && setDeletingVariant(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Hapus Varian</AlertDialogTitle>
						<AlertDialogDescription>
							Apakah Anda yakin ingin menghapus varian &quot;{deletingVariant?.name}&quot;?
							Riwayat stok varian ini juga akan dihapus.
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
