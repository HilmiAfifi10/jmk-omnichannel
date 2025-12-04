import { DashboardHeader } from '@/components/dashboard/header';
import { getStockMovements, getStockSummary, getLowStockVariants } from './actions';
import { StockTable } from './_components/stock-table';

export default async function StockPage() {
	const [movementsResult, summaryResult, lowStockResult] = await Promise.all([
		getStockMovements({ page: 1, pageSize: 20 }),
		getStockSummary(),
		getLowStockVariants(),
	]);

	const movements = movementsResult.success ? movementsResult.data : {
		data: [],
		total: 0,
		page: 1,
		pageSize: 20,
		totalPages: 0,
	};

	const summary = summaryResult.success ? summaryResult.data : {
		totalStock: 0,
		totalValue: 0,
		totalCost: 0,
		lowStockCount: 0,
		outOfStockCount: 0,
		variantCount: 0,
	};

	const lowStockVariants = lowStockResult.success ? lowStockResult.data : [];

	return (
		<div className="min-h-screen">
			<DashboardHeader
				title="Manajemen Stok"
				description="Pantau dan kelola stok produk Anda"
			/>

			<div className="p-6">
				<StockTable
					initialMovements={movements!}
					lowStockVariants={lowStockVariants!}
					summary={summary!}
				/>
			</div>
		</div>
	);
}
