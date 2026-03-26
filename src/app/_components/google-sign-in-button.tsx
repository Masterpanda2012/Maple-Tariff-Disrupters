"use client";

import { motion, useReducedMotion } from "framer-motion";

type GoogleSignInButtonProps = {
  disabled: boolean;
  pending: boolean;
  onClick: () => void | Promise<void>;
  /** e.g. "Continue with Google" / "Continue with Google" on register */
  labelIdle: string;
  labelPending?: string;
};

/** Inline SVG per Google identity branding (multicolor G). */
function GoogleGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      width={20}
      height={20}
      aria-hidden
    >
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303C33.42 32.58 29.328 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.108 26.715 36 24 36c-5.314 0-9.788-3.607-11.404-8.485l-6.533 5.032C9.735 39.556 16.24 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.574l.003-.002 6.19 5.238C36.037 39.557 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}

export function GoogleSignInButton({
  disabled,
  pending,
  onClick,
  labelIdle,
  labelPending = "Connecting…",
}: GoogleSignInButtonProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.button
      type="button"
      disabled={disabled}
      onClick={() => void onClick()}
      whileTap={reduceMotion || disabled ? undefined : { scale: 0.98 }}
      whileHover={
        reduceMotion || disabled ? undefined : { y: -2, transition: { duration: 0.2 } }
      }
      className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border border-white/25 bg-white px-4 py-2.5 text-sm font-semibold text-[#1f1f1f] shadow-md transition-colors duration-300 hover:bg-white/95 disabled:translate-y-0 disabled:opacity-60"
    >
      <GoogleGlyph className="shrink-0" />
      {pending ? labelPending : labelIdle}
    </motion.button>
  );
}
