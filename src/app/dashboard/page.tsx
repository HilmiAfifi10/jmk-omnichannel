import { Package, FolderTree, AlertTriangle, DollarSign } from 'lucide-react';

import { DashboardHeader } from '@/components/dashboard/header';
import { StatsCard } from '@/components/dashboard/stats-card';
import { getDashboardStats, getLowStockProducts, getOrCreateStore } from './actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

function formatCurrency(value: number): string {
	return new Intl.NumberFormat('id-ID', {
		style: 'currency',
		currency: 'IDR',
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(value);
}

export default async function DashboardPage() {
	const [storeResult, statsResult, lowStockResult] = await Promise.all([
		getOrCreateStore(),
		getDashboardStats(),
		getLowStockProducts(),
	]);

	const stats = statsResult.success ? statsResult.data : null;
	const lowStockProducts = lowStockResult.success ? lowStockResult.data : [];

	return (
		<div className="min-h-screen">
			<DashboardHeader
				title="Dashboard"
				description={`Selamat datang di ${storeResult.data?.name || 'EasyCatalog'}`}
			/>

			<div className="space-y-6 p-6">
				{/* Stats Cards */}
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					<StatsCard
						title="Total Produk"
						value={stats?.totalProducts || 0}
						description={`${stats?.activeProducts || 0} aktif, ${stats?.draftProducts || 0} draft`}
						icon={Package}
					/>
					<StatsCard
						title="Kategori"
						value={stats?.totalCategories || 0}
						description="Kategori produk"
						icon={FolderTree}
					/>
					<StatsCard
						title="Total Stok"
						value={stats?.totalStock || 0}
						description={`${stats?.lowStockItems || 0} item stok rendah`}
						icon={AlertTriangle}
					/>
					<StatsCard
						title="Nilai Inventory"
						value={formatCurrency(stats?.totalValue || 0)}
						description="Total nilai stok"
						icon={DollarSign}
					/>
				</div>

				{/* Low Stock Alert */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<AlertTriangle className="h-5 w-5 text-yellow-500" />
							Peringatan Stok Rendah
						</CardTitle>
						<CardDescription>
							Produk dengan stok kurang dari 5 unit
						</CardDescription>
					</CardHeader>
					<CardContent>
						{lowStockProducts && lowStockProducts.length > 0 ? (
							<div className="space-y-3">
								{lowStockProducts.slice(0, 5).map((variant: any) => (
									<div
										key={variant.id}
										className="flex items-center justify-between rounded-lg border p-3"
									>
										<div>
											<p className="font-medium">{variant.product?.name}</p>
											<p className="text-sm text-muted-foreground">
												{variant.name}
											</p>
										</div>
										<Badge
											variant={variant.stock === 0 ? 'destructive' : 'warning'}
										>
											Stok: {variant.stock}
										</Badge>
									</div>
								))}
							</div>
						) : (
							<p className="text-center text-muted-foreground py-4">
								Tidak ada produk dengan stok rendah
							</p>
						)}
					</CardContent>
				</Card>

				{/* Quick Actions */}
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					<Card className="cursor-pointer transition-colors hover:bg-accent">
						<CardHeader>
							<CardTitle className="text-base">Tambah Produk Baru</CardTitle>
							<CardDescription>
								Tambahkan produk baru ke katalog Anda
							</CardDescription>
						</CardHeader>
					</Card>
					<Card className="cursor-pointer transition-colors hover:bg-accent">
						<CardHeader>
							<CardTitle className="text-base">Kelola Kategori</CardTitle>
							<CardDescription>
								Atur kategori untuk organisasi produk
							</CardDescription>
						</CardHeader>
					</Card>
					<Card className="cursor-pointer transition-colors hover:bg-accent">
						<CardHeader>
							<CardTitle className="text-base">Update Stok</CardTitle>
							<CardDescription>
								Perbarui stok produk Anda
							</CardDescription>
						</CardHeader>
					</Card>
				</div>
			</div>
		</div>
	);
}
