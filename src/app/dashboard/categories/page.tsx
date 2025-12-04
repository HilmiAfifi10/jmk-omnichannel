import { DashboardHeader } from '@/components/dashboard/header';
import { getCategories, getAllCategories } from './actions';
import { CategoriesTable } from './_components/categories-table';

export default async function CategoriesPage() {
	const [categoriesResult, allCategoriesResult] = await Promise.all([
		getCategories({ page: 1, pageSize: 10 }),
		getAllCategories(),
	]);

	const categories = categoriesResult.success ? categoriesResult.data : {
		data: [],
		total: 0,
		page: 1,
		pageSize: 10,
		totalPages: 0,
	};

	const allCategories = allCategoriesResult.success ? allCategoriesResult.data : [];

	return (
		<div className="min-h-screen">
			<DashboardHeader
				title="Manajemen Kategori"
				description="Kelola kategori produk untuk mengorganisir katalog Anda"
			/>

			<div className="p-6">
				<CategoriesTable
					initialData={categories!}
					allCategories={allCategories!}
				/>
			</div>
		</div>
	);
}
