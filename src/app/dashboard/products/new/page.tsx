import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { DashboardHeader } from '@/components/dashboard/header';
import { ProductForm } from '../_components/product-form';
import { getAllCategories } from '../../categories/actions';

export default async function NewProductPage() {
	const categoriesResult = await getAllCategories();
	const categories = categoriesResult.success ? categoriesResult.data : [];

	return (
		<div className="min-h-screen">
			<DashboardHeader
				title="Tambah Produk Baru"
				description="Tambahkan produk baru ke katalog Anda"
				backUrl="/dashboard/products"
			/>

			<div className="mx-auto max-w-3xl p-6">
				<ProductForm categories={categories!} />
			</div>
		</div>
	);
}
