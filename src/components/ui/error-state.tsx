'use client';

import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
	title?: string;
	message?: string;
	onRetry?: () => void;
}

export function ErrorState({
	title = 'Terjadi Kesalahan',
	message = 'Maaf, terjadi kesalahan saat memuat data. Silakan coba lagi.',
	onRetry,
}: ErrorStateProps) {
	return (
		<div className="flex h-[50vh] flex-col items-center justify-center gap-4">
			<div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
				<AlertCircle className="h-8 w-8 text-destructive" />
			</div>
			<div className="text-center">
				<h3 className="text-lg font-semibold">{title}</h3>
				<p className="text-sm text-muted-foreground">{message}</p>
			</div>
			{onRetry && (
				<Button onClick={onRetry} variant="outline">
					<RefreshCw className="mr-2 h-4 w-4" />
					Coba Lagi
				</Button>
			)}
		</div>
	);
}
