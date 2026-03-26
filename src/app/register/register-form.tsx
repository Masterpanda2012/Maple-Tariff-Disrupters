"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getSession, signIn } from "next-auth/react";
import { useEffect, useState } from "react";

import { GoogleSignInButton } from "~/app/_components/google-sign-in-button";

type RoleTab = "business" | "customer";
type AppRole = "BUSINESS" | "CUSTOMER";

function safeCallbackPath(raw: string | null): string | null {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return null;
  return raw;
}

export function RegisterForm({
  googleAuthEnabled,
}: {
  googleAuthEnabled: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [roleTab, setRoleTab] = useState<RoleTab>("customer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [googlePending, setGooglePending] = useState(false);

  useEffect(() => {
    const type = searchParams.get("type");
    if (type === "business") setRoleTab("business");
    if (type === "customer") setRoleTab("customer");
  }, [searchParams]);

  const selectedRole =
    roleTab === "business" ? "BUSINESS" : "CUSTOMER";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          role: selectedRole,
        }),
      });
      const data = (await res
        .json()
        .catch(() => ({}))) as { error?: string; details?: unknown };
      if (!res.ok) {
        if (res.status === 409) {
          setError("That email is already registered. Try logging in.");
          return;
        }
        setError(data.error ?? "Could not create account. Please try again.");
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
      const role = (session?.user?.role as AppRole | undefined) ?? selectedRole;
      const callbackUrl = safeCallbackPath(searchParams.get("callbackUrl"));
      const defaultPath =
        role === "BUSINESS" ? "/business/dashboard" : "/marketplace";
      router.push(callbackUrl ?? defaultPath);
      router.refresh();
    } catch {
      setError(
        "We couldn't reach the server. Please refresh and try again in a moment.",
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
      const intentRes = await fetch("/api/auth/oauth-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selectedRole }),
      });
      if (!intentRes.ok) {
        setError("Could not start Google sign-up. Please try again.");
        return;
      }
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
        Account Setup
      </p>
      <h1 className="mb-4 mt-2 animate-fade-in-up text-center text-2xl font-bold tracking-tight delay-75 motion-reduce:animate-none">
        Register
      </h1>
      <p className="mb-6 animate-fade-in-up rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm text-white/80 delay-100 motion-reduce:animate-none">
        Create your account in under a minute. You can switch between business
        and customer any time later.
      </p>
      <div
        className="animate-fade-in-up mb-6 flex rounded-lg border border-white/20 bg-white/[0.03] p-1 delay-150 motion-reduce:animate-none"
        role="tablist"
        aria-label="Account type"
      >
        <button
          type="button"
          role="tab"
          aria-selected={roleTab === "business"}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition duration-300 ${
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
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition duration-300 ${
            roleTab === "customer"
              ? "bg-[hsl(280,100%,70%)] text-[#15162c]"
              : "text-white/80 hover:bg-white/10"
          }`}
          onClick={() => setRoleTab("customer")}
        >
          Customer
        </button>
      </div>
      {googleAuthEnabled ? (
        <>
          <GoogleSignInButton
            disabled={googlePending || pending}
            pending={googlePending}
            onClick={onGoogleSignIn}
            labelIdle="Continue with Google"
          />
          <p className="animate-fade-in-up mb-4 text-center text-xs text-white/55 motion-reduce:animate-none">
            or register with email and password
          </p>
        </>
      ) : null}
      <p className="animate-fade-in-up mb-4 text-center text-sm text-white/70 delay-200 motion-reduce:animate-none">
        Password must be at least 8 characters. You’ll use your email to sign
        in.
      </p>
      <form
        onSubmit={onSubmit}
        className="animate-fade-in-up flex flex-col gap-4 delay-200 motion-reduce:animate-none"
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
            autoComplete="new-password"
            className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/40 transition duration-300 focus:border-[hsl(280,100%,70%)] focus:outline-none focus:ring-1 focus:ring-[hsl(280,100%,70%)]"
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
          disabled={pending || googlePending}
          className="mt-2 rounded-xl bg-[hsl(280,100%,70%)] px-4 py-2.5 font-semibold text-[#15162c] shadow-lg shadow-black/20 transition duration-300 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-xl active:translate-y-0 disabled:translate-y-0 disabled:opacity-50"
        >
          {pending ? "Creating account…" : "Create account"}
        </button>
      </form>
      <p className="mt-6 animate-fade-in-up text-center text-sm text-white/70 delay-300 motion-reduce:animate-none">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-[hsl(280,100%,70%)] hover:underline"
        >
          Log in
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
