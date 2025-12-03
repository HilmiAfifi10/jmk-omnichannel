import { PrismaAdapter } from '@auth/prisma-adapter';
import { compare } from 'bcrypt';
import NextAuth from 'next-auth';
import Credential from 'next-auth/providers/credentials';
import { prisma } from './prisma';

import { signinSchema } from '@/validation/user';

export const { handlers, signIn, signOut, auth } = NextAuth({
	adapter: PrismaAdapter(prisma),
	session: {
		strategy: 'jwt',
	},
	providers: [
		Credential({
			credentials: {
				email: {
					type: 'email',
					label: 'Email',
					placeholder: 'johndoe@gmail.com',
				},
				password: {
					type: 'password',
					label: 'Password',
					placeholder: '*****',
				},
			},
			authorize: async (credentials) => {
				let user = null;

				const parsedCredentials = signinSchema.safeParse(credentials);

				if (!parsedCredentials.success) {
					return null;
				}

				user = await prisma.user.findUnique({
					where: {
						email: parsedCredentials.success
							? parsedCredentials.data.email
							: '',
					},
				});

				if (!user || !user.password) {
					return null;
				}

				const isPasswordValid = await compare(
					parsedCredentials.success ? parsedCredentials.data.password : '',
					user.password
				);

				if (!isPasswordValid) {
					return null;
				}

				return user;
			},
		}),
	],
	pages: {
		signIn: '/signin',
	},
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.id = user.id;
				token.email = user.email;
				token.name = user.name;
			}
			return token;
		},
		async session({ session, token }) {
			if (token && session.user) {
				session.user.id = token.id as string;
			}
			return session;
		},
	},
});
