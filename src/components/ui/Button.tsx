import { forwardRef, type ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Visual style: maple red fill, outlined, or minimal. */
  variant?: ButtonVariant;
  /** Shows a spinner and disables the control until the action finishes. */
  isLoading?: boolean;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-maple text-white shadow-sm hover:bg-maple/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-maple disabled:pointer-events-none disabled:opacity-60",
  secondary:
    "border border-charcoal/25 bg-cream text-charcoal hover:bg-charcoal/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-maple disabled:pointer-events-none disabled:opacity-60",
  ghost:
    "bg-transparent text-charcoal hover:bg-charcoal/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-maple disabled:pointer-events-none disabled:opacity-60",
};

function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={`size-4 shrink-0 animate-spin ${className ?? ""}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

/**
 * Primary actions use maple red; secondary is outlined on cream; ghost is text-only.
 * When `isLoading` is true, the button is disabled and a spinner is shown before the label.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      className = "",
      variant = "primary",
      isLoading = false,
      disabled,
      children,
      type = "button",
      ...rest
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled ?? isLoading}
        className={`inline-flex min-h-10 min-w-[2.5rem] items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${variantClasses[variant]} ${className}`}
        {...rest}
      >
        {isLoading ? <Spinner /> : null}
        {children}
      </button>
    );
  },
);
