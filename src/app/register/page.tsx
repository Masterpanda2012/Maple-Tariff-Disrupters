"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getSession, signIn } from "next-auth/react";
import { Suspense, useEffect, useState } from "react";

import { UserRole } from "../../../generated/prisma";

type RoleTab = "business" | "customer";

function safeCallbackPath(raw: string | null): string | null {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return null;
  return raw;
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [roleTab, setRoleTab] = useState<RoleTab>("customer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const type = searchParams.get("type");
    if (type === "business") setRoleTab("business");
    if (type === "customer") setRoleTab("customer");
  }, [searchParams]);

  const selectedRole =
    roleTab === "business" ? UserRole.BUSINESS : UserRole.CUSTOMER;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
          role: selectedRole,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not create account.");
        return;
      }
      const signInResult = await signIn("credentials", {
        username: email.trim().toLowerCase(),
        password,
        redirect: false,
      });
      if (signInResult?.error) {
        setError("Account created but sign-in failed. Try logging in.");
        router.push("/login");
        return;
      }
      const session = await getSession();
      const role = session?.user?.role ?? selectedRole;
      const callbackUrl = safeCallbackPath(searchParams.get("callbackUrl"));
      const defaultPath =
        role === UserRole.BUSINESS
          ? "/business/dashboard"
          : "/marketplace";
      router.push(callbackUrl ?? defaultPath);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="w-full max-w-sm animate-scale-in rounded-2xl border border-white/15 bg-white/10 p-8 shadow-2xl shadow-black/20 backdrop-blur-md">
      <h1 className="mb-6 text-center text-2xl font-bold tracking-tight">
        Register
      </h1>
      <div
        className="mb-6 flex rounded-lg border border-white/20 p-1"
        role="tablist"
        aria-label="Account type"
      >
        <button
          type="button"
          role="tab"
          aria-selected={roleTab === "business"}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition ${
            roleTab === "business"
              ? "bg-[hsl(280,100%,70%)] text-[#15162c]"
              : "text-white/80 hover:bg-white/10"
          }`}
          onClick={() => setRoleTab("business")}
        >
          Business
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={roleTab === "customer"}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition ${
            roleTab === "customer"
              ? "bg-[hsl(280,100%,70%)] text-[#15162c]"
              : "text-white/80 hover:bg-white/10"
          }`}
          onClick={() => setRoleTab("customer")}
        >
          Customer
        </button>
      </div>
      <p className="mb-4 text-center text-sm text-white/70">
        Password must be at least 8 characters. You’ll use your email to sign
        in.
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
            autoComplete="new-password"
            className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/40 focus:border-[hsl(280,100%,70%)] focus:outline-none focus:ring-1 focus:ring-[hsl(280,100%,70%)]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
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
          {pending ? "Creating account…" : "Create account"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-white/70">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-[hsl(280,100%,70%)] hover:underline"
        >
          Log in
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

export default function RegisterPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#2e026d] to-[#15162c] px-4 text-white">
      <div className="pointer-events-none absolute -left-1/4 top-0 h-[min(480px,90vw)] w-[min(480px,90vw)] rounded-full bg-fuchsia-500/25 blur-3xl animate-hero-blob" />
      <div className="pointer-events-none absolute -right-1/4 bottom-0 h-[min(400px,80vw)] w-[min(400px,80vw)] rounded-full bg-violet-600/20 blur-3xl animate-hero-blob-2" />
      <div className="relative z-10 w-full max-w-sm">
        <Suspense
          fallback={
            <div className="w-full rounded-2xl bg-white/10 p-8 text-center text-white/70 backdrop-blur">
              Loading…
            </div>
          }
        >
          <RegisterForm />
        </Suspense>
      </div>
    </main>
  );
}
