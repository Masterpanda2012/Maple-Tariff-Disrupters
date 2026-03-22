import { compare } from "bcryptjs";
import { cache } from "react";
import NextAuth from "next-auth";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

import { UserRole } from "../../generated/prisma";
import { env } from "~/env";
import { db } from "~/server/db";

/**
 * NextAuth configuration used by the App Router API route and server helpers.
 * Credentials sign-in uses the `username` credential (email or legacy username) + password,
 * verified with bcrypt against `User.passwordHash`. Email addresses are matched case-insensitively.
 * JWT and session carry `id`, `role`, and `username` for authorization (business vs customer).
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      username: string;
    } & DefaultSession["user"];
  }

  interface User {
    username: string;
    role: UserRole;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id?: string;
    username?: string;
    role?: UserRole;
  }
}

const credentialsSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const authOptions = {
  secret: env.AUTH_SECRET,
  trustHost: true,
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { username, password } = parsed.data;
        const input = username.trim();
        const normalizedEmail = input.toLowerCase();

        const user = input.includes("@")
          ? await db.user.findFirst({
              where: {
                OR: [
                  { email: normalizedEmail },
                  { username: normalizedEmail },
                ],
              },
            })
          : await db.user.findUnique({
              where: { username: input },
            });
        if (!user) return null;

        const valid = await compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          name: user.name ?? user.username,
          email: user.email ?? undefined,
          username: user.username,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        const u = user as typeof user & {
          username: string;
          role: UserRole;
        };
        token.id = u.id;
        token.username = u.username;
        token.role = u.role;
      }
      return token;
    },
    session: ({ session, token }) => {
      const t = token as typeof token & {
        id?: string;
        username?: string;
        role?: UserRole;
      };
      const id = typeof t.id === "string" ? t.id : (t.sub ?? "");
      const username =
        typeof t.username === "string" ? t.username : "";
      const role =
        t.role === UserRole.BUSINESS || t.role === UserRole.CUSTOMER
          ? t.role
          : UserRole.CUSTOMER;

      return {
        ...session,
        user: {
          ...session.user,
          id,
          username,
          role,
        },
      };
    },
  },
} satisfies NextAuthConfig;

const { auth: uncachedAuth, handlers, signIn, signOut } =
  NextAuth(authOptions);

export const auth = cache(uncachedAuth);
export { handlers, signIn, signOut };
