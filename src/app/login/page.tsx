import { Suspense } from "react";

import { AuthPageShell } from "~/components/auth/AuthPageShell";
import { env } from "~/env";

import { LoginForm } from "./login-form";

export default function LoginPage() {
  const googleAuthEnabled = Boolean(
    env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET,
  );

  return (
    <AuthPageShell>
      <Suspense
        fallback={
          <div className="w-full rounded-2xl bg-white/10 p-8 text-center text-white/70 backdrop-blur">
            Loading…
          </div>
        }
      >
        <LoginForm googleAuthEnabled={googleAuthEnabled} />
      </Suspense>
    </AuthPageShell>
  );
}
