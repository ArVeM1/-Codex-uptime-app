import axios, { type AxiosError, type AxiosRequestConfig } from "axios";

let accessToken: string | null = null;

export const apiClient = axios.create({
  baseURL: "/api/v1",
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

export function setAccessToken(token: string | null) {
  accessToken = token;
}

function getApiErrorMessage(error: unknown, fallback: string): string {
  const responseData = (error as AxiosError<{ detail?: unknown }>).response?.data;
  return responseData && typeof responseData.detail === "string" ? responseData.detail : fallback;
}

export async function apiRequest<T>(config: AxiosRequestConfig, fallback: string): Promise<T> {
  try {
    const response = await apiClient.request<T>(config);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, fallback));
  }
}
