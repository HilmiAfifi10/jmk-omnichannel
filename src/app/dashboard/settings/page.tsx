import { redirect } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import { DashboardHeader } from '@/components/dashboard/header';
import { getStore } from './actions';
import { StoreForm } from './_components/store-form';
import { EmptyState } from '@/components/ui/empty-state';

export default async function SettingsPage() {
	const result = await getStore();

	if (!result.success) {
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
						description={result.error || 'Gagal memuat data'}
					/>
				</div>
			</div>
		);
	}

	if (!result.data) {
		redirect('/dashboard');
	}

	return (
		<div className="min-h-screen">
			<DashboardHeader
				title="Pengaturan"
				description="Kelola pengaturan toko Anda"
			/>

			<div className="p-6 max-w-3xl">
				<StoreForm store={result.data} />
			</div>
		</div>
	);
}
