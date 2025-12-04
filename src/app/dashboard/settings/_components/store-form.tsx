'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Store } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading';
import { Store as StoreType } from '@/types';
import { updateStore } from '../actions';

interface StoreFormProps {
	store: StoreType;
}

export function StoreForm({ store }: StoreFormProps) {
	const [isPending, startTransition] = useTransition();
	const [formData, setFormData] = useState({
		name: store.name || '',
		slug: store.slug || '',
		description: store.description || '',
		logo: store.logo || '',
		currency: store.currency || 'IDR',
		phone: store.phone || '',
		email: store.email || '',
		address: store.address || '',
	});

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const data = new FormData();
		Object.entries(formData).forEach(([key, value]) => {
			data.append(key, value);
		});

		startTransition(async () => {
			const result = await updateStore(data);
			if (result.success) {
				toast.success('Pengaturan toko berhasil disimpan');
			} else {
				toast.error(result.error || 'Gagal menyimpan pengaturan');
			}
		});
	};

	return (
		<form onSubmit={handleSubmit}>
			<div className="space-y-6">
				{/* Basic Info */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Store className="h-5 w-5" />
							Informasi Toko
						</CardTitle>
						<CardDescription>
							Informasi dasar tentang toko Anda
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="name">Nama Toko *</Label>
								<Input
									id="name"
									name="name"
									value={formData.name}
									onChange={handleChange}
									placeholder="Nama toko Anda"
									disabled={isPending}
									required
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="slug">Slug / URL</Label>
								<div className="flex items-center gap-2">
									<span className="text-sm text-muted-foreground">/</span>
									<Input
										id="slug"
										name="slug"
										value={formData.slug}
										onChange={handleChange}
										placeholder="nama-toko"
										disabled={isPending}
									/>
								</div>
								<p className="text-xs text-muted-foreground">
									URL unik untuk katalog digital Anda
								</p>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="description">Deskripsi</Label>
							<Textarea
								id="description"
								name="description"
								value={formData.description}
								onChange={handleChange}
								placeholder="Ceritakan tentang toko Anda..."
								disabled={isPending}
								rows={3}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="logo">URL Logo</Label>
							<Input
								id="logo"
								name="logo"
								type="url"
								value={formData.logo}
								onChange={handleChange}
								placeholder="https://example.com/logo.png"
								disabled={isPending}
							/>
							<p className="text-xs text-muted-foreground">
								URL gambar logo toko (JPG, PNG)
							</p>
						</div>
					</CardContent>
				</Card>

				{/* Contact Info */}
				<Card>
					<CardHeader>
						<CardTitle>Informasi Kontak</CardTitle>
						<CardDescription>
							Informasi kontak yang akan ditampilkan di katalog
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="phone">Nomor Telepon / WhatsApp</Label>
								<Input
									id="phone"
									name="phone"
									type="tel"
									value={formData.phone}
									onChange={handleChange}
									placeholder="628123456789"
									disabled={isPending}
								/>
								<p className="text-xs text-muted-foreground">
									Format: 628xxx (tanpa +)
								</p>
							</div>
							<div className="space-y-2">
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									name="email"
									type="email"
									value={formData.email}
									onChange={handleChange}
									placeholder="toko@example.com"
									disabled={isPending}
								/>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="address">Alamat</Label>
							<Textarea
								id="address"
								name="address"
								value={formData.address}
								onChange={handleChange}
								placeholder="Alamat lengkap toko..."
								disabled={isPending}
								rows={2}
							/>
						</div>
					</CardContent>
				</Card>

				{/* Currency Settings */}
				<Card>
					<CardHeader>
						<CardTitle>Pengaturan Lainnya</CardTitle>
						<CardDescription>
							Konfigurasi tambahan untuk toko Anda
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							<Label htmlFor="currency">Mata Uang</Label>
							<Input
								id="currency"
								name="currency"
								value={formData.currency}
								onChange={handleChange}
								placeholder="IDR"
								disabled={isPending}
								className="max-w-[100px]"
							/>
							<p className="text-xs text-muted-foreground">
								Kode mata uang (IDR, USD, dll)
							</p>
						</div>
					</CardContent>
					<CardFooter className="border-t pt-4">
						<Button type="submit" disabled={isPending}>
							{isPending && <LoadingSpinner className="mr-2" size="sm" />}
							Simpan Perubahan
						</Button>
					</CardFooter>
				</Card>
			</div>
		</form>
	);
}
