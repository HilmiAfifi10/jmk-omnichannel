'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { storeRepository, tiktokRepository } from '@/repositories';
import { updateStoreSchema } from '@/validation/store';
import { ActionResult, Store } from '@/types';

export async function getStore() {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return { success: false, error: 'Unauthorized' };
		}

		const store = await storeRepository.findByUserId(session.user.id);
		return { success: true, data: store };
	} catch (error) {
		console.error('Error getting store:', error);
		return { success: false, error: 'Gagal memuat data toko' };
	}
}

export async function updateStore(formData: FormData): Promise<ActionResult<Store>> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return { success: false, error: 'Unauthorized' };
		}

		const store = await storeRepository.findByUserId(session.user.id);
		if (!store) {
			return { success: false, error: 'Toko tidak ditemukan' };
		}

		const data = {
			name: formData.get('name') as string,
			slug: formData.get('slug') as string || undefined,
			description: formData.get('description') as string || undefined,
			logo: formData.get('logo') as string || undefined,
			currency: formData.get('currency') as string || undefined,
			phone: formData.get('phone') as string || undefined,
			email: formData.get('email') as string || undefined,
			address: formData.get('address') as string || undefined,
		};

		// Remove undefined values
		const cleanData = Object.fromEntries(
			Object.entries(data).filter(([, v]) => v !== undefined)
		);

		const validated = updateStoreSchema.safeParse(cleanData);
		if (!validated.success) {
			return {
				success: false,
				error: 'Validasi gagal',
				errors: validated.error.flatten().fieldErrors as Record<string, string[]>,
			};
		}

		const updatedStore = await storeRepository.update(store.id, validated.data);

		revalidatePath('/dashboard');
		revalidatePath('/dashboard/settings');
		return { success: true, data: updatedStore };
	} catch (error) {
		console.error('Error updating store:', error);
		return { success: false, error: 'Gagal memperbarui toko' };
	}
}

export async function getTikTokIntegration() {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return { success: false, error: 'Unauthorized' };
		}

		const store = await storeRepository.findByUserId(session.user.id);
		if (!store) {
			return { success: true, data: null };
		}

		const integration = await tiktokRepository.findByStoreId(store.id);
		return { success: true, data: integration };
	} catch (error) {
		console.error('Error getting TikTok integration:', error);
		return { success: false, error: 'Gagal memuat integrasi TikTok' };
	}
}

export async function disconnectTikTok(): Promise<ActionResult> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return { success: false, error: 'Unauthorized' };
		}

		const store = await storeRepository.findByUserId(session.user.id);
		if (!store) {
			return { success: false, error: 'Store not found' };
		}

		const integration = await tiktokRepository.findByStoreId(store.id);
		if (!integration) {
			return { success: true };
		}

		await tiktokRepository.deleteByStoreId(store.id);
		revalidatePath('/dashboard/settings');
		return { success: true };
	} catch (error) {
		console.error('Error disconnecting TikTok:', error);
		return { success: false, error: 'Gagal memutuskan TikTok' };
	}
}
