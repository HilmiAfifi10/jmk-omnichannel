import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface UploadResult {
	success: boolean;
	url?: string;
	error?: string;
}

/**
 * Upload file to Supabase Storage
 * @param file - File to upload
 * @param bucket - Storage bucket name (default: 'products')
 * @param folder - Folder path within bucket (optional)
 * @returns UploadResult with success status and URL or error
 */
export async function uploadFile(
	file: File,
	bucket: string = 'products',
	folder?: string
): Promise<UploadResult> {
	try {
		// Generate unique filename
		const fileExt = file.name.split('.').pop();
		const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
		const filePath = folder ? `${folder}/${fileName}` : fileName;

		// Upload file
		const { data, error } = await supabase.storage
			.from(bucket)
			.upload(filePath, file, {
				cacheControl: '3600',
				upsert: false,
			});

		if (error) {
			console.error('Supabase upload error:', error);
			return { success: false, error: error.message };
		}

		// Get public URL
		const { data: urlData } = supabase.storage
			.from(bucket)
			.getPublicUrl(data.path);

		return {
			success: true,
			url: urlData.publicUrl,
		};
	} catch (error) {
		console.error('Upload file error:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error',
		};
	}
}

/**
 * Delete file from Supabase Storage
 * @param url - Full URL of the file to delete
 * @param bucket - Storage bucket name (default: 'products')
 * @returns Success status
 */
export async function deleteFile(
	url: string,
	bucket: string = 'products'
): Promise<boolean> {
	try {
		// Extract file path from URL
		const urlObj = new URL(url);
		const pathParts = urlObj.pathname.split(`/storage/v1/object/public/${bucket}/`);
		
		if (pathParts.length < 2) {
			console.error('Invalid file URL format');
			return false;
		}

		const filePath = pathParts[1];

		const { error } = await supabase.storage.from(bucket).remove([filePath]);

		if (error) {
			console.error('Supabase delete error:', error);
			return false;
		}

		return true;
	} catch (error) {
		console.error('Delete file error:', error);
		return false;
	}
}

/**
 * Upload barcode image for product variant
 * @param file - Barcode image file
 * @returns UploadResult with success status and URL or error
 */
export async function uploadBarcodeImage(file: File): Promise<UploadResult> {
	return uploadFile(file, 'products', 'barcodes');
}

/**
 * Upload product image
 * @param file - Product image file
 * @returns UploadResult with success status and URL or error
 */
export async function uploadProductImage(file: File): Promise<UploadResult> {
	return uploadFile(file, 'products', 'images');
}
