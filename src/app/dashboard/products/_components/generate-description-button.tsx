'use client';

import { useState, useTransition } from 'react';
import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { LoadingSpinner } from '@/components/ui/loading';
import { generateProductDescription } from '../_actions/ai.actions';

interface GenerateDescriptionButtonProps {
	productName: string;
	categoryName: string;
	onGenerated: (description: string) => void;
	disabled?: boolean;
}

export function GenerateDescriptionButton({
	productName,
	categoryName,
	onGenerated,
	disabled,
}: GenerateDescriptionButtonProps) {
	const [open, setOpen] = useState(false);
	const [isPending, startTransition] = useTransition();
	const [generatedText, setGeneratedText] = useState<string | null>(null);

	const canGenerate = productName.trim() !== '' && categoryName.trim() !== '';

	const handleGenerate = () => {
		if (!canGenerate) {
			toast.error('Isi nama produk dan pilih kategori terlebih dahulu');
			return;
		}

		const formData = new FormData();
		formData.append('productName', productName);
		formData.append('category', categoryName);

		startTransition(async () => {
			const result = await generateProductDescription(formData);

			if (result.success && result.data) {
				setGeneratedText(result.data);
			} else {
				toast.error(result.error || 'Gagal generate deskripsi');
			}
		});
	};

	const handleUseDescription = () => {
		if (generatedText) {
			onGenerated(generatedText);
			setOpen(false);
			setGeneratedText(null);
			toast.success('Deskripsi berhasil diterapkan');
		}
	};

	const handleOpenChange = (isOpen: boolean) => {
		setOpen(isOpen);
		if (!isOpen) {
			setGeneratedText(null);
		}
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<Button
					type="button"
					variant="outline"
					size="sm"
					disabled={disabled || !canGenerate}
					className="gap-2"
				>
					<Sparkles className="h-4 w-4" />
					Generate dengan AI
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Sparkles className="h-5 w-5 text-primary" />
						Generate Deskripsi Produk
					</DialogTitle>
					<DialogDescription>
						AI akan membuat template deskripsi berdasarkan informasi produk Anda.
						Anda dapat mengedit hasilnya sebelum menggunakannya.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					{/* Product Info Summary */}
					<div className="rounded-lg border bg-muted/50 p-4">
						<h4 className="mb-2 text-sm font-medium">Informasi Produk</h4>
						<div className="grid gap-2 text-sm">
							<div className="flex justify-between">
								<span className="text-muted-foreground">Nama:</span>
								<span className="font-medium">{productName || '-'}</span>
							</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">Kategori:</span>
							<span className="font-medium">{categoryName || '-'}</span>
						</div>
					</div>
					</div>

					{/* Generated Result */}
					{generatedText && (
						<div className="space-y-2">
							<h4 className="text-sm font-medium">Hasil Generate</h4>
							<div className="max-h-64 overflow-y-auto rounded-lg border bg-background p-4">
								<p className="whitespace-pre-wrap text-sm">{generatedText}</p>
							</div>
							<p className="text-xs text-muted-foreground">
								* Placeholder dalam kurung siku [CONTOH] dapat Anda ganti dengan informasi
								sebenarnya
							</p>
						</div>
					)}

					{/* Loading State */}
					{isPending && (
						<div className="flex flex-col items-center justify-center gap-3 py-8">
							<LoadingSpinner size="lg" />
							<p className="text-sm text-muted-foreground">
								Sedang generate deskripsi...
							</p>
						</div>
					)}
				</div>

				<DialogFooter className="gap-2 sm:gap-0">
					{!generatedText ? (
						<Button
							type="button"
							onClick={handleGenerate}
							disabled={isPending || !canGenerate}
						>
							{isPending ? (
								<>
									<LoadingSpinner className="mr-2" size="sm" />
									Generating...
								</>
							) : (
								<>
									<Sparkles className="mr-2 h-4 w-4" />
									Generate Deskripsi
								</>
							)}
						</Button>
					) : (
						<>
							<Button
								type="button"
								variant="outline"
								onClick={handleGenerate}
								disabled={isPending}
							>
								{isPending ? (
									<LoadingSpinner size="sm" />
								) : (
									'Generate Ulang'
								)}
							</Button>
							<Button type="button" onClick={handleUseDescription}>
								Gunakan Deskripsi Ini
							</Button>
						</>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
