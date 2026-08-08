import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  hint?: string;
  /** Reserve hint row height so fields align in multi-column forms */
  reserveHintSpace?: boolean;
};

export function Input({
  label,
  error,
  hint,
  reserveHintSpace = false,
  id,
  className = "",
  ...props
}: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-text"
        >
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        className={`h-10 w-full rounded-lg border bg-input-bg px-3 py-2 text-sm text-text outline-none transition-colors placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 ${
          error ? "border-danger" : "border-input-border"
        } ${className}`}
        {...props}
      />
      {error || hint || reserveHintSpace ? (
        <p
          className={`min-h-[1.125rem] text-xs ${
            error ? "text-danger" : hint ? "text-text-muted" : "invisible"
          }`}
        >
          {error ?? hint ?? "\u00A0"}
        </p>
      ) : null}
    </div>
  );
}
