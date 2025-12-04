import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Pencil, Package } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardHeader } from '@/components/dashboard/header';
import { VariantsManager } from '../_components/variants-manager';
import { getProductById } from '../actions';
import { ProductStatus } from '@/types';

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

export default async function ProductDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const result = await getProductById(id);

	if (!result.success || !result.data) {
		notFound();
	}

	const product = result.data;

	return (
		<div className="min-h-screen">
			<DashboardHeader
				title={product.name}
				description={product.sku ? `SKU: ${product.sku}` : undefined}
				actions={
					<div className="flex items-center gap-2">
						<Button variant="ghost" asChild size="icon">
							<Link href="/dashboard/products">
								<ArrowLeft />
							</Link>
						</Button>
						<Button asChild>
							<Link href={`/dashboard/products/${product.id}/edit`}>
								<Pencil className="mr-2 h-4 w-4" />
								Edit
							</Link>
						</Button>
					</div>
				}
			/>

			<div className="space-y-6 p-6">
				{/* Product Info */}
				<div className="grid gap-6 lg:grid-cols-3">
					{/* Images */}
					<Card>
						<CardHeader>
							<CardTitle>Gambar Produk</CardTitle>
						</CardHeader>
						<CardContent>
							{product.images && product.images.length > 0 ? (
								<div className="grid gap-2">
									{product.images.map((image) => (
										<div
											key={image.id}
											className="relative aspect-square overflow-hidden rounded-lg bg-muted"
										>
											<Image
												src={image.url}
												alt={image.alt || product.name}
												fill
												className="object-cover"
											/>
										</div>
									))}
								</div>
							) : (
								<div className="flex aspect-square items-center justify-center rounded-lg bg-muted">
									<Package className="h-16 w-16 text-muted-foreground" />
								</div>
							)}
						</CardContent>
					</Card>

					{/* Details */}
					<Card className="lg:col-span-2">
						<CardHeader>
							<div className="flex items-center justify-between">
								<CardTitle>Detail Produk</CardTitle>
								<Badge variant={statusVariants[product.status]}>
									{statusLabels[product.status]}
								</Badge>
							</div>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid gap-4 sm:grid-cols-2">
								<div>
									<p className="text-sm font-medium text-muted-foreground">Nama Produk</p>
									<p className="text-lg font-semibold">{product.name}</p>
								</div>
								<div>
									<p className="text-sm font-medium text-muted-foreground">Kategori</p>
									<p className="text-lg">
										{product.category ? (
											<Badge variant="outline">{product.category.name}</Badge>
										) : (
											<span className="text-muted-foreground">Tanpa Kategori</span>
										)}
									</p>
								</div>
								<div>
									<p className="text-sm font-medium text-muted-foreground">SKU</p>
									<p>{product.sku || '-'}</p>
								</div>
								<div>
									<p className="text-sm font-medium text-muted-foreground">Barcode</p>
									<p>{product.barcode || '-'}</p>
								</div>
							</div>

							{product.description && (
								<div>
									<p className="text-sm font-medium text-muted-foreground">Deskripsi</p>
									<p className="whitespace-pre-wrap text-sm">{product.description}</p>
								</div>
							)}
						</CardContent>
					</Card>
				</div>

				{/* Variants */}
				<VariantsManager
					productId={product.id}
					variants={product.variants || []}
				/>
			</div>
		</div>
	);
}
