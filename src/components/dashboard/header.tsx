'use client';

import { LogOut, Search, Settings } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '../ui/dropdown-menu';

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
	const { data: session } = useSession();

	return (
		<header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 px-6 backdrop-blur supports-backdrop-filter:bg-background/60">
			<div className="flex items-center gap-4">
				{/* Custom actions */}
				{actions}

				<div className="flex items-center gap-4">
					<div>
						<h1 className="text-xl font-semibold">{title}</h1>
						{description && (
							<p className="text-sm text-muted-foreground">{description}</p>
						)}
					</div>
				</div>
			</div>

			<div className="flex items-center gap-4">
				{/* Search */}
				<div className="hidden md:flex">
					<div className="relative">
						<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input type="search" placeholder="Cari..." className="w-64 pl-8" />
					</div>
				</div>

				{/* User Dropdown */}
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="icon">
							<Avatar className="h-8 w-8">
								<AvatarImage src={session?.user?.image || ''} />
								<AvatarFallback>
									{session?.user?.name?.charAt(0).toUpperCase() || 'U'}
								</AvatarFallback>
							</Avatar>
						</Button>
					</DropdownMenuTrigger>

					<DropdownMenuContent align="end" className="w-56">
						<DropdownMenuLabel className="flex gap-2 items-center">
							<Avatar className="h-8 w-8">
								<AvatarImage src={session?.user?.image || ''} />
								<AvatarFallback>
									{session?.user?.name?.charAt(0).toUpperCase() || 'U'}
								</AvatarFallback>
							</Avatar>

							<div className="flex flex-col items-start text-left">
								<span className="text-sm font-medium">
									{session?.user?.name || 'User'}
								</span>

								<span className="text-xs text-muted-foreground">
									{session?.user?.email}
								</span>
							</div>
						</DropdownMenuLabel>

						<DropdownMenuSeparator />

						<DropdownMenuItem asChild>
							<Link href="/dashboard/settings">
								<Settings className="mr-2 h-4 w-4" />
								Pengaturan
							</Link>
						</DropdownMenuItem>

						<DropdownMenuSeparator />

						<DropdownMenuItem
							className="text-destructive focus:text-destructive"
							onClick={() => signOut({ callbackUrl: '/sign-in' })}
						>
							<LogOut className="mr-2 h-4 w-4" />
							Keluar
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</header>
	);
}
