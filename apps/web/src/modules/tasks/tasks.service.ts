import { apiFetch } from "../../lib/api";
import type { Task, TaskPayload, TaskStatus } from "./tasks.types";

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

export async function listTasks(filters?: {
  status?: TaskStatus | "";
  customerId?: string;
}): Promise<Task[]> {
  const params = new URLSearchParams();

  if (filters?.status) {
    params.set("status", filters.status);
  }

  if (filters?.customerId) {
    params.set("customerId", filters.customerId);
  }

  const query = params.toString();
  const response = await apiFetch(`/tasks${query ? `?${query}` : ""}`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw await readError(response, "Não foi possível carregar as tarefas.");
  }

  const data = (await response.json()) as { items: Task[] };
  return data.items;
}

export async function createTask(payload: TaskPayload): Promise<Task> {
  const response = await apiFetch("/tasks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await readError(response, "Não foi possível criar a tarefa.");
  }

  const data = (await response.json()) as { task: Task };
  return data.task;
}

export async function updateTask(id: string, payload: TaskPayload): Promise<Task> {
  const response = await apiFetch(`/tasks/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await readError(response, "Não foi possível atualizar a tarefa.");
  }

  const data = (await response.json()) as { task: Task };
  return data.task;
}

export async function completeTask(id: string): Promise<Task> {
  const response = await apiFetch(`/tasks/${id}/complete`, {
    method: "PATCH",
    credentials: "include",
  });

  if (!response.ok) {
    throw await readError(response, "Não foi possível concluir a tarefa.");
  }

  const data = (await response.json()) as { task: Task };
  return data.task;
}
