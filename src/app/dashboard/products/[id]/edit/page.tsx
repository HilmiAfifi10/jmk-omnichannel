import { notFound } from 'next/navigation';

import { DashboardHeader } from '@/components/dashboard/header';
import { getAllCategories } from '../../../categories/actions';
import { ProductForm } from '../../_components/product-form';
import { getProductById } from '../../actions';

export default async function EditProductPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;

	const [productResult, categoriesResult] = await Promise.all([
		getProductById(id),
		getAllCategories(),
	]);

	if (!productResult.success || !productResult.data) {
		notFound();
	}

	const product = productResult.data;
	const categories = categoriesResult.success ? categoriesResult.data : [];

	return (
		<div className="min-h-screen">
			<DashboardHeader
				title={`Edit: ${product.name}`}
				description="Perbarui informasi produk"
				backUrl={`/dashboard/products/${product.id}`}
			/>

			<div className="mx-auto max-w-3xl p-6">
				<ProductForm product={product} categories={categories!} />
			</div>
		</div>
	);
}
