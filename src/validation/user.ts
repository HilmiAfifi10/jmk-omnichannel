import z from 'zod';

const email = z.email({ error: 'Invalid email address' });
const name = z.string().min(2, { error: 'Name must be at least 2 characters' });
const password = z
	.string()
	.min(8, { error: 'Password must be at least 8 characters' });
const passwordConfirm = z
	.string()
	.min(8, { error: 'Password confirmation must be at least 8 characters' });

export const signupSchema = z
	.object({
		name,
		email,
		password,
		passwordConfirm,
	})
	.refine((data) => data.password === data.passwordConfirm, {
		message: "Passwords don't match",
		path: ['passwordConfirm'],
	});

export const signinSchema = z.object({
	email,
	password,
});
