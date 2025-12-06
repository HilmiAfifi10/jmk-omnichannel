'use client';

import { useState, useTransition } from 'react';
import { Upload, X, Package } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ProductImage } from '@/types';
import { uploadProductImages, createProductImage, deleteProductImage } from '../actions';

interface ImagesManagerProps {
	productId: string;
	images: ProductImage[];
}

export function ImagesManager({ productId, images: initialImages }: ImagesManagerProps) {
	const [images, setImages] = useState(initialImages);
	const [deletingImage, setDeletingImage] = useState<ProductImage | null>(null);
	const [isPending, startTransition] = useTransition();
	const [isUploading, setIsUploading] = useState(false);

	const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files || []);
		if (files.length === 0) return;

		// Validate file types
		const validFiles = files.filter(file => file.type.startsWith('image/'));
		if (validFiles.length !== files.length) {
			toast.error('Beberapa file bukan gambar dan diabaikan');
		}

		if (validFiles.length === 0) return;

		setIsUploading(true);

		try {
			// Upload images
			const uploadResult = await uploadProductImages(validFiles);
			if (!uploadResult.success || !uploadResult.data) {
				toast.error(uploadResult.error || 'Gagal upload gambar');
				return;
			}

			// Save to database
			for (let i = 0; i < uploadResult.data.length; i++) {
				const formData = new FormData();
				formData.append('productId', productId);
				formData.append('url', uploadResult.data[i]);
				formData.append('position', (images.length + i).toString());
				await createProductImage(formData);
			}

			toast.success(`${validFiles.length} gambar berhasil ditambahkan`);
			window.location.reload();
		} catch (error) {
			console.error('Upload error:', error);
			toast.error('Terjadi kesalahan saat upload');
		} finally {
			setIsUploading(false);
			// Reset input
			e.target.value = '';
		}
	};

	const handleDelete = async () => {
		if (!deletingImage) return;

		startTransition(async () => {
			const result = await deleteProductImage(deletingImage.id, productId);
			if (result.success) {
				toast.success('Gambar berhasil dihapus');
				setImages(images.filter((img) => img.id !== deletingImage.id));
			} else {
				toast.error(result.error || 'Gagal menghapus gambar');
			}
			setDeletingImage(null);
		});
	};

	return (
		<>
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0">
					<div>
						<CardTitle>Gambar Produk</CardTitle>
						<CardDescription>Upload dan kelola gambar produk</CardDescription>
					</div>
					<div>
						<Input
							id="upload-images"
							type="file"
							accept="image/*"
							multiple
							onChange={handleImageUpload}
							disabled={isUploading}
							className="hidden"
						/>
						<Label htmlFor="upload-images">
							<Button
								type="button"
								variant="outline"
								disabled={isUploading}
								asChild
							>
								<span className="cursor-pointer">
									<Upload className="mr-2 h-4 w-4" />
									{isUploading ? 'Uploading...' : 'Upload Gambar'}
								</span>
							</Button>
						</Label>
					</div>
				</CardHeader>
				<CardContent>
					{images.length > 0 ? (
						<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
							{images.map((image) => (
								<div
									key={image.id}
									className="relative aspect-square overflow-hidden rounded-lg bg-muted group"
								>
									<Image
										src={image.url}
										alt={image.alt || 'Product image'}
										fill
										className="object-cover"
									/>
									<div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
										<Button
											variant="destructive"
											size="icon"
											onClick={() => setDeletingImage(image)}
											disabled={isPending}
										>
											<X className="h-4 w-4" />
										</Button>
									</div>
								</div>
							))}
						</div>
					) : (
						<div className="flex flex-col items-center justify-center py-12 text-center">
							<Package className="h-16 w-16 text-muted-foreground mb-4" />
							<p className="text-muted-foreground mb-4">
								Belum ada gambar produk
							</p>
							<Label htmlFor="upload-images">
								<Button variant="outline" disabled={isUploading} asChild>
									<span className="cursor-pointer">
										<Upload className="mr-2 h-4 w-4" />
										Upload Gambar Pertama
									</span>
								</Button>
							</Label>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Delete Confirmation */}
			<AlertDialog
				open={!!deletingImage}
				onOpenChange={(open) => !open && setDeletingImage(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Hapus Gambar</AlertDialogTitle>
						<AlertDialogDescription>
							Apakah Anda yakin ingin menghapus gambar ini? Aksi ini tidak dapat
							dibatalkan.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isPending}>Batal</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							disabled={isPending}
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
