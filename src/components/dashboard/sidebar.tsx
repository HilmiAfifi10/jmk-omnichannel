'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
	LayoutDashboard,
	Package,
	FolderTree,
	BarChart3,
	Settings,
	LogOut,
	Menu,
	X,
	Store,
} from 'lucide-react';
import { useState } from 'react';
import { signOut, useSession } from 'next-auth/react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const navigation = [
	{
		name: 'Dashboard',
		href: '/dashboard',
		icon: LayoutDashboard,
	},
	{
		name: 'Produk',
		href: '/dashboard/products',
		icon: Package,
	},
	{
		name: 'Kategori',
		href: '/dashboard/categories',
		icon: FolderTree,
	},
	{
		name: 'Stok',
		href: '/dashboard/stock',
		icon: BarChart3,
	},
	{
		name: 'Pengaturan',
		href: '/dashboard/settings',
		icon: Settings,
	},
];

export function DashboardSidebar() {
	const pathname = usePathname();
	const { data: session } = useSession();
	const [isOpen, setIsOpen] = useState(false);

	return (
		<>
			{/* Mobile menu button */}
			<Button
				variant="ghost"
				size="icon"
				className="fixed left-4 top-4 z-50 md:hidden"
				onClick={() => setIsOpen(!isOpen)}
			>
				{isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
			</Button>

			{/* Overlay */}
			{isOpen && (
				<div
					className="fixed inset-0 z-40 bg-black/50 md:hidden"
					onClick={() => setIsOpen(false)}
				/>
			)}

			{/* Sidebar */}
			<aside
				className={cn(
					'fixed left-0 top-0 z-40 h-screen w-64 transform border-r bg-card transition-transform duration-200 ease-in-out md:translate-x-0',
					isOpen ? 'translate-x-0' : '-translate-x-full'
				)}
			>
				<div className="flex h-full flex-col">
					{/* Logo */}
					<div className="flex h-16 items-center gap-2 border-b px-6">
						<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
							<Store className="h-4 w-4 text-primary-foreground" />
						</div>
						<span className="text-lg font-bold">EasyCatalog</span>
					</div>

					{/* Navigation */}
					<ScrollArea className="flex-1 px-3 py-4">
						<nav className="space-y-1">
							{navigation.map((item) => {
								const isActive =
									item.href === '/dashboard'
										? pathname === '/dashboard'
										: pathname === item.href || pathname.startsWith(item.href + '/');
								return (
									<Link
										key={item.name}
										href={item.href}
										onClick={() => setIsOpen(false)}
										className={cn(
											'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
											isActive
												? 'bg-primary text-primary-foreground'
												: 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
										)}
									>
										<item.icon className="h-4 w-4" />
										{item.name}
									</Link>
								);
							})}
						</nav>
					</ScrollArea>

					{/* User menu */}
					<div className="border-t p-4">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" className="w-full justify-start gap-2">
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
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-56">
								<DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
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
				</div>
			</aside>
		</>
	);
}
