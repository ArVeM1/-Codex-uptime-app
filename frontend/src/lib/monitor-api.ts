import type { AxiosRequestConfig } from "axios";
import { apiRequest } from "./api-client";
import { AuthApiError } from "./auth-api";

export type IntervalUnit = "seconds" | "minutes" | "hours";
export type Monitor = { id: string; url: string; interval_value: number; interval_unit: IntervalUnit };

async function monitorRequest<T>(config: AxiosRequestConfig): Promise<T> {
  try {
    return await apiRequest<T>(config, "Не удалось выполнить запрос.");
  } catch (error) {
    throw new AuthApiError(error instanceof Error ? error.message : "Не удалось выполнить запрос.");
  }
}

export function getMonitors(signal?: AbortSignal) {
  return monitorRequest<Monitor[]>({ method: "GET", url: "/monitors", signal });
}

export function createMonitor(input: Omit<Monitor, "id">) {
  return monitorRequest<Monitor>({ method: "POST", url: "/monitors", data: input });
}
