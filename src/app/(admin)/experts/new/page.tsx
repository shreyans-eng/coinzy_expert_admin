"use client";

import { useAdminKey } from "@/components/layout/AdminAuthGuard";
import { Button } from "@/components/ui/Button";
import { Card, PageHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/Toast";
import { createExpert } from "@/lib/admin-api";
import { useApiHandler } from "@/lib/useApiHandler";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewExpertPage() {
  const adminKey = useAdminKey();
  const router = useRouter();
  const handleApiError = useApiHandler();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    supportedCountries: "",
    profilePicture: "",
    oneLineDescription: "",
  });

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "Name is required";
    if (!form.email.trim()) next.email = "Email is required";
    if (!form.password.trim()) next.password = "Password is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const countries = form.supportedCountries
        .split(",")
        .map((c) => c.trim().toUpperCase())
        .filter(Boolean);

      const expert = await createExpert(adminKey, {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        supportedCountries: countries,
        ...(form.profilePicture.trim()
          ? { profilePicture: form.profilePicture.trim() }
          : {}),
        ...(form.oneLineDescription.trim()
          ? { oneLineDescription: form.oneLineDescription.trim() }
          : {}),
      });

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
            label="Profile picture URL"
            type="url"
            value={form.profilePicture}
            onChange={(e) =>
              setForm({ ...form, profilePicture: e.target.value })
            }
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
