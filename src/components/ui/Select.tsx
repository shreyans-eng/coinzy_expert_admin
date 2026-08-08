import type { SelectHTMLAttributes } from "react";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
  hint?: string;
  reserveHintSpace?: boolean;
  options: { value: string; label: string }[];
};

export function Select({
  label,
  error,
  hint,
  reserveHintSpace = false,
  options,
  id,
  className = "",
  ...props
}: SelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label htmlFor={selectId} className="text-sm font-medium text-text">
          {label}
        </label>
      ) : null}
      <select
        id={selectId}
        className={`h-10 w-full rounded-lg border bg-input-bg px-3 py-2 text-sm text-text outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 ${
          error ? "border-danger" : "border-input-border"
        } ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
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
