import { apiFetch } from "../../lib/api";
import type { AuthResponse } from "./auth.types";

type ApiErrorPayload = {
  message?: string;
};

async function parseApiError(response: Response, fallbackMessage: string): Promise<Error> {
  let payload: ApiErrorPayload | null = null;

  try {
    payload = (await response.json()) as ApiErrorPayload;
  } catch {
    payload = null;
  }

  return new Error(payload?.message || fallbackMessage);
}

export async function loginRequest(email: string, password: string): Promise<AuthResponse> {
  const response = await apiFetch("/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw await parseApiError(response, "Não foi possível entrar no CRM.");
  }

  return (await response.json()) as AuthResponse;
}

export async function getCurrentSession(): Promise<AuthResponse | null> {
  const response = await apiFetch("/auth/me", {
    method: "GET",
    credentials: "include",
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw await parseApiError(response, "Não foi possível carregar a sessão atual.");
  }

  return (await response.json()) as AuthResponse;
}

export async function logoutRequest(): Promise<void> {
  const response = await apiFetch("/auth/logout", {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    throw await parseApiError(response, "Não foi possível encerrar a sessão.");
  }
}
