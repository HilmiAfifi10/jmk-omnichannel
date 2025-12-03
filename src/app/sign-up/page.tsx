'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useTransition } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';

import { signupSchema } from '@/validation/user';
import { useFormErrorMapping } from '@/hooks/use-form-error-mapping';

import { createUser } from './actions';

const initialState = {
	success: false,
	message: '',
};

export default function SignupPage() {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [state, formAction, pending] = useActionState(createUser, initialState);
	const form = useForm<z.infer<typeof signupSchema>>({
		resolver: zodResolver(signupSchema),
		defaultValues: {
			name: '',
			email: '',
			password: '',
			passwordConfirm: '',
		},
	});

	useFormErrorMapping(state, form);

	useEffect(() => {
		if (state.success) {
			form.reset();
			router.push('/sign-in');
			toast.success('Account created successfully. Please sign in.');
		}
	}, [state, form, router]);

	const onSubmit = form.handleSubmit((data) => {
		const formData = new FormData();

		formData.append('name', data.name);
		formData.append('email', data.email);
		formData.append('password', data.password);
		formData.append('confirm-password', data.passwordConfirm);

		startTransition(() => {
			formAction(formData);
		});
	});

	return (
		<div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
			<div className="flex w-full max-w-sm flex-col gap-6">
				<div className="flex flex-col gap-6">
					<Card>
						<CardHeader className="text-center">
							<CardTitle className="text-xl">Create your account</CardTitle>

							<CardDescription>
								Fill in the details to get started
							</CardDescription>
						</CardHeader>

						<CardContent>
							<form onSubmit={onSubmit}>
								<FieldGroup>
									<Controller
										name="name"
										control={form.control}
										render={({ field, fieldState }) => (
											<Field>
												<FieldLabel htmlFor="name">Name</FieldLabel>

												<Input
													{...field}
													id="name"
													type="text"
													placeholder="John Doe"
												/>

												{fieldState.error && (
													<FieldError errors={[fieldState.error]} />
												)}
											</Field>
										)}
									/>

									<Controller
										name="email"
										control={form.control}
										render={({ field, fieldState }) => (
											<Field>
												<FieldLabel htmlFor="email">Email</FieldLabel>

												<Input
													{...field}
													id="email"
													type="email"
													placeholder="m@example.com"
												/>

												{fieldState.error && (
													<FieldError errors={[fieldState.error]} />
												)}
											</Field>
										)}
									/>

									<Field>
										<Field className="grid grid-cols-2 gap-4">
											<Controller
												name="password"
												control={form.control}
												render={({ field, fieldState }) => (
													<Field>
														<FieldLabel htmlFor="password">Password</FieldLabel>

														<Input {...field} id="password" type="password" />

														{fieldState.error && (
															<FieldError errors={[fieldState.error]} />
														)}
													</Field>
												)}
											/>

											<Controller
												name="passwordConfirm"
												control={form.control}
												render={({ field, fieldState }) => (
													<Field>
														<FieldLabel htmlFor="confirm-password">
															Confirm Password
														</FieldLabel>

														<Input
															{...field}
															id="confirm-password"
															type="password"
														/>

														{fieldState.error && (
															<FieldError errors={[fieldState.error]} />
														)}
													</Field>
												)}
											/>
										</Field>

										<FieldDescription>
											Must be at least 8 characters long.
										</FieldDescription>
									</Field>

									<Field>
										<Button
											type="submit"
											disabled={
												pending || isPending || form.formState.isSubmitting
											}
										>
											Create Account
										</Button>

										<FieldDescription className="text-center">
											Already have an account?{' '}
											<Link href="/sign-in">Sign in</Link>
										</FieldDescription>
									</Field>
								</FieldGroup>
							</form>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
