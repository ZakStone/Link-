import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export const apiFetch = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const token = await AsyncStorage.getItem("accessToken");
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers ?? {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error ?? "API error");
  }
  if (response.status === 204) {
    return {} as T;
  }
  return response.json() as Promise<T>;
};

export const setTokens = async (tokens: AuthTokens) => {
  await AsyncStorage.setItem("accessToken", tokens.accessToken);
  await AsyncStorage.setItem("refreshToken", tokens.refreshToken);
};

export const clearTokens = async () => {
  await AsyncStorage.multiRemove(["accessToken", "refreshToken"]);
};

export const getStoredRole = async () => AsyncStorage.getItem("role");
export const setStoredRole = async (role: string) => AsyncStorage.setItem("role", role);
