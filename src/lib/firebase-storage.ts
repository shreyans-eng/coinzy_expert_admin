import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { getFirebaseStorage } from "@/lib/firebase";

export const EXPERT_AVATAR_MAX_BYTES = 5 * 1024 * 1024;
export const EXPERT_AVATAR_ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export function sanitizeStorageFileName(fileName: string): string {
  const base = fileName.trim().toLowerCase() || "avatar.jpg";
  return base.replace(/[^a-z0-9._-]+/g, "-").replace(/-+/g, "-");
}

export function buildExpertAvatarStoragePath(
  fileName: string,
  now = Date.now(),
): string {
  return `experts/avatars/${now}-${sanitizeStorageFileName(fileName)}`;
}

export function validateExpertAvatarFile(file: File): string | null {
  if (!ALLOWED_TYPES.has(file.type)) {
    return "Use a JPG, PNG, WEBP, or GIF image";
  }
  if (file.size > EXPERT_AVATAR_MAX_BYTES) {
    return "Image must be 5 MB or smaller";
  }
  return null;
}

export async function uploadExpertProfileImage(file: File): Promise<string> {
  const validationError = validateExpertAvatarFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const path = buildExpertAvatarStoragePath(file.name);
  const storageRef = ref(getFirebaseStorage(), path);
  await uploadBytes(storageRef, file, {
    contentType: file.type,
    cacheControl: "public,max-age=31536000",
  });
  return getDownloadURL(storageRef);
}
