import { describe, expect, it } from "vitest";
import { paginateSlice } from "@/lib/pagination";

describe("paginateSlice", () => {
  const items = Array.from({ length: 45 }, (_, i) => i + 1);

  it("returns the first page", () => {
    const result = paginateSlice(items, 1, 20);
    expect(result.items).toHaveLength(20);
    expect(result.items[0]).toBe(1);
    expect(result.pagination).toMatchObject({
      page: 1,
      limit: 20,
      total: 45,
      totalPages: 3,
    });
  });

  it("returns the last partial page", () => {
    const result = paginateSlice(items, 3, 20);
    expect(result.items).toHaveLength(5);
    expect(result.items[0]).toBe(41);
  });

  it("clamps page when out of range", () => {
    const result = paginateSlice(items, 99, 20);
    expect(result.pagination.page).toBe(3);
    expect(result.items).toHaveLength(5);
  });
});
