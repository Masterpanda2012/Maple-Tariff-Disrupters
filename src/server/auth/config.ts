import { compare } from "bcryptjs";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

import { UserRole } from "../../../generated/prisma";
import { db } from "~/server/db";

const credentialsSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the session
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      username: string;
      role: UserRole;
    } & DefaultSession["user"];
  }

  interface User {
    username: string;
    role: UserRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    username?: string;
    role?: UserRole;
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
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
        const user = await db.user.findUnique({
          where: { username },
        });
        if (!user) return null;

        const valid = await compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          name: user.name ?? user.username,
          username: user.username,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        const t = token as typeof token & {
          id?: string;
          username?: string;
          role?: UserRole;
        };
        t.id = user.id;
        t.username = user.username;
        t.role = user.role;
      }
      return token;
    },
    session: ({ session, token }) => {
      const t = token as typeof token & {
        id?: string;
        username?: string;
        role?: UserRole;
      };
      return {
        ...session,
        user: {
          ...session.user,
          id: t.id ?? t.sub!,
          username: t.username ?? "",
          role: t.role ?? UserRole.CUSTOMER,
        },
      };
    },
  },
} satisfies NextAuthConfig;
