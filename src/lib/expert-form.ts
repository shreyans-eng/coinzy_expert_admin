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

export function validateExpertProfileForm(
  form: ExpertProfileFormValues,
  options: { requirePassword: boolean },
): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!form.name.trim()) errors.name = "Name is required";
  if (!form.email.trim()) errors.email = "Email is required";
  if (!form.yearsOfXp.trim()) {
    errors.yearsOfXp = "Years of experience is required";
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
    yearsOfXp: form.yearsOfXp.trim(),
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
    yearsOfXp: form.yearsOfXp.trim(),
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
