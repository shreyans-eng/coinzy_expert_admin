import type { ReactNode } from "react";

type FormActionFieldProps = {
  children: ReactNode;
  label?: string;
};

/** Aligns a button with labeled Input/Select fields in the same form row. */
export function FormActionField({
  children,
  label = "\u00A0",
}: FormActionFieldProps) {
  const isSpacerLabel = label === "\u00A0";

  return (
    <div className="flex flex-col gap-1.5">
      <span
        className={`text-sm font-medium ${isSpacerLabel ? "invisible select-none" : "text-text"}`}
        aria-hidden={isSpacerLabel}
      >
        {label}
      </span>
      {children}
      <span className="min-h-[1.125rem]" aria-hidden />
    </div>
  );
}
