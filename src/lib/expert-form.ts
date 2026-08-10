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

export function validateExpertProfileForm(
  form: ExpertProfileFormValues,
  options: { requirePassword: boolean },
): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!form.name.trim()) errors.name = "Name is required";
  if (!form.email.trim()) errors.email = "Email is required";
  if (options.requirePassword && !form.password.trim()) {
    errors.password = "Password is required";
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
  };

  const profilePicture = optionalProfileString(form.profilePicture);
  if (profilePicture) body.profilePicture = profilePicture;

  const oneLineDescription = optionalProfileString(form.oneLineDescription);
  if (oneLineDescription) body.oneLineDescription = oneLineDescription;

  const yearsOfXp = optionalProfileString(form.yearsOfXp);
  if (yearsOfXp) body.yearsOfXp = yearsOfXp;

  const expertise = optionalProfileString(form.expertise);
  if (expertise) body.expertise = expertise;

  return body;
}

export function buildUpdateExpertBody(
  form: ExpertProfileFormValues,
): UpdateExpertBody {
  const body: UpdateExpertBody = {
    name: form.name.trim(),
    email: form.email.trim(),
    supportedCountries: parseSupportedCountries(form.supportedCountries),
  };

  if (form.password.trim()) {
    body.password = form.password;
  }

  const profilePicture = optionalProfileString(form.profilePicture);
  if (profilePicture) body.profilePicture = profilePicture;

  const oneLineDescription = optionalProfileString(form.oneLineDescription);
  if (oneLineDescription) body.oneLineDescription = oneLineDescription;

  const yearsOfXp = optionalProfileString(form.yearsOfXp);
  if (yearsOfXp) body.yearsOfXp = yearsOfXp;

  const expertise = optionalProfileString(form.expertise);
  if (expertise) body.expertise = expertise;

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
