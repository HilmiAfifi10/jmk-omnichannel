import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Package, Layers, BarChart3, Globe, ArrowRight } from 'lucide-react';

import { auth } from '@/lib/auth';
import { Button } from '@/components/ui/button';

export default async function Home() {
	const session = await auth();

	// Redirect to dashboard if already logged in
	if (session?.user) {
		redirect('/dashboard');
	}

	return (
		<div className="min-h-screen bg-linear-to-b from-background to-muted">
			{/* Header */}
			<header className="container mx-auto px-4 py-6">
				<nav className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Package className="h-8 w-8 text-primary" />
						<span className="text-xl font-bold">EasyCatalog</span>
					</div>
					<div className="flex items-center gap-4">
						<Button variant="ghost" asChild>
							<Link href="/sign-in">Masuk</Link>
						</Button>
						<Button asChild>
							<Link href="/sign-up">Daftar Gratis</Link>
						</Button>
					</div>
				</nav>
			</header>

			{/* Hero Section */}
			<main className="container mx-auto px-4 py-16 md:py-24">
				<div className="mx-auto max-w-3xl text-center">
					<h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
						Kelola Katalog Produk{' '}
						<span className="text-primary">Lebih Mudah</span>
					</h1>
					<p className="mt-6 text-lg text-muted-foreground md:text-xl">
						Platform SaaS untuk UMKM yang ingin mengelola katalog produk secara digital 
						dan menyinkronkan ke berbagai platform seperti WhatsApp, Instagram, TikTok, dan Website.
					</p>
					<div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
						<Button size="lg" asChild>
							<Link href="/sign-up">
								Mulai Sekarang
								<ArrowRight className="ml-2 h-4 w-4" />
							</Link>
						</Button>
						<Button size="lg" variant="outline" asChild>
							<Link href="/sign-in">Sudah Punya Akun</Link>
						</Button>
					</div>
				</div>

				{/* Features */}
				<div className="mt-24 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
					<FeatureCard
						icon={<Package className="h-10 w-10" />}
						title="Upload Produk"
						description="Upload dan kelola produk dengan mudah, lengkap dengan varian dan gambar"
					/>
					<FeatureCard
						icon={<Layers className="h-10 w-10" />}
						title="Katalog Digital"
						description="Tampilkan produk dalam katalog digital yang menarik untuk pelanggan"
					/>
					<FeatureCard
						icon={<BarChart3 className="h-10 w-10" />}
						title="Manajemen Stok"
						description="Pantau stok secara real-time dan dapatkan notifikasi stok rendah"
					/>
					<FeatureCard
						icon={<Globe className="h-10 w-10" />}
						title="OmniChannel Sync"
						description="Sinkronkan produk ke WhatsApp, Instagram, TikTok, dan Website"
					/>
				</div>
			</main>

			{/* Footer */}
			<footer className="border-t bg-background">
				<div className="container mx-auto px-4 py-8">
					<div className="flex flex-col items-center justify-between gap-4 md:flex-row">
						<div className="flex items-center gap-2">
							<Package className="h-5 w-5 text-primary" />
							<span className="font-semibold">EasyCatalog</span>
						</div>
						<p className="text-sm text-muted-foreground">
							© 2024 EasyCatalog. Hackathon Project - OmniChannel Sync
						</p>
					</div>
				</div>
			</footer>
		</div>
	);
}

function FeatureCard({
	icon,
	title,
	description,
}: {
	icon: React.ReactNode;
	title: string;
	description: string;
}) {
	return (
		<div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm transition-shadow hover:shadow-md">
			<div className="mb-4 text-primary">{icon}</div>
			<h3 className="mb-2 font-semibold">{title}</h3>
			<p className="text-sm text-muted-foreground">{description}</p>
		</div>
	);
}
