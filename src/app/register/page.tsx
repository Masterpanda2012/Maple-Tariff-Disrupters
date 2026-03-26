import { Suspense } from "react";

import { env } from "~/env";

import { RegisterForm } from "./register-form";

export default function RegisterPage() {
  const googleAuthEnabled = Boolean(
    env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET,
  );

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
          <RegisterForm googleAuthEnabled={googleAuthEnabled} />
        </Suspense>
      </div>
    </main>
  );
}
