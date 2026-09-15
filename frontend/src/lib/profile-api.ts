import type { AxiosRequestConfig } from "axios";
import { apiRequest } from "./api-client";
import type { AuthUser } from "./auth-api";
import { AuthApiError } from "./auth-api";

async function profileRequest<T>(config: AxiosRequestConfig, fallback: string): Promise<T> {
  try {
    return await apiRequest<T>(config, fallback);
  } catch (error) {
    throw new AuthApiError(error instanceof Error ? error.message : fallback);
  }
}

export function getProfile() {
  return profileRequest<AuthUser>({ method: "GET", url: "/profile/" }, "Не удалось обновить профиль.");
}

export function updateProfile(name: string) {
  return profileRequest<AuthUser>({ method: "PATCH", url: "/profile/", data: { name } }, "Не удалось обновить профиль.");
}

export function uploadAvatar(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return profileRequest<AuthUser>({ method: "POST", url: "/profile/avatar", data: formData, headers: { "Content-Type": "multipart/form-data" } }, "Не удалось загрузить аватар.");
}
