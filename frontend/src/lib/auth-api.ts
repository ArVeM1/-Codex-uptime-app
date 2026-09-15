export type AuthUser = { id: string; email: string; name: string; avatar_url: string | null };
export type AuthResponse = { access_token: string; token_type: "bearer"; user: AuthUser };
export type RegistrationInput = { email: string; name: string; password: string };
export type LoginInput = { email: string; password: string };

export class AuthApiError extends Error {}

async function authRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api/v1/auth${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...init.headers },
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new AuthApiError(payload && typeof payload.detail === "string" ? payload.detail : "Не удалось выполнить запрос.");
  }
  return response.json() as Promise<T>;
}

export function register(input: RegistrationInput) {
  return authRequest<AuthResponse>("/register", { method: "POST", body: JSON.stringify(input) });
}

export function login(input: LoginInput) {
  return authRequest<AuthResponse>("/login", { method: "POST", body: JSON.stringify(input) });
}

export function refresh() {
  return authRequest<AuthResponse>("/refresh", { method: "POST" });
}

export async function logout(): Promise<void> {
  const response = await fetch("/api/v1/auth/logout", { method: "POST", credentials: "include" });
  if (!response.ok) throw new AuthApiError("Не удалось завершить сессию.");
}
