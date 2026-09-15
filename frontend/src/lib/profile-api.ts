import type { AuthUser } from "./auth-api";
import { AuthApiError } from "./auth-api";

async function profileRequest<T>(accessToken: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch("/api/v1/profile/", {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}`, ...init.headers },
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new AuthApiError(payload && typeof payload.detail === "string" ? payload.detail : "Не удалось обновить профиль.");
  }
  return response.json() as Promise<T>;
}

export function getProfile(accessToken: string) {
  return profileRequest<AuthUser>(accessToken);
}

export function updateProfile(accessToken: string, name: string) {
  return profileRequest<AuthUser>(accessToken, { method: "PATCH", body: JSON.stringify({ name }) });
}

export async function uploadAvatar(accessToken: string, file: File): Promise<AuthUser> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch("/api/v1/profile/avatar", {
    method: "POST",
    body: formData,
    credentials: "include",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new AuthApiError(payload && typeof payload.detail === "string" ? payload.detail : "Не удалось загрузить аватар.");
  }
  return response.json() as Promise<AuthUser>;
}
