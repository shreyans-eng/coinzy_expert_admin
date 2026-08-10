"use client";

import { useAdminKey } from "@/components/layout/AdminAuthGuard";
import { Button } from "@/components/ui/Button";
import { Card, PageHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/Toast";
import { createExpert } from "@/lib/admin-api";
import {
  buildCreateExpertBody,
  validateExpertProfileForm,
  type ExpertProfileFormValues,
} from "@/lib/expert-form";
import { useApiHandler } from "@/lib/useApiHandler";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const EMPTY_FORM: ExpertProfileFormValues = {
  name: "",
  email: "",
  password: "",
  supportedCountries: "",
  profilePicture: "",
  oneLineDescription: "",
  yearsOfXp: "",
  expertise: "",
};

export default function NewExpertPage() {
  const adminKey = useAdminKey();
  const router = useRouter();
  const handleApiError = useApiHandler();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<ExpertProfileFormValues>(EMPTY_FORM);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors = validateExpertProfileForm(form, {
      requirePassword: true,
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    try {
      const expert = await createExpert(adminKey, buildCreateExpertBody(form));
      showToast("Expert created", "success");
      router.push(`/experts/${expert._id}`);
    } catch (err) {
      handleApiError(err, (msg) => showToast(msg, "error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Create expert"
        description="Add a new expert account to the platform."
        action={
          <Link href="/experts">
            <Button variant="secondary">Back to list</Button>
          </Link>
        }
      />

      <Card title="Expert details">
        <form onSubmit={handleSubmit} className="mx-auto max-w-xl space-y-4">
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            error={errors.name}
            required
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            error={errors.email}
            required
          />
          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            error={errors.password}
            required
          />
          <Input
            label="Supported countries"
            value={form.supportedCountries}
            onChange={(e) =>
              setForm({ ...form, supportedCountries: e.target.value })
            }
            hint="Comma-separated ISO codes (e.g. IN, GB). Leave empty for all countries."
            placeholder="IN, GB"
          />
          <Input
            label="Years of experience"
            value={form.yearsOfXp}
            onChange={(e) => setForm({ ...form, yearsOfXp: e.target.value })}
            placeholder="12 years"
          />
          <Input
            label="Expertise"
            value={form.expertise}
            onChange={(e) => setForm({ ...form, expertise: e.target.value })}
            placeholder="Ancient coins"
          />
          <Input
            label="Profile picture URL"
            type="url"
            value={form.profilePicture}
            onChange={(e) =>
              setForm({ ...form, profilePicture: e.target.value })
            }
            hint="Optional HTTPS URL"
            placeholder="https://..."
          />
          <Textarea
            label="One-line description"
            value={form.oneLineDescription}
            onChange={(e) =>
              setForm({ ...form, oneLineDescription: e.target.value })
            }
            rows={2}
          />

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Link href="/experts">
              <Button variant="secondary" className="w-full sm:w-auto">
                Cancel
              </Button>
            </Link>
            <Button type="submit" loading={loading} className="w-full sm:w-auto">
              Create expert
            </Button>
          </div>
        </form>
      </Card>
    </>
  );
}
