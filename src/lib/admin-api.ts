import { adminFetch } from "@/lib/api-client";
import type {
  AllocationStage,
  AllocationSummaryByStage,
  AllocationSummaryForStage,
  CreateExpertBody,
  CreateUserRequestBody,
  CreditAdjustBody,
  Expert,
  ExpertStatus,
  UpdateExpertBody,
  User,
} from "@/types/admin-api";

function withKey(adminKey: string) {
  return { adminKey };
}

export async function listExperts(adminKey: string) {
  const res = await adminFetch<{ experts: Expert[] }>(
    "/admin/experts",
    { method: "GET", ...withKey(adminKey) },
  );
  return res.data.experts;
}

export async function getExpert(adminKey: string, id: string) {
  const res = await adminFetch<{ expert: Expert }>(
    `/admin/experts/${id}`,
    { method: "GET", ...withKey(adminKey) },
  );
  return res.data.expert;
}

export async function createExpert(adminKey: string, body: CreateExpertBody) {
  const res = await adminFetch<{ expert: Expert }>(
    "/admin/experts",
    {
      method: "POST",
      body: JSON.stringify(body),
      ...withKey(adminKey),
    },
  );
  return res.data.expert;
}

export async function updateExpert(
  adminKey: string,
  id: string,
  body: UpdateExpertBody,
) {
  const res = await adminFetch<{ expert: Expert }>(
    `/admin/experts/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(body),
      ...withKey(adminKey),
    },
  );
  return res.data.expert;
}

export async function updateExpertStatus(
  adminKey: string,
  id: string,
  status: ExpertStatus,
) {
  const res = await adminFetch<{ expert: Expert }>(
    `/admin/experts/${id}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
      ...withKey(adminKey),
    },
  );
  return res.data.expert;
}

export async function listUsers(adminKey: string, email?: string) {
  const query = email?.trim() ? `?email=${encodeURIComponent(email.trim())}` : "";
  const res = await adminFetch<{ users: User[] }>(
    `/admin/users${query}`,
    { method: "GET", ...withKey(adminKey) },
  );
  return res.data.users;
}

export async function adjustUserCredits(
  adminKey: string,
  userId: string,
  body: CreditAdjustBody,
) {
  const res = await adminFetch<{ creditBalance: number; ledger: unknown }>(
    `/admin/users/${userId}/credits/adjust`,
    {
      method: "POST",
      body: JSON.stringify(body),
      ...withKey(adminKey),
    },
  );
  return res.data;
}

export async function createUserRequest(
  adminKey: string,
  userId: string,
  body: CreateUserRequestBody,
) {
  const res = await adminFetch<{ request: unknown; user: User }>(
    `/admin/users/${userId}/requests`,
    {
      method: "POST",
      body: JSON.stringify(body),
      ...withKey(adminKey),
    },
  );
  return res.data;
}

export async function getAllocationSummary(
  adminKey: string,
  requestId: string,
  stage?: AllocationStage,
) {
  const query = stage ? `?stage=${stage}` : "";
  const res = await adminFetch<
    AllocationSummaryByStage | AllocationSummaryForStage
  >(
    `/admin/requests/${requestId}/allocation-summary${query}`,
    { method: "GET", ...withKey(adminKey) },
  );
  return res.data;
}
