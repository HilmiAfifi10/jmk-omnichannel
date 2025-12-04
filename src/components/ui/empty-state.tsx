'use client';

import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
	icon: LucideIcon;
	title: string;
	description: string;
	action?: {
		label: string;
		onClick: () => void;
	};
}

export function EmptyState({
	icon: Icon,
	title,
	description,
	action,
}: EmptyStateProps) {
	return (
		<div className="flex h-[50vh] flex-col items-center justify-center gap-4">
			<div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
				<Icon className="h-8 w-8 text-muted-foreground" />
			</div>
			<div className="text-center">
				<h3 className="text-lg font-semibold">{title}</h3>
				<p className="text-sm text-muted-foreground">{description}</p>
			</div>
			{action && (
				<Button onClick={action.onClick}>
					{action.label}
				</Button>
			)}
		</div>
	);
}
