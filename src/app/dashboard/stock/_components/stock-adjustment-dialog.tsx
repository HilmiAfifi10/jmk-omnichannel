'use client';

import { useState, useTransition } from 'react';
import { Plus, Minus, RefreshCw } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/ui/loading';
import { StockMovementType } from '@/types';
import { adjustStock, addStockMovement } from '../actions';

interface StockAdjustmentDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	variant: {
		id: string;
		name: string;
		currentStock: number;
		productName: string;
	};
	onSuccess: () => void;
}

const movementTypeLabels: Record<StockMovementType, string> = {
	ADJUSTMENT: 'Penyesuaian',
	SALE: 'Penjualan',
	RETURN: 'Retur',
	RESTOCK: 'Restok',
	TRANSFER: 'Transfer',
};

export function StockAdjustmentDialog({
	open,
	onOpenChange,
	variant,
	onSuccess,
}: StockAdjustmentDialogProps) {
	const [isPending, startTransition] = useTransition();
	const [activeTab, setActiveTab] = useState<'adjust' | 'movement'>('adjust');

	// Adjust tab state
	const [newStock, setNewStock] = useState(variant.currentStock.toString());
	const [adjustNotes, setAdjustNotes] = useState('');

	// Movement tab state
	const [quantity, setQuantity] = useState('');
	const [movementType, setMovementType] = useState<StockMovementType>('RESTOCK');
	const [reference, setReference] = useState('');
	const [movementNotes, setMovementNotes] = useState('');

	// const resetForm = () => {
	// 	setNewStock(variant.currentStock.toString());
	// 	setAdjustNotes('');
	// 	setQuantity('');
	// 	setMovementType('RESTOCK');
	// 	setReference('');
	// 	setMovementNotes('');
	// };

	const handleAdjust = async (e: React.FormEvent) => {
		e.preventDefault();

		const formData = new FormData();
		formData.append('variantId', variant.id);
		formData.append('newStock', newStock);
		formData.append('notes', adjustNotes);

		startTransition(async () => {
			const result = await adjustStock(formData);
			if (result.success) {
				toast.success('Stok berhasil disesuaikan');
				onSuccess();
				onOpenChange(false);
			} else {
				toast.error(result.error || 'Gagal menyesuaikan stok');
			}
		});
	};

	const handleMovement = async (e: React.FormEvent) => {
		e.preventDefault();

		const formData = new FormData();
		formData.append('variantId', variant.id);
		formData.append('quantity', quantity);
		formData.append('type', movementType);
		formData.append('reference', reference);
		formData.append('notes', movementNotes);

		startTransition(async () => {
			const result = await addStockMovement(formData);
			if (result.success) {
				toast.success('Pergerakan stok berhasil ditambahkan');
				onSuccess();
				onOpenChange(false);
			} else {
				toast.error(result.error || 'Gagal menambah pergerakan stok');
			}
		});
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Update Stok</DialogTitle>
					<DialogDescription>
						{variant.productName} - {variant.name}
						<br />
						Stok saat ini: <strong>{variant.currentStock}</strong> unit
					</DialogDescription>
				</DialogHeader>

				<Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'adjust' | 'movement')}>
					<TabsList className="grid w-full grid-cols-2">
						<TabsTrigger value="adjust">
							<RefreshCw className="mr-2 h-4 w-4" />
							Sesuaikan
						</TabsTrigger>
						<TabsTrigger value="movement">
							<Plus className="mr-2 h-4 w-4" />
							Pergerakan
						</TabsTrigger>
					</TabsList>

					<TabsContent value="adjust">
						<form onSubmit={handleAdjust} className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="newStock">Stok Baru</Label>
								<Input
									id="newStock"
									type="number"
									min="0"
									value={newStock}
									onChange={(e) => setNewStock(e.target.value)}
									disabled={isPending}
								/>
								{parseInt(newStock) !== variant.currentStock && (
									<p className="text-sm text-muted-foreground">
										Perubahan: {parseInt(newStock) - variant.currentStock > 0 ? '+' : ''}
										{parseInt(newStock) - variant.currentStock} unit
									</p>
								)}
							</div>

							<div className="space-y-2">
								<Label htmlFor="adjustNotes">Catatan (opsional)</Label>
								<Textarea
									id="adjustNotes"
									value={adjustNotes}
									onChange={(e) => setAdjustNotes(e.target.value)}
									placeholder="Alasan penyesuaian stok..."
									disabled={isPending}
									rows={3}
								/>
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
									Simpan
								</Button>
							</DialogFooter>
						</form>
					</TabsContent>

					<TabsContent value="movement">
						<form onSubmit={handleMovement} className="space-y-4">
							<div className="grid gap-4 sm:grid-cols-2">
								<div className="space-y-2">
									<Label htmlFor="movementType">Tipe</Label>
									<Select
										value={movementType}
										onValueChange={(v) => setMovementType(v as StockMovementType)}
										disabled={isPending}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{Object.entries(movementTypeLabels).map(([value, label]) => (
												<SelectItem key={value} value={value}>
													{label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								<div className="space-y-2">
									<Label htmlFor="quantity">Jumlah</Label>
									<div className="flex items-center gap-2">
										<Button
											type="button"
											variant="outline"
											size="icon"
											onClick={() => setQuantity((prev) => {
												const val = parseInt(prev) || 0;
												return Math.abs(val) > 0 ? (-Math.abs(val)).toString() : prev;
											})}
										>
											<Minus className="h-4 w-4" />
										</Button>
										<Input
											id="quantity"
											type="number"
											value={quantity}
											onChange={(e) => setQuantity(e.target.value)}
											placeholder="0"
											disabled={isPending}
											className="text-center"
										/>
										<Button
											type="button"
											variant="outline"
											size="icon"
											onClick={() => setQuantity((prev) => {
												const val = parseInt(prev) || 0;
												return Math.abs(val).toString();
											})}
										>
											<Plus className="h-4 w-4" />
										</Button>
									</div>
									<p className="text-xs text-muted-foreground">
										Positif untuk masuk, negatif untuk keluar
									</p>
								</div>
							</div>

							<div className="space-y-2">
								<Label htmlFor="reference">Referensi (opsional)</Label>
								<Input
									id="reference"
									value={reference}
									onChange={(e) => setReference(e.target.value)}
									placeholder="No. Order, No. Resi, dll"
									disabled={isPending}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="movementNotes">Catatan (opsional)</Label>
								<Textarea
									id="movementNotes"
									value={movementNotes}
									onChange={(e) => setMovementNotes(e.target.value)}
									placeholder="Catatan tambahan..."
									disabled={isPending}
									rows={2}
								/>
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
									Tambah
								</Button>
							</DialogFooter>
						</form>
					</TabsContent>
				</Tabs>
			</DialogContent>
		</Dialog>
	);
}
