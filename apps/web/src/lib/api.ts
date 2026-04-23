export const API_URL = import.meta.env.VITE_API_URL?.trim() || "http://localhost:3000";

export async function apiFetch(
  input: string,
  init?: RequestInit
): Promise<Response> {
  return fetch(`${API_URL}${input}`, init);
}
