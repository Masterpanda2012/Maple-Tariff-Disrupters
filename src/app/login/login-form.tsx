"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getSession, signIn } from "next-auth/react";
import { useEffect, useState } from "react";

import { GoogleSignInButton } from "~/app/_components/google-sign-in-button";
import { messageForOAuthError } from "~/lib/oauth-login-errors";

type AppRole = "BUSINESS" | "CUSTOMER";

function safeCallbackPath(raw: string | null): string | null {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return null;
  return raw;
}

export function LoginForm({ googleAuthEnabled }: { googleAuthEnabled: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const reduceMotion = useReducedMotion();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [googlePending, setGooglePending] = useState(false);

  useEffect(() => {
    const code = searchParams.get("error");
    const msg = messageForOAuthError(code);
    if (!msg) return;
    setError(msg);
    const next = new URLSearchParams(searchParams.toString());
    next.delete("error");
    next.delete("code");
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const normalized = email.trim().toLowerCase();
      const result = await signIn("credentials", {
        username: normalized,
        password,
        redirect: false,
      });
      if (result?.error) {
        setError(
          messageForOAuthError(result.error) ?? "Invalid email or password.",
        );
        return;
      }
      let session;
      try {
        session = await getSession();
      } catch {
        setError(
          "Signed in, but the session could not load. Check NEXT_PUBLIC_APP_URL on Vercel matches your site URL, then refresh.",
        );
        return;
      }
      if (!session?.user) {
        setError(
          "Signed in, but no session was returned. Redeploy with correct AUTH_SECRET and site URL, then try again.",
        );
        return;
      }
      const role = (session.user.role as AppRole | undefined) ?? "CUSTOMER";
      const callbackUrl = safeCallbackPath(searchParams.get("callbackUrl"));
      const defaultPath =
        role === "BUSINESS" ? "/business/dashboard" : "/marketplace";
      router.push(callbackUrl ?? defaultPath);
      router.refresh();
    } catch {
      setError(
        "We couldn't reach the server. Please refresh and try signing in again.",
      );
    } finally {
      setPending(false);
    }
  }

  async function onGoogleSignIn() {
    if (!googleAuthEnabled) return;
    setError(null);
    setGooglePending(true);
    try {
      const callbackUrl =
        safeCallbackPath(searchParams.get("callbackUrl")) ?? "/marketplace";
      await signIn("google", { callbackUrl });
    } catch {
      setError("Google sign-in failed to start. Please try again.");
    } finally {
      setGooglePending(false);
    }
  }

  return (
    <motion.div
      className="w-full max-w-md rounded-2xl border border-white/15 bg-white/10 p-8 shadow-2xl shadow-black/20 backdrop-blur-md"
      initial={reduceMotion ? undefined : { opacity: 0, y: 14, scale: 0.98 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.45,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
        Account Access
      </p>
      <h1 className="mb-4 mt-2 text-center text-2xl font-bold tracking-tight">
        Log in
      </h1>
      <p className="mb-6 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm text-white/80">
        Welcome back. Sign in to continue tracking news alerts and marketplace
        activity.
      </p>
      {googleAuthEnabled ? (
        <>
          <GoogleSignInButton
            disabled={googlePending || pending}
            pending={googlePending}
            onClick={onGoogleSignIn}
            labelIdle="Continue with Google"
          />
          <p className="mb-4 text-center text-xs text-white/55">
            or use email and password
          </p>
        </>
      ) : (
        <p className="mb-4 rounded-xl border border-dashed border-white/20 bg-white/[0.06] px-4 py-3 text-center text-xs leading-relaxed text-white/65">
          Google sign-in is not enabled on this deployment. Add{" "}
          <span className="font-mono text-[0.7rem] text-white/80">
            GOOGLE_CLIENT_ID
          </span>{" "}
          and{" "}
          <span className="font-mono text-[0.7rem] text-white/80">
            GOOGLE_CLIENT_SECRET
          </span>{" "}
          to your environment, set the OAuth redirect URI to{" "}
          <span className="break-all font-mono text-[0.65rem] text-white/75">
            …/api/auth/callback/google
          </span>
          , then redeploy.
        </p>
      )}
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-white/80">Email</span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/40 transition duration-300 focus:border-[hsl(280,100%,70%)] focus:outline-none focus:ring-1 focus:ring-[hsl(280,100%,70%)]"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-white/80">Password</span>
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/40 transition duration-300 focus:border-[hsl(280,100%,70%)] focus:outline-none focus:ring-1 focus:ring-[hsl(280,100%,70%)]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {error ? (
          <p className="text-sm text-red-300" role="alert">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={pending || googlePending}
          className="mt-2 rounded-xl bg-[hsl(280,100%,70%)] px-4 py-2.5 font-semibold text-[#15162c] shadow-lg shadow-black/20 transition duration-300 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-xl active:translate-y-0 disabled:translate-y-0 disabled:opacity-50"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-white/70">
        No account?{" "}
        <Link
          href="/register"
          className="font-medium text-[hsl(280,100%,70%)] hover:underline"
        >
          Register
        </Link>
      </p>
      <p className="mt-4 text-center">
        <Link href="/" className="text-sm text-white/50 hover:text-white/80">
          ← Back home
        </Link>
      </p>
    </motion.div>
  );
}
