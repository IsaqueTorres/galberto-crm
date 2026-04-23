import { apiFetch } from "../../lib/api";
import type { Customer, CustomerPayload } from "./customers.types";

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

export async function listCustomers(search?: string): Promise<Customer[]> {
  const params = new URLSearchParams();

  if (search?.trim()) {
    params.set("search", search.trim());
  }

  const query = params.toString();
  const response = await apiFetch(`/customers${query ? `?${query}` : ""}`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw await readError(response, "Não foi possível carregar os clientes.");
  }

  const data = (await response.json()) as { items: Customer[] };
  return data.items;
}

export async function getCustomer(id: string): Promise<Customer> {
  const response = await apiFetch(`/customers/${id}`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw await readError(response, "Não foi possível carregar o cliente.");
  }

  const data = (await response.json()) as { customer: Customer };
  return data.customer;
}

export async function createCustomer(payload: CustomerPayload): Promise<Customer> {
  const response = await apiFetch("/customers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await readError(response, "Não foi possível criar o cliente.");
  }

  const data = (await response.json()) as { customer: Customer };
  return data.customer;
}

export async function updateCustomer(
  id: string,
  payload: CustomerPayload
): Promise<Customer> {
  const response = await apiFetch(`/customers/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await readError(response, "Não foi possível atualizar o cliente.");
  }

  const data = (await response.json()) as { customer: Customer };
  return data.customer;
}

export async function deleteCustomer(id: string): Promise<void> {
  const response = await apiFetch(`/customers/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    throw await readError(response, "Não foi possível excluir o cliente.");
  }
}
