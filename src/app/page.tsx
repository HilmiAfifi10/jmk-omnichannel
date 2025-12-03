'use client';

import { useSession } from 'next-auth/react';
import { signOut } from 'next-auth/react';

import { Button } from '@/components/ui/button';

export default function Home() {
	const session = useSession();

	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black gap-4">
			{session.data ? (
				<>
					<h1 className="text-2xl font-bold">
						Signed in as {session.data?.user?.email}
					</h1>
					<Button onClick={() => signOut()}>Sign out</Button>
				</>
			) : (
				<>
					<h1 className="text-2xl font-bold">Not signed in yet</h1>

					<div>
						<Button variant="secondary" asChild>
							<a href="/sign-up">Sign up</a>
						</Button>

						<Button asChild className="ml-4">
							<a href="/sign-in">Sign in</a>
						</Button>
					</div>
				</>
			)}
		</div>
	);
}
