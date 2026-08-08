import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  loading?: boolean;
};

/** Matches coinzy-experts-webapp PrimaryButton + panel action styles */
const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white shadow-sm hover:bg-primary-hover active:bg-primary-active disabled:pointer-events-none disabled:opacity-50",
  secondary:
    "border border-primary bg-transparent text-primary hover:bg-primary/5 disabled:pointer-events-none disabled:opacity-50",
  danger:
    "bg-expert-error text-white shadow-sm hover:bg-expert-error/90 disabled:pointer-events-none disabled:opacity-50",
  ghost:
    "bg-transparent text-text-muted hover:bg-input-bg hover:text-text disabled:pointer-events-none disabled:opacity-50",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 min-h-8 rounded-lg px-3 text-xs font-semibold",
  md: "h-10 min-h-10 rounded-lg px-5 text-sm font-semibold",
  lg: "rounded-full px-4 py-3 text-sm font-semibold",
};

export function Button({
  variant = "primary",
  size = "md",
  children,
  loading,
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 transition-colors ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : null}
      {children}
    </button>
  );
}
