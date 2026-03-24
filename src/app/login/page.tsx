"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getSession, signIn } from "next-auth/react";
import { Suspense, useState } from "react";

type AppRole = "BUSINESS" | "CUSTOMER";

function safeCallbackPath(raw: string | null): string | null {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return null;
  return raw;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const result = await signIn("credentials", {
        username: email.trim(),
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

  return (
    <div className="w-full max-w-md animate-scale-in rounded-2xl border border-white/15 bg-white/10 p-8 shadow-2xl shadow-black/20 backdrop-blur-md">
      <h1 className="mb-6 text-center text-2xl font-bold tracking-tight">
        Log in
      </h1>
      <p className="mb-6 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm text-white/80">
        Welcome back. Sign in to continue tracking news alerts and marketplace
        activity.
      </p>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-white/80">Email</span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/40 focus:border-[hsl(280,100%,70%)] focus:outline-none focus:ring-1 focus:ring-[hsl(280,100%,70%)]"
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
            className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/40 focus:border-[hsl(280,100%,70%)] focus:outline-none focus:ring-1 focus:ring-[hsl(280,100%,70%)]"
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
          disabled={pending}
          className="mt-2 rounded-xl bg-[hsl(280,100%,70%)] px-4 py-2.5 font-semibold text-[#15162c] shadow-lg shadow-black/20 transition duration-200 hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0 disabled:translate-y-0 disabled:opacity-50"
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
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#2e026d] to-[#15162c] px-4 text-white">
      <div className="pointer-events-none absolute -left-1/4 top-0 h-[min(480px,90vw)] w-[min(480px,90vw)] rounded-full bg-fuchsia-500/25 blur-3xl animate-hero-blob" />
      <div className="pointer-events-none absolute -right-1/4 bottom-0 h-[min(400px,80vw)] w-[min(400px,80vw)] rounded-full bg-violet-600/20 blur-3xl animate-hero-blob-2" />
      <div className="relative z-10 w-full max-w-md">
        <Suspense
          fallback={
            <div className="w-full rounded-2xl bg-white/10 p-8 text-center text-white/70 backdrop-blur">
              Loading…
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
