'use server';

import { hash } from 'bcrypt';
import { z } from 'zod';

import { prisma } from '@/lib/prisma';
import { signupSchema } from '@/validation/user';

export async function createUser(_initialState: any, formData: FormData) {
	const validatedFields = signupSchema.safeParse({
		name: formData.get('name'),
		email: formData.get('email'),
		password: formData.get('password'),
		passwordConfirm: formData.get('confirm-password'),
	});

	if (!validatedFields.success) {
		return {
			success: false,
			errors: z.flattenError(validatedFields.error),
		};
	}

	try {
		// Check if email already exists
		const existingUser = await prisma.user.findUnique({
			where: { email: validatedFields.data.email },
		});

		if (existingUser) {
			return {
				success: false,
				errors: {
					fieldErrors: {
						email: ['Email already registered'],
					},
					formErrors: [],
				},
			};
		}

		await prisma.user.create({
			data: {
				name: validatedFields.data.name,
				email: validatedFields.data.email,
				password: await hash(
					validatedFields.data.password,
					Number(process.env.SALT_ROUNDS)
				),
			},
		});
	} catch (error) {
		console.error('Error creating user:', error);
		return {
			success: false,
			message: 'Failed to create account. Please try again.',
		};
	}

	return { success: true, message: 'User created successfully' };
}
