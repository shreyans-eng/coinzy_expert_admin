import { describe, expect, it } from "vitest";
import {
  buildExpertAvatarStoragePath,
  sanitizeStorageFileName,
  validateExpertAvatarFile,
} from "@/lib/firebase-storage";

describe("firebase-storage helpers", () => {
  it("sanitizes file names for storage paths", () => {
    expect(sanitizeStorageFileName("My Photo (1).JPG")).toBe("my-photo-1-.jpg");
  });

  it("builds expert avatar paths under experts/avatars", () => {
    expect(buildExpertAvatarStoragePath("avatar.png", 1700000000000)).toBe(
      "experts/avatars/1700000000000-avatar.png",
    );
  });

  it("validates image type and size", () => {
    const ok = new File(["x"], "a.jpg", { type: "image/jpeg" });
    expect(validateExpertAvatarFile(ok)).toBeNull();

    const badType = new File(["x"], "a.pdf", { type: "application/pdf" });
    expect(validateExpertAvatarFile(badType)).toMatch(/JPG/);

    const big = new File([new Uint8Array(6 * 1024 * 1024)], "big.jpg", {
      type: "image/jpeg",
    });
    expect(validateExpertAvatarFile(big)).toMatch(/5 MB/);
  });
});
