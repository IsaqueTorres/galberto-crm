import type { FormEvent } from "react";
import { useState } from "react";
import type { Customer } from "../modules/customers/customers.types";
import type { Task, TaskPayload, TaskPriority, TaskStatus } from "../modules/tasks/tasks.types";

type TaskFormProps = {
  customers: Customer[];
  initialData?: Task | null;
  isSubmitting?: boolean;
  onSubmit: (payload: TaskPayload) => Promise<void>;
  onCancel?: () => void;
};

const statusOptions: Array<{ value: TaskStatus; label: string }> = [
  { value: "pending", label: "Pendente" },
  { value: "in_progress", label: "Em andamento" },
  { value: "completed", label: "Concluída" },
];

const priorityOptions: Array<{ value: TaskPriority; label: string }> = [
  { value: "low", label: "Baixa" },
  { value: "medium", label: "Média" },
  { value: "high", label: "Alta" },
];

function toDatetimeLocal(value?: string | null) {
  if (!value) {
    return "";
  }

  return new Date(value).toISOString().slice(0, 16);
}

export function TaskForm({
  customers,
  initialData,
  isSubmitting = false,
  onSubmit,
  onCancel,
}: TaskFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [status, setStatus] = useState<TaskStatus>(initialData?.status ?? "pending");
  const [priority, setPriority] = useState<TaskPriority>(initialData?.priority ?? "medium");
  const [customerId, setCustomerId] = useState(initialData?.customerId ?? "");
  const [dueAt, setDueAt] = useState(toDatetimeLocal(initialData?.dueAt));

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await onSubmit({
      title,
      description,
      status,
      priority,
      customerId,
      dueAt: dueAt ? new Date(dueAt).toISOString() : "",
    });
  }

  return (
    <form className="panel form-grid" onSubmit={handleSubmit}>
      <div className="grid-two">
        <label className="field">
          <span>Título</span>
          <input value={title} onChange={(event) => setTitle(event.target.value)} required />
        </label>
        <label className="field">
          <span>Cliente</span>
          <select value={customerId} onChange={(event) => setCustomerId(event.target.value)}>
            <option value="">Sem cliente vinculado</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid-two">
        <label className="field">
          <span>Status</span>
          <select value={status} onChange={(event) => setStatus(event.target.value as TaskStatus)}>
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Prioridade</span>
          <select
            value={priority}
            onChange={(event) => setPriority(event.target.value as TaskPriority)}
          >
            {priorityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid-two">
        <label className="field">
          <span>Prazo</span>
          <input
            type="datetime-local"
            value={dueAt}
            onChange={(event) => setDueAt(event.target.value)}
          />
        </label>
      </div>

      <label className="field">
        <span>Descrição</span>
        <textarea
          className="textarea"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={4}
        />
      </label>

      <div className="form-actions">
        {onCancel ? (
          <button type="button" className="ghost-button" onClick={onCancel}>
            Cancelar
          </button>
        ) : null}
        <button type="submit" className="primary-button" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : initialData ? "Salvar tarefa" : "Criar tarefa"}
        </button>
      </div>
    </form>
  );
}
