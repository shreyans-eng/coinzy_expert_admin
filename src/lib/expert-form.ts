import type { CreateExpertBody, UpdateExpertBody } from "@/types/admin-api";

/** Backend rejects empty/null optional profile strings — omit them instead. */
export function optionalProfileString(
  value: string | null | undefined,
): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export type ExpertProfileFormValues = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  supportedCountries: string;
  profilePicture: string;
  oneLineDescription: string;
  yearsOfXp: string;
  expertise: string;
};

export function parseSupportedCountries(raw: string): string[] {
  return raw
    .split(",")
    .map((c) => c.trim().toUpperCase())
    .filter(Boolean);
}

/** Split expertise chips from a stored comma-separated string. */
export function parseExpertiseChips(raw: string): string[] {
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

/** Join expertise chips for API payload, e.g. "a, b". */
export function serializeExpertiseChips(chips: string[]): string {
  return chips
    .map((item) => item.trim())
    .filter(Boolean)
    .join(", ");
}

/**
 * Normalize years input for the API.
 * Typing `12` becomes `12 years`; `12 years` / `12 year` stay normalized.
 */
export function normalizeYearsOfXp(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";

  const match = trimmed.match(/^(\d+(?:\.\d+)?)\s*(years?)?$/i);
  if (!match) return "";

  return `${match[1]} years`;
}

/** Show a bare number in the form when stored value is like "12 years". */
export function yearsOfXpInputValue(
  stored: string | null | undefined,
): string {
  if (!stored) return "";
  const match = stored.trim().match(/^(\d+(?:\.\d+)?)\s*years?$/i);
  return match ? match[1] : stored.trim();
}

export function validateExpertProfileForm(
  form: ExpertProfileFormValues,
  options: { requirePassword: boolean },
): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!form.name.trim()) errors.name = "Name is required";
  if (!form.email.trim()) errors.email = "Email is required";
  if (!normalizeYearsOfXp(form.yearsOfXp)) {
    errors.yearsOfXp = "Enter years of experience as a number (e.g. 12)";
  }
  if (parseExpertiseChips(form.expertise).length === 0) {
    errors.expertise = "Expertise is required";
  }

  const password = form.password;
  const confirmPassword = form.confirmPassword;
  const passwordProvided = Boolean(password.trim());
  const confirmProvided = Boolean(confirmPassword.trim());

  if (options.requirePassword) {
    if (!passwordProvided) errors.password = "Password is required";
    if (!confirmProvided) {
      errors.confirmPassword = "Confirm password is required";
    }
  } else if (passwordProvided || confirmProvided) {
    if (!passwordProvided) errors.password = "Password is required";
    if (!confirmProvided) {
      errors.confirmPassword = "Confirm password is required";
    }
  }

  if (
    passwordProvided &&
    confirmProvided &&
    password !== confirmPassword &&
    !errors.password &&
    !errors.confirmPassword
  ) {
    errors.confirmPassword = "Passwords do not match";
  }

  return errors;
}

export function buildCreateExpertBody(
  form: ExpertProfileFormValues,
): CreateExpertBody {
  const body: CreateExpertBody = {
    name: form.name.trim(),
    email: form.email.trim(),
    password: form.password,
    supportedCountries: parseSupportedCountries(form.supportedCountries),
    yearsOfXp: normalizeYearsOfXp(form.yearsOfXp),
    expertise: serializeExpertiseChips(parseExpertiseChips(form.expertise)),
  };

  const profilePicture = optionalProfileString(form.profilePicture);
  if (profilePicture) body.profilePicture = profilePicture;

  const oneLineDescription = optionalProfileString(form.oneLineDescription);
  if (oneLineDescription) body.oneLineDescription = oneLineDescription;

  return body;
}

export function buildUpdateExpertBody(
  form: ExpertProfileFormValues,
): UpdateExpertBody {
  const body: UpdateExpertBody = {
    name: form.name.trim(),
    email: form.email.trim(),
    supportedCountries: parseSupportedCountries(form.supportedCountries),
    yearsOfXp: normalizeYearsOfXp(form.yearsOfXp),
    expertise: serializeExpertiseChips(parseExpertiseChips(form.expertise)),
  };

  if (form.password.trim()) {
    body.password = form.password;
  }

  const profilePicture = optionalProfileString(form.profilePicture);
  if (profilePicture) body.profilePicture = profilePicture;

  const oneLineDescription = optionalProfileString(form.oneLineDescription);
  if (oneLineDescription) body.oneLineDescription = oneLineDescription;

  return body;
}

/** Internal experts cannot be suspended or blocked (backend returns 409). */
export function canSetExpertStatus(
  isInternal: boolean,
  nextStatus: "active" | "suspended" | "blocked",
): boolean {
  if (!isInternal) return true;
  return nextStatus === "active";
}
