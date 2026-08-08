import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getAllocationSummary,
  listExperts,
} from "@/lib/admin-api";

describe("admin-api", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("listExperts returns experts array", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        status: 200,
        json: async () => ({
          error: false,
          message: null,
          data: {
            experts: [{ _id: "1", name: "Expert One", email: "a@b.com" }],
          },
        }),
      }),
    );

    const experts = await listExperts("key");
    expect(experts).toHaveLength(1);
    expect(experts[0].name).toBe("Expert One");
  });

  it("getAllocationSummary passes stage query", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        status: 200,
        json: async () => ({
          error: false,
          message: null,
          data: {
            requestId: "req1",
            stage: "initial",
            attempts: [],
          },
        }),
      }),
    );

    const summary = await getAllocationSummary("key", "req1", "initial");
    expect(summary).toMatchObject({ stage: "initial" });
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("stage=initial"),
      expect.any(Object),
    );
  });
});
