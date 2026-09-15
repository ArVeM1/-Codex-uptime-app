import { AuthApiError } from "./auth-api";

export type IntervalUnit = "seconds" | "minutes" | "hours";
export type Monitor = { id: string; url: string; interval_value: number; interval_unit: IntervalUnit };

async function monitorRequest<T>(accessToken: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch("/api/v1/monitors", {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}`, ...init.headers },
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new AuthApiError(payload && typeof payload.detail === "string" ? payload.detail : "Не удалось выполнить запрос.");
  }
  return response.json() as Promise<T>;
}

export function getMonitors(accessToken: string) { return monitorRequest<Monitor[]>(accessToken); }
export function createMonitor(accessToken: string, input: Omit<Monitor, "id">) {
  return monitorRequest<Monitor>(accessToken, { method: "POST", body: JSON.stringify(input) });
}
