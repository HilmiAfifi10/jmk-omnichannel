'use server';

import { signIn } from '@/lib/auth';
import { signinSchema } from '@/validation/user';
import { AuthError } from 'next-auth';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import z from 'zod';

export async function signinUserWithCredential(
	_initialState: any,
	formData: FormData
) {
	const validatedFields = signinSchema.safeParse({
		email: formData.get('email'),
		password: formData.get('password'),
	});

	if (!validatedFields.success) {
		return {
			success: false,
			errors: z.flattenError(validatedFields.error),
		};
	}

	try {
		await signIn('credentials', {
			email: validatedFields.data.email,
			password: validatedFields.data.password,
			redirectTo: '/',
		});

		return { success: true, message: 'Signed in successfully' };
	} catch (error) {
		if (isRedirectError(error)) {
			throw error;
		}
		
		if (error instanceof AuthError) {
			switch (error.type) {
				case 'CredentialsSignin':
					return {
						success: false,
						message: 'Invalid email or password',
					};
				default:
					return {
						success: false,
						message: 'Something went wrong',
					};
			}
		}

		console.error('Error signing in:', error);
		return {
			success: false,
			message: 'Failed to sign in. Please try again.',
		};
	}
}
