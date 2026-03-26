"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getSession, signIn } from "next-auth/react";
import { useState } from "react";

import { GoogleSignInButton } from "~/app/_components/google-sign-in-button";

type AppRole = "BUSINESS" | "CUSTOMER";

function safeCallbackPath(raw: string | null): string | null {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return null;
  return raw;
}

export function LoginForm({ googleAuthEnabled }: { googleAuthEnabled: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [googlePending, setGooglePending] = useState(false);

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
        setError("Invalid email or password.");
        return;
      }
      const session = await getSession();
      const role = (session?.user?.role as AppRole | undefined) ?? "CUSTOMER";
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
    <div className="w-full max-w-md animate-scale-in rounded-2xl border border-white/15 bg-white/10 p-8 shadow-2xl shadow-black/20 backdrop-blur-md motion-reduce:animate-none">
      <p className="animate-fade-in-up text-center text-xs font-semibold uppercase tracking-[0.2em] text-white/60 motion-reduce:animate-none">
        Account Access
      </p>
      <h1 className="mb-4 mt-2 animate-fade-in-up text-center text-2xl font-bold tracking-tight delay-75 motion-reduce:animate-none">
        Log in
      </h1>
      <p className="mb-6 animate-fade-in-up rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm text-white/80 delay-100 motion-reduce:animate-none">
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
          <p className="animate-fade-in-up mb-4 text-center text-xs text-white/55 motion-reduce:animate-none">
            or use email and password
          </p>
        </>
      ) : null}
      <form
        onSubmit={onSubmit}
        className="animate-fade-in-up flex flex-col gap-4 delay-150 motion-reduce:animate-none"
      >
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
      <p className="mt-6 animate-fade-in-up text-center text-sm text-white/70 delay-300 motion-reduce:animate-none">
        No account?{" "}
        <Link
          href="/register"
          className="font-medium text-[hsl(280,100%,70%)] hover:underline"
        >
          Register
        </Link>
      </p>
      <p className="mt-4 animate-fade-in-up text-center delay-[350ms] motion-reduce:animate-none">
        <Link href="/" className="text-sm text-white/50 hover:text-white/80">
          ← Back home
        </Link>
      </p>
    </div>
  );
}
