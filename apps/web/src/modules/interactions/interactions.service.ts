import { apiFetch } from "../../lib/api";
import type { Interaction, InteractionPayload } from "./interactions.types";

type ErrorPayload = {
  message?: string;
};

async function readError(response: Response, fallbackMessage: string) {
  try {
    const payload = (await response.json()) as ErrorPayload;
    return new Error(payload.message || fallbackMessage);
  } catch {
    return new Error(fallbackMessage);
  }
}

export async function listInteractions(customerId: string): Promise<Interaction[]> {
  const response = await apiFetch(`/customers/${customerId}/interactions`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw await readError(response, "Não foi possível carregar as interações.");
  }

  const data = (await response.json()) as { items: Interaction[] };
  return data.items;
}

export async function createInteraction(
  customerId: string,
  payload: InteractionPayload
): Promise<Interaction> {
  const response = await apiFetch(`/customers/${customerId}/interactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await readError(response, "Não foi possível registrar a interação.");
  }

  const data = (await response.json()) as { interaction: Interaction };
  return data.interaction;
}
