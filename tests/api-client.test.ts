import { afterEach, describe, expect, it, vi } from "vitest";
import { adminFetch, AdminApiError } from "@/lib/api-client";

describe("adminFetch", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns data on successful response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        status: 200,
        json: async () => ({
          error: false,
          message: null,
          data: { experts: [] },
        }),
      }),
    );

    const result = await adminFetch<{ experts: unknown[] }>("/admin/experts", {
      method: "GET",
      adminKey: "test-key",
    });

    expect(result.data.experts).toEqual([]);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/admin/experts"),
      expect.objectContaining({
        headers: expect.objectContaining({
          "x-admin-key": "test-key",
        }),
      }),
    );
  });

  it("throws AdminApiError on 401", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        status: 401,
        json: async () => ({
          error: true,
          message: "Invalid admin key",
          data: {},
        }),
      }),
    );

    await expect(
      adminFetch("/admin/experts", { method: "GET", adminKey: "bad" }),
    ).rejects.toThrow(AdminApiError);
  });

  it("throws on error envelope", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        status: 400,
        json: async () => ({
          error: true,
          message: "Invalid amount",
          data: {},
        }),
      }),
    );

    await expect(
      adminFetch("/admin/users/x/credits/adjust", {
        method: "POST",
        adminKey: "key",
        body: JSON.stringify({ amount: 0, reason: "test" }),
      }),
    ).rejects.toThrow("Invalid amount");
  });
});
