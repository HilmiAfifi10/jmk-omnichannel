'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useActionState, useTransition } from 'react';
import { Controller, useForm } from 'react-hook-form';
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

import { useFormErrorMapping } from '@/hooks/use-form-error-mapping';
import { signinSchema } from '@/validation/user';

import { signinUserWithCredential } from './actions';

const initialState = {
	success: false,
	message: '',
};

export default function SigninPage() {
	const [isPending, startTransition] = useTransition();
	const [state, formAction, pending] = useActionState(
		signinUserWithCredential,
		initialState
	);
	const form = useForm<z.infer<typeof signinSchema>>({
		resolver: zodResolver(signinSchema),
		defaultValues: {
			email: '',
			password: '',
		},
	});

	useFormErrorMapping(state, form);

	const onSubmit = form.handleSubmit((data) => {
		const formData = new FormData();

		formData.append('email', data.email);
		formData.append('password', data.password);

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
							<CardTitle className="text-xl">Welcome back</CardTitle>

							<CardDescription>Sign in with your credentials</CardDescription>
						</CardHeader>

						<CardContent>
							<form onSubmit={onSubmit}>
								<FieldGroup>
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

									<Field>
										<Button
											type="submit"
											disabled={
												pending || isPending || form.formState.isSubmitting
											}
										>
											Login
										</Button>

										<FieldDescription className="text-center">
											Don&apos;t have an account?{' '}
											<Link href="/sign-up">Sign up</Link>
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
