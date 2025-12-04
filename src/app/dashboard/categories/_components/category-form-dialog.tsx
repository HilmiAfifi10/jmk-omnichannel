'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { LoadingSpinner } from '@/components/ui/loading';
import { Category } from '@/types';
import { createCategory, updateCategory } from '../actions';
import { generateSlug } from '@/lib/utils/slug';

interface CategoryFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	category?: Category;
	categories: Category[];
	onSuccess: () => void;
}

function CategoryFormContent({
	category,
	categories,
	onSuccess,
	onOpenChange,
}: Omit<CategoryFormDialogProps, 'open'>) {
	const [isPending, startTransition] = useTransition();
	const [errors, setErrors] = useState<Record<string, string[]>>({});
	const [name, setName] = useState(category?.name || '');
	const [slug, setSlug] = useState(category?.slug || '');
	const [description, setDescription] = useState(category?.description || '');
	const [parentId, setParentId] = useState<string>(category?.parentId || '');

	const isEditing = !!category;

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
		if (parentId && parentId !== 'none') {
			formData.append('parentId', parentId);
		}

		startTransition(async () => {
			const result = isEditing
				? await updateCategory(category.id, formData)
				: await createCategory(formData);

			if (result.success) {
				toast.success(isEditing ? 'Kategori berhasil diupdate' : 'Kategori berhasil dibuat');
				onSuccess();
			} else {
				if (result.errors) {
					setErrors(result.errors);
				}
				toast.error(result.error || 'Terjadi kesalahan');
			}
		});
	};

	return (
		<>
			<DialogHeader>
				<DialogTitle>
					{isEditing ? 'Edit Kategori' : 'Tambah Kategori Baru'}
				</DialogTitle>
				<DialogDescription>
					{isEditing
						? 'Perbarui informasi kategori'
						: 'Buat kategori baru untuk mengorganisir produk Anda'}
				</DialogDescription>
			</DialogHeader>

			<form onSubmit={handleSubmit} className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor="name">Nama Kategori</Label>
					<Input
						id="name"
						value={name}
						onChange={(e) => handleNameChange(e.target.value)}
						placeholder="Contoh: Elektronik"
						disabled={isPending}
					/>
					{errors.name && (
						<p className="text-sm text-destructive">{errors.name[0]}</p>
					)}
				</div>

				<div className="space-y-2">
					<Label htmlFor="slug">Slug</Label>
					<Input
						id="slug"
						value={slug}
						onChange={(e) => setSlug(e.target.value)}
						placeholder="contoh: elektronik"
						disabled={isPending}
					/>
					<p className="text-xs text-muted-foreground">
						Slug digunakan untuk URL. Hanya huruf kecil, angka, dan strip.
					</p>
					{errors.slug && (
						<p className="text-sm text-destructive">{errors.slug[0]}</p>
					)}
				</div>

				<div className="space-y-2">
					<Label htmlFor="description">Deskripsi</Label>
					<Textarea
						id="description"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						placeholder="Deskripsi kategori (opsional)"
						disabled={isPending}
						rows={3}
					/>
					{errors.description && (
						<p className="text-sm text-destructive">{errors.description[0]}</p>
					)}
				</div>

				<div className="space-y-2">
					<Label htmlFor="parentId">Parent Kategori</Label>
					<Select
						value={parentId || 'none'}
						onValueChange={(value) => setParentId(value === 'none' ? '' : value)}
						disabled={isPending}
					>
						<SelectTrigger>
							<SelectValue placeholder="Pilih parent kategori (opsional)" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="none">Tidak ada (Root kategori)</SelectItem>
							{categories.map((cat) => (
								<SelectItem key={cat.id} value={cat.id}>
									{cat.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<p className="text-xs text-muted-foreground">
						Pilih parent jika ini adalah sub-kategori
					</p>
				</div>

				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={isPending}
					>
						Batal
					</Button>
					<Button type="submit" disabled={isPending}>
						{isPending && <LoadingSpinner className="mr-2" size="sm" />}
						{isEditing ? 'Simpan Perubahan' : 'Buat Kategori'}
					</Button>
				</DialogFooter>
			</form>
		</>
	);
}

export function CategoryFormDialog({
	open,
	onOpenChange,
	category,
	categories,
	onSuccess,
}: CategoryFormDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[500px]">
				{open && (
					<CategoryFormContent
						category={category}
						categories={categories}
						onSuccess={onSuccess}
						onOpenChange={onOpenChange}
					/>
				)}
			</DialogContent>
		</Dialog>
	);
}
