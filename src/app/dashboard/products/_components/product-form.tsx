'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Image from 'next/image';
import { X, Upload } from 'lucide-react';

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
	const [categoryId, setCategoryId] = useState(product?.categoryId || '');
	const [status, setStatus] = useState<ProductStatus>(product?.status || 'DRAFT');
	const [imageFiles, setImageFiles] = useState<File[]>([]);
	const [imagePreviews, setImagePreviews] = useState<string[]>([]);

	const isEditing = !!product;

	const handleNameChange = (value: string) => {
		setName(value);
		if (!isEditing || !slug) {
			setSlug(generateSlug(value));
		}
	};

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files || []);
		if (files.length === 0) return;

		// Validate file types
		const validFiles = files.filter(file => file.type.startsWith('image/'));
		if (validFiles.length !== files.length) {
			toast.error('Beberapa file bukan gambar dan diabaikan');
		}

		// Add to existing files
		setImageFiles(prev => [...prev, ...validFiles]);

		// Create previews
		validFiles.forEach(file => {
			const reader = new FileReader();
			reader.onloadend = () => {
				setImagePreviews(prev => [...prev, reader.result as string]);
			};
			reader.readAsDataURL(file);
		});
	};

	const removeImage = (index: number) => {
		setImageFiles(prev => prev.filter((_, i) => i !== index));
		setImagePreviews(prev => prev.filter((_, i) => i !== index));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrors({});

		const formData = new FormData();
		formData.append('name', name);
		formData.append('slug', slug);
		formData.append('description', description);
		if (categoryId && categoryId !== 'none') {
			formData.append('categoryId', categoryId);
		}
		formData.append('status', status);

		startTransition(async () => {
			// Upload images first if any
			let imageUrls: string[] = [];
			if (imageFiles.length > 0) {
				const { uploadProductImages } = await import('../actions');
				const uploadResult = await uploadProductImages(imageFiles);
				if (!uploadResult.success) {
					toast.error(uploadResult.error || 'Gagal upload gambar');
					return;
				}
				imageUrls = uploadResult.data || [];
			}

			const result = isEditing
				? await updateProduct(product.id, formData)
				: await createProduct(formData);

			if (result.success) {
				// Save images to product if any
				if (imageUrls.length > 0 && result.data) {
					const { createProductImage } = await import('../actions');
					for (let i = 0; i < imageUrls.length; i++) {
						const imageFormData = new FormData();
						imageFormData.append('productId', result.data.id);
						imageFormData.append('url', imageUrls[i]);
						imageFormData.append('position', i.toString());
						await createProductImage(imageFormData);
					}
				}

				toast.success(isEditing ? 'Produk berhasil diupdate' : 'Produk berhasil dibuat');
				if (!isEditing && result.data) {
					router.push(`/dashboard/products/${result.data.id}`);
				} else if (isEditing) {
					router.push(`/dashboard/products/${product.id}`);
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

					<div className="space-y-2">
						<Label htmlFor="images">Gambar Produk</Label>
						
						{/* Image Previews */}
						{imagePreviews.length > 0 && (
							<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
								{imagePreviews.map((preview, index) => (
									<div key={index} className="relative aspect-square rounded-lg border overflow-hidden group">
										<Image
											src={preview}
											alt={`Preview ${index + 1}`}
											fill
											className="object-cover"
										/>
										<Button
											type="button"
											variant="destructive"
											size="icon"
											className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
											onClick={() => removeImage(index)}
											disabled={isPending}
										>
											<X className="h-4 w-4" />
										</Button>
									</div>
								))}
							</div>
						)}

						{/* Upload Input */}
						<div className="flex items-center gap-2">
							<Input
								id="images"
								type="file"
								accept="image/*"
								multiple
								onChange={handleImageChange}
								disabled={isPending}
								className="hidden"
							/>
							<Label
								htmlFor="images"
								className="flex items-center gap-2 px-4 py-2 border rounded-md cursor-pointer hover:bg-accent transition-colors"
							>
								<Upload className="h-4 w-4" />
								<span>Upload Gambar</span>
							</Label>
							<p className="text-sm text-muted-foreground">
								{imageFiles.length > 0 ? `${imageFiles.length} gambar dipilih` : 'Pilih beberapa gambar'}
							</p>
						</div>
						<p className="text-xs text-muted-foreground">
							Upload gambar produk (mendukung multiple upload)
						</p>
					</div>
			</CardContent>
		</Card>			<Card>
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
