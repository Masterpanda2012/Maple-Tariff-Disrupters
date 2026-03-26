import type { ReactNode } from "react";

/**
 * Full-viewport auth backdrop shared by login and register.
 */
export function AuthPageShell({ children }: { children: ReactNode }) {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#2e026d] via-[#251456] to-[#15162c] px-4 py-12 text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(250, 204, 255, 0.35) 0%, transparent 55%), radial-gradient(ellipse 60% 40% at 100% 100%, rgba(99, 102, 241, 0.22) 0%, transparent 50%)",
        }}
      />
      <div className="pointer-events-none absolute -left-1/4 top-0 h-[min(480px,90vw)] w-[min(480px,90vw)] rounded-full bg-fuchsia-500/25 blur-3xl animate-hero-blob" />
      <div className="pointer-events-none absolute -right-1/4 bottom-0 h-[min(400px,80vw)] w-[min(400px,80vw)] rounded-full bg-violet-600/20 blur-3xl animate-hero-blob-2" />
      <div className="pointer-events-none absolute inset-x-0 top-1/3 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer-line motion-reduce:animate-none" />
      <div className="relative z-10 w-full max-w-md">{children}</div>
    </main>
  );
}
