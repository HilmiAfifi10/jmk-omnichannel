import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { DashboardHeader } from '@/components/dashboard/header';
import { ProductForm } from '../../_components/product-form';
import { getProductById } from '../../actions';
import { getAllCategories } from '../../../categories/actions';

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
				actions={
					<Button variant="ghost" asChild size="icon">
						<Link href={`/dashboard/products/${product.id}`}>
							<ArrowLeft />
						</Link>
					</Button>
				}
			/>

			<div className="mx-auto max-w-3xl p-6">
				<ProductForm product={product} categories={categories!} />
			</div>
		</div>
	);
}
