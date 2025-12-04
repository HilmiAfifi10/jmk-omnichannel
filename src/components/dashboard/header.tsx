'use client';

import { Bell, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface DashboardHeaderProps {
	title: string;
	description?: string;
	actions?: React.ReactNode;
}

export function DashboardHeader({
	title,
	description,
	actions,
}: DashboardHeaderProps) {
	return (
		<header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 px-6 backdrop-blur supports-backdrop-filter:bg-background/60">
			<div className="flex items-center gap-4">
				<div>
					<h1 className="text-xl font-semibold">{title}</h1>
					{description && (
						<p className="text-sm text-muted-foreground">{description}</p>
					)}
				</div>
			</div>

			<div className="flex items-center gap-4">
				{/* Search */}
				<div className="hidden md:flex">
					<div className="relative">
						<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input
							type="search"
							placeholder="Cari..."
							className="w-64 pl-8"
						/>
					</div>
				</div>

				{/* Notifications */}
				<Button variant="ghost" size="icon" className="relative">
					<Bell className="h-5 w-5" />
					<span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive" />
				</Button>

				{/* Custom actions */}
				{actions}
			</div>
		</header>
	);
}
