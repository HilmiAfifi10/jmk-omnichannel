'use client';

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
	className?: string;
	size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
	sm: 'h-4 w-4',
	md: 'h-6 w-6',
	lg: 'h-8 w-8',
};

export function LoadingSpinner({ className, size = 'md' }: LoadingSpinnerProps) {
	return (
		<Loader2 className={cn('animate-spin', sizeClasses[size], className)} />
	);
}

interface LoadingPageProps {
	message?: string;
}

export function LoadingPage({ message = 'Memuat...' }: LoadingPageProps) {
	return (
		<div className="flex h-[50vh] flex-col items-center justify-center gap-4">
			<LoadingSpinner size="lg" />
			<p className="text-muted-foreground">{message}</p>
		</div>
	);
}
