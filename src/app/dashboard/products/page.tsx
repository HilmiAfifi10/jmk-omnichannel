import { DashboardHeader } from '@/components/dashboard/header';
import { getProducts } from './actions';
import { getAllCategories } from '../categories/actions';
import { ProductsTable } from './_components/products-table';

export default async function ProductsPage() {
	const [productsResult, categoriesResult] = await Promise.all([
		getProducts({ page: 1, pageSize: 10 }),
		getAllCategories(),
	]);

	const products = productsResult.success ? productsResult.data : {
		data: [],
		total: 0,
		page: 1,
		pageSize: 10,
		totalPages: 0,
	};

	const categories = categoriesResult.success ? categoriesResult.data : [];

	return (
		<div className="min-h-screen">
			<DashboardHeader
				title="Katalog Produk"
				description="Kelola produk dan varian dalam katalog Anda"
			/>

			<div className="p-6">
				<ProductsTable
					initialData={products!}
					categories={categories!}
				/>
			</div>
		</div>
	);
}
