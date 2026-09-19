import { apiRequest, setAccessToken } from "./api-client";

export type AuthUser = { id: string; email: string; name: string; avatar_url: string | null };
export type AuthResponse = { access_token: string; token_type: "bearer"; user: AuthUser };
export type RegistrationInput = { email: string; name: string; password: string };
export type LoginInput = { email: string; password: string };

export class AuthApiError extends Error {}

async function authRequest<T>(path: string, data?: unknown): Promise<T> {
  try {
    return await apiRequest<T>({ method: "POST", url: `/auth${path}`, data }, "Не удалось выполнить запрос.");
  } catch (error) {
    throw new AuthApiError(error instanceof Error ? error.message : "Не удалось выполнить запрос.");
  }
}

export function register(input: RegistrationInput) {
  return authRequest<AuthResponse>("/register", input);
}

export function login(input: LoginInput) {
  return authRequest<AuthResponse>("/login", input);
}

export function refresh() {
  return authRequest<AuthResponse>("/refresh");
}

export async function logout(): Promise<void> {
  try {
    await apiRequest<void>({ method: "POST", url: "/auth/logout" }, "Не удалось завершить сессию.");
    setAccessToken(null);
  } catch (error) {
    throw new AuthApiError(error instanceof Error ? error.message : "Не удалось завершить сессию.");
  }
}
