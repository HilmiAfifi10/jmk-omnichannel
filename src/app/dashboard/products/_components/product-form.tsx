'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading';
import { Category, Product, ProductStatus } from '@/types';
import { createProduct, updateProduct } from '../actions';
import { generateSlug } from '@/lib/utils/slug';

interface ProductFormProps {
	product?: Product;
	categories: Category[];
}

export function ProductForm({ product, categories }: ProductFormProps) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [errors, setErrors] = useState<Record<string, string[]>>({});

	const [name, setName] = useState(product?.name || '');
	const [slug, setSlug] = useState(product?.slug || '');
	const [description, setDescription] = useState(product?.description || '');
	const [sku, setSku] = useState(product?.sku || '');
	const [barcode, setBarcode] = useState(product?.barcode || '');
	const [categoryId, setCategoryId] = useState(product?.categoryId || '');
	const [status, setStatus] = useState<ProductStatus>(product?.status || 'DRAFT');

	const isEditing = !!product;

	const handleNameChange = (value: string) => {
		setName(value);
		if (!isEditing || !slug) {
			setSlug(generateSlug(value));
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrors({});

		const formData = new FormData();
		formData.append('name', name);
		formData.append('slug', slug);
		formData.append('description', description);
		formData.append('sku', sku);
		formData.append('barcode', barcode);
		if (categoryId && categoryId !== 'none') {
			formData.append('categoryId', categoryId);
		}
		formData.append('status', status);

		startTransition(async () => {
			const result = isEditing
				? await updateProduct(product.id, formData)
				: await createProduct(formData);

			if (result.success) {
				toast.success(isEditing ? 'Produk berhasil diupdate' : 'Produk berhasil dibuat');
				if (!isEditing && result.data) {
					router.push(`/dashboard/products/${result.data.id}`);
				}
			} else {
				if (result.errors) {
					setErrors(result.errors);
				}
				toast.error(result.error || 'Terjadi kesalahan');
			}
		});
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Informasi Produk</CardTitle>
					<CardDescription>
						Informasi dasar tentang produk Anda
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="name">Nama Produk *</Label>
							<Input
								id="name"
								value={name}
								onChange={(e) => handleNameChange(e.target.value)}
								placeholder="Contoh: iPhone 15 Pro Max"
								disabled={isPending}
							/>
							{errors.name && (
								<p className="text-sm text-destructive">{errors.name[0]}</p>
							)}
						</div>

						<div className="space-y-2">
							<Label htmlFor="slug">Slug *</Label>
							<Input
								id="slug"
								value={slug}
								onChange={(e) => setSlug(e.target.value)}
								placeholder="iphone-15-pro-max"
								disabled={isPending}
							/>
							{errors.slug && (
								<p className="text-sm text-destructive">{errors.slug[0]}</p>
							)}
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="description">Deskripsi</Label>
						<Textarea
							id="description"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="Deskripsi produk yang detail..."
							disabled={isPending}
							rows={4}
						/>
						{errors.description && (
							<p className="text-sm text-destructive">{errors.description[0]}</p>
						)}
					</div>

					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="sku">SKU</Label>
							<Input
								id="sku"
								value={sku}
								onChange={(e) => setSku(e.target.value)}
								placeholder="Contoh: IP15PM-256-BLK"
								disabled={isPending}
							/>
							{errors.sku && (
								<p className="text-sm text-destructive">{errors.sku[0]}</p>
							)}
						</div>

						<div className="space-y-2">
							<Label htmlFor="barcode">Barcode</Label>
							<Input
								id="barcode"
								value={barcode}
								onChange={(e) => setBarcode(e.target.value)}
								placeholder="Contoh: 1234567890123"
								disabled={isPending}
							/>
							{errors.barcode && (
								<p className="text-sm text-destructive">{errors.barcode[0]}</p>
							)}
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Organisasi</CardTitle>
					<CardDescription>
						Kategori dan status produk
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="categoryId">Kategori</Label>
							<Select
								value={categoryId || 'none'}
								onValueChange={(value) => setCategoryId(value === 'none' ? '' : value)}
								disabled={isPending}
							>
								<SelectTrigger>
									<SelectValue placeholder="Pilih kategori" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="none">Tanpa Kategori</SelectItem>
									{categories.map((cat) => (
										<SelectItem key={cat.id} value={cat.id}>
											{cat.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label htmlFor="status">Status</Label>
							<Select
								value={status}
								onValueChange={(value) => setStatus(value as ProductStatus)}
								disabled={isPending}
							>
								<SelectTrigger>
									<SelectValue placeholder="Pilih status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="DRAFT">Draft</SelectItem>
									<SelectItem value="ACTIVE">Aktif</SelectItem>
									<SelectItem value="ARCHIVED">Arsip</SelectItem>
								</SelectContent>
							</Select>
							<p className="text-xs text-muted-foreground">
								Hanya produk dengan status &quot;Aktif&quot; yang tampil di katalog
							</p>
						</div>
					</div>
				</CardContent>
			</Card>

			<div className="flex justify-end gap-4">
				<Button
					type="button"
					variant="outline"
					onClick={() => router.back()}
					disabled={isPending}
				>
					Batal
				</Button>
				<Button type="submit" disabled={isPending}>
					{isPending && <LoadingSpinner className="mr-2" size="sm" />}
					{isEditing ? 'Simpan Perubahan' : 'Buat Produk'}
				</Button>
			</div>
		</form>
	);
}
