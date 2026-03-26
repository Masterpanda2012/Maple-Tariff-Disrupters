import { Suspense } from "react";

import { AuthPageShell } from "~/components/auth/AuthPageShell";
import { env } from "~/env";

import { RegisterForm } from "./register-form";

export default function RegisterPage() {
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
        <RegisterForm googleAuthEnabled={googleAuthEnabled} />
      </Suspense>
    </AuthPageShell>
  );
}
