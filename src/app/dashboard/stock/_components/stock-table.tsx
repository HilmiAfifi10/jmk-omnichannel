'use client';

import { useState, useTransition } from 'react';
import {  ArrowUpCircle, ArrowDownCircle, Package } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTablePagination } from '@/components/dashboard/data-table-pagination';
import { StockAdjustmentDialog } from './stock-adjustment-dialog';
import { StockMovement, PaginatedResult, StockMovementType } from '@/types';
import { getStockMovements } from '../actions';

interface StockTableProps {
	initialMovements: PaginatedResult<StockMovement>;
	lowStockVariants: any[];
	summary: {
		totalStock: number;
		totalValue: number;
		totalCost: number;
		lowStockCount: number;
		outOfStockCount: number;
		variantCount: number;
	};
}

const movementTypeLabels: Record<StockMovementType, string> = {
	ADJUSTMENT: 'Penyesuaian',
	SALE: 'Penjualan',
	RETURN: 'Retur',
	RESTOCK: 'Restok',
	TRANSFER: 'Transfer',
};

const movementTypeVariants: Record<StockMovementType, 'default' | 'success' | 'destructive' | 'secondary'> = {
	ADJUSTMENT: 'secondary',
	SALE: 'destructive',
	RETURN: 'success',
	RESTOCK: 'success',
	TRANSFER: 'default',
};

function formatCurrency(value: number): string {
	return new Intl.NumberFormat('id-ID', {
		style: 'currency',
		currency: 'IDR',
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(value);
}

export function StockTable({ initialMovements, lowStockVariants, summary }: StockTableProps) {
	const [movements, setMovements] = useState(initialMovements);
	const [typeFilter, setTypeFilter] = useState<StockMovementType | 'all'>('all');
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(20);
	const [adjustingVariant, setAdjustingVariant] = useState<{
		id: string;
		name: string;
		currentStock: number;
		productName: string;
	} | null>(null);
	const [, startTransition] = useTransition();

	const fetchData = async () => {
		startTransition(async () => {
			const result = await getStockMovements({
				page,
				pageSize,
				type: typeFilter === 'all' ? undefined : typeFilter,
			});
			if (result.success && result.data) {
				setMovements(result.data);
			}
		});
	};

	const handleTypeFilter = (value: string) => {
		setTypeFilter(value as StockMovementType | 'all');
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

	const handleAdjustStock = (variant: any) => {
		setAdjustingVariant({
			id: variant.id,
			name: variant.name,
			currentStock: variant.stock,
			productName: variant.product?.name || 'Unknown',
		});
	};

	return (
		<>
			<div className="space-y-6">
				{/* Summary Cards */}
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					<Card>
						<CardHeader className="pb-2">
							<CardDescription>Total Stok</CardDescription>
							<CardTitle className="text-2xl">{summary.totalStock.toLocaleString()}</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-xs text-muted-foreground">
								{summary.variantCount} varian produk
							</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="pb-2">
							<CardDescription>Nilai Inventory</CardDescription>
							<CardTitle className="text-2xl">{formatCurrency(summary.totalValue)}</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-xs text-muted-foreground">
								Modal: {formatCurrency(summary.totalCost)}
							</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="pb-2">
							<CardDescription>Stok Rendah</CardDescription>
							<CardTitle className="text-2xl text-yellow-500">{summary.lowStockCount}</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-xs text-muted-foreground">
								Varian dengan stok ≤ 5
							</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="pb-2">
							<CardDescription>Habis</CardDescription>
							<CardTitle className="text-2xl text-red-500">{summary.outOfStockCount}</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-xs text-muted-foreground">
								Varian dengan stok 0
							</p>
						</CardContent>
					</Card>
				</div>

				{/* Low Stock Alert */}
				{lowStockVariants.length > 0 && (
					<Card>
						<CardHeader>
							<CardTitle className="text-base">⚠️ Stok Perlu Diperhatikan</CardTitle>
							<CardDescription>
								Varian dengan stok rendah atau habis
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
								{lowStockVariants.slice(0, 6).map((variant) => (
									<div
										key={variant.id}
										className="flex items-center justify-between rounded-lg border p-3 cursor-pointer hover:bg-accent"
										onClick={() => handleAdjustStock(variant)}
									>
										<div className="min-w-0 flex-1">
											<p className="truncate font-medium text-sm">{variant.product?.name}</p>
											<p className="truncate text-xs text-muted-foreground">{variant.name}</p>
										</div>
										<Badge
											variant={variant.stock === 0 ? 'destructive' : 'warning'}
											className="ml-2"
										>
											{variant.stock}
										</Badge>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				)}

				{/* Stock Movements History */}
				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<div>
								<CardTitle>Riwayat Pergerakan Stok</CardTitle>
								<CardDescription>
									Semua aktivitas pergerakan stok produk
								</CardDescription>
							</div>
							<Select value={typeFilter} onValueChange={handleTypeFilter}>
								<SelectTrigger className="w-40">
									<SelectValue placeholder="Semua Tipe" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">Semua Tipe</SelectItem>
									{Object.entries(movementTypeLabels).map(([value, label]) => (
										<SelectItem key={value} value={value}>
											{label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</CardHeader>
					<CardContent>
						{movements.data.length > 0 ? (
							<>
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Waktu</TableHead>
											<TableHead>Produk</TableHead>
											<TableHead>Tipe</TableHead>
											<TableHead className="text-center">Perubahan</TableHead>
											<TableHead className="text-center">Stok Akhir</TableHead>
											<TableHead>Catatan</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{movements.data.map((movement) => (
											<TableRow key={movement.id}>
												<TableCell className="text-sm text-muted-foreground">
													{formatDistanceToNow(new Date(movement.createdAt), {
														addSuffix: true,
														locale: id,
													})}
												</TableCell>
												<TableCell>
													<div>
														<p className="font-medium text-sm">
															{(movement.variant as any)?.product?.name || '-'}
														</p>
														<p className="text-xs text-muted-foreground">
															{movement.variant?.name}
														</p>
													</div>
												</TableCell>
												<TableCell>
													<Badge variant={movementTypeVariants[movement.type]}>
														{movementTypeLabels[movement.type]}
													</Badge>
												</TableCell>
												<TableCell className="text-center">
													<div className="flex items-center justify-center gap-1">
														{movement.quantity > 0 ? (
															<ArrowUpCircle className="h-4 w-4 text-green-500" />
														) : (
															<ArrowDownCircle className="h-4 w-4 text-red-500" />
														)}
														<span className={movement.quantity > 0 ? 'text-green-500' : 'text-red-500'}>
															{movement.quantity > 0 ? '+' : ''}{movement.quantity}
														</span>
													</div>
												</TableCell>
												<TableCell className="text-center font-medium">
													{movement.newStock}
												</TableCell>
												<TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
													{movement.notes || movement.reference || '-'}
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>

								<DataTablePagination
									page={movements.page}
									pageSize={movements.pageSize}
									total={movements.total}
									totalPages={movements.totalPages}
									onPageChange={handlePageChange}
									onPageSizeChange={handlePageSizeChange}
								/>
							</>
						) : (
							<div className="py-8 text-center text-muted-foreground">
								<Package className="mx-auto h-12 w-12 mb-4 opacity-50" />
								<p>Belum ada riwayat pergerakan stok</p>
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Adjustment Dialog */}
			{adjustingVariant && (
				<StockAdjustmentDialog
					open={!!adjustingVariant}
					onOpenChange={(open) => !open && setAdjustingVariant(null)}
					variant={adjustingVariant}
					onSuccess={() => {
						fetchData();
						window.location.reload();
					}}
				/>
			)}
		</>
	);
}
