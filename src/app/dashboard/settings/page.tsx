import { redirect } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import { DashboardHeader } from '@/components/dashboard/header';
import { getStore, getTikTokIntegration } from './actions';
import { StoreForm } from './_components/store-form';
import { EmptyState } from '@/components/ui/empty-state';
import { TikTokConnectCard } from './_components/tiktok-connect-card';

export default async function SettingsPage() {
	const [storeResult, integrationResult] = await Promise.all([
		getStore(),
		getTikTokIntegration(),
	]);

	if (!storeResult.success) {
		return (
			<div className="min-h-screen">
				<DashboardHeader
					title="Pengaturan"
					description="Kelola pengaturan toko Anda"
				/>
				<div className="p-6">
					<EmptyState
						icon={AlertCircle}
						title="Terjadi Kesalahan"
						description={storeResult.error || 'Gagal memuat data'}
					/>
				</div>
			</div>
		);
	}

	if (!storeResult.data) {
		redirect('/dashboard');
	}

	return (
		<div className="min-h-screen">
			<DashboardHeader
				title="Pengaturan"
				description="Kelola pengaturan toko Anda"
			/>

			<div className="p-6 flex flex-col gap-6 max-w-4xl">
				<StoreForm store={storeResult.data} />
				<TikTokConnectCard
					integration={integrationResult?.success && integrationResult.data ? integrationResult.data : null}
				/>
			</div>
		</div>
	);
}
