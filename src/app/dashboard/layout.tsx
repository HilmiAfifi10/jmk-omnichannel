import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth';
import { DashboardSidebar } from '@/components/dashboard/sidebar';

export default async function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await auth();

	if (!session) {
		redirect('/sign-in');
	}

	return (
		<div className="min-h-screen bg-background">
			<DashboardSidebar />
			<main className="md:pl-64">
				{children}
			</main>
		</div>
	);
}
