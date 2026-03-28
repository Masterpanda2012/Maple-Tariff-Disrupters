import { compare, hash } from "bcryptjs";
import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { cache } from "react";
import NextAuth from "next-auth";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
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

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    username?: string;
    role?: UserRole;
    picture?: string | null;
  }
}

const credentialsSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

type GoogleProfile = {
  email?: string | null;
  name?: string | null;
  picture?: string | null;
};

const providers = [
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
              OR: [{ email: normalizedEmail }, { username: normalizedEmail }],
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
        image: user.image ?? undefined,
      };
    },
  }),
  ...(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
    ? [
        Google({
          clientId: env.GOOGLE_CLIENT_ID,
          clientSecret: env.GOOGLE_CLIENT_SECRET,
          // Same email as an existing credentials account signs into that user (Google-verified email).
          allowDangerousEmailAccountLinking: true,
        }),
      ]
    : []),
] satisfies NextAuthConfig["providers"];

export const authOptions = {
  secret: env.AUTH_SECRET,
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  providers,
  callbacks: {
    jwt: async ({ token, user, account, profile }) => {
      if (account?.provider === "google") {
        const p = profile as GoogleProfile | null | undefined;
        const emailRaw = p?.email;
        if (!emailRaw) {
          return token;
        }
        const email = emailRaw.toLowerCase();

        let dbUser = await db.user.findFirst({
          where: { OR: [{ email }, { username: email }] },
        });

        if (!dbUser) {
          let intendedRole: UserRole = UserRole.CUSTOMER;
          try {
            const cookieStore = await cookies();
            const raw = cookieStore.get("oauth_intended_role")?.value;
            if (raw === UserRole.BUSINESS || raw === UserRole.CUSTOMER) {
              intendedRole = raw;
            }
            cookieStore.delete("oauth_intended_role");
          } catch {
            /* cookies unavailable */
          }

          dbUser = await db.user.create({
            data: {
              username: email,
              email,
              passwordHash: await hash(randomUUID(), 12),
              name: p?.name ?? email.split("@")[0] ?? email,
              image: p?.picture ?? undefined,
              role: intendedRole,
            },
          });
        } else {
          try {
            const cookieStore = await cookies();
            cookieStore.delete("oauth_intended_role");
          } catch {
            /* cookies unavailable */
          }

          const update: { image?: string | null; name?: string | null } = {};
          if (p?.picture && dbUser.image !== p.picture) {
            update.image = p.picture;
          }
          if (p?.name && !dbUser.name) {
            update.name = p.name;
          }
          if (Object.keys(update).length > 0) {
            dbUser = await db.user.update({
              where: { id: dbUser.id },
              data: update,
            });
          }
        }

        token.id = dbUser.id;
        token.sub = dbUser.id;
        token.username = dbUser.username;
        token.role = dbUser.role;
        token.picture = dbUser.image ?? p?.picture ?? null;
        return token;
      }

      if (user && account?.provider === "credentials") {
        const u = user as typeof user & {
          username: string;
          role: UserRole;
          image?: string | null;
        };
        token.id = u.id;
        token.sub = u.id;
        token.username = u.username;
        token.role = u.role;
        if (typeof u.image === "string" && u.image.length > 0) {
          token.picture = u.image;
        }
        return token;
      }

      return token;
    },
    session: ({ session, token }) => {
      const t = token as typeof token & {
        id?: string;
        username?: string;
        role?: UserRole;
        picture?: string | null;
      };
      const id = typeof t.id === "string" ? t.id : (t.sub ?? "");
      const username =
        typeof t.username === "string" ? t.username : "";
      const role =
        t.role === UserRole.BUSINESS || t.role === UserRole.CUSTOMER
          ? t.role
          : UserRole.CUSTOMER;
      const imageFromToken =
        typeof t.picture === "string" && t.picture.length > 0
          ? t.picture
          : undefined;

      return {
        ...session,
        user: {
          ...session.user,
          id,
          username,
          role,
          ...(imageFromToken
            ? { image: imageFromToken }
            : {}),
        },
      };
    },
  },
} satisfies NextAuthConfig;

const { auth: uncachedAuth, handlers, signIn, signOut } =
  NextAuth(authOptions);

export const auth = cache(uncachedAuth);
export { handlers, signIn, signOut };
