import { useEffect, useState } from "react";
import { AppLayout } from "../components/app-layout";
import { TaskForm } from "../components/task-form";
import { listCustomers } from "../modules/customers/customers.service";
import type { Customer } from "../modules/customers/customers.types";
import {
  completeTask,
  createTask,
  listTasks,
  updateTask,
} from "../modules/tasks/tasks.service";
import type { Task, TaskPayload, TaskStatus } from "../modules/tasks/tasks.types";

const statusLabels: Record<TaskStatus, string> = {
  pending: "Pendente",
  in_progress: "Em andamento",
  completed: "Concluída",
};

const priorityLabels = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
} as const;

function formatDate(value: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "">("");
  const [customerFilter, setCustomerFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  async function loadPage(nextStatus = statusFilter, nextCustomerId = customerFilter) {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const [tasksData, customersData] = await Promise.all([
        listTasks({ status: nextStatus, customerId: nextCustomerId }),
        listCustomers(),
      ]);

      setTasks(tasksData);
      setCustomers(customersData);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Não foi possível carregar as tarefas."
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadPage("", "");
  }, []);

  async function handleSaveTask(payload: TaskPayload) {
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      if (editingTask) {
        await updateTask(editingTask.id, payload);
      } else {
        await createTask(payload);
      }

      setEditingTask(null);
      setIsFormOpen(false);
      await loadPage();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Não foi possível salvar a tarefa."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCompleteTask(taskId: string) {
    try {
      await completeTask(taskId);
      await loadPage();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Não foi possível concluir a tarefa."
      );
    }
  }

  return (
    <AppLayout
      title="Tarefas"
      description="Organize pendências operacionais e conclua o que já foi executado."
      actions={
        <button
          type="button"
          className="primary-button"
          onClick={() => {
            setEditingTask(null);
            setIsFormOpen(true);
          }}
        >
          Nova tarefa
        </button>
      }
    >
      <section className="stack">
        <section className="panel filters-row">
          <label className="field">
            <span>Status</span>
            <select
              value={statusFilter}
              onChange={async (event) => {
                const nextValue = event.target.value as TaskStatus | "";
                setStatusFilter(nextValue);
                await loadPage(nextValue, customerFilter);
              }}
            >
              <option value="">Todos</option>
              <option value="pending">Pendente</option>
              <option value="in_progress">Em andamento</option>
              <option value="completed">Concluída</option>
            </select>
          </label>

          <label className="field">
            <span>Cliente</span>
            <select
              value={customerFilter}
              onChange={async (event) => {
                const nextValue = event.target.value;
                setCustomerFilter(nextValue);
                await loadPage(statusFilter, nextValue);
              }}
            >
              <option value="">Todos</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </label>
        </section>

        {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

        {isFormOpen ? (
          <TaskForm
            customers={customers}
            initialData={editingTask}
            isSubmitting={isSubmitting}
            onSubmit={handleSaveTask}
            onCancel={() => {
              setEditingTask(null);
              setIsFormOpen(false);
            }}
          />
        ) : null}

        <section className="panel">
          {isLoading ? (
            <p>Carregando tarefas...</p>
          ) : tasks.length === 0 ? (
            <p>Nenhuma tarefa encontrada.</p>
          ) : (
            <div className="list-grid">
              {tasks.map((task) => (
                <article
                  key={task.id}
                  className={`list-card ${
                    task.status === "completed"
                      ? "list-card-success"
                      : task.status === "in_progress"
                        ? "list-card-info"
                        : "list-card-warning"
                  }`}
                >
                  <div className="timeline-head">
                    <h3>{task.title}</h3>
                    <span className={`status-badge status-badge-${task.status.replace("_", "-")}`}>
                      {statusLabels[task.status]}
                    </span>
                  </div>

                  <p>{task.description || "Sem descrição."}</p>

                  <dl className="meta-list">
                    <div>
                      <dt>Cliente</dt>
                      <dd>{task.customerName || "-"}</dd>
                    </div>
                    <div>
                      <dt>Prioridade</dt>
                      <dd>{priorityLabels[task.priority]}</dd>
                    </div>
                    <div>
                      <dt>Prazo</dt>
                      <dd>{formatDate(task.dueAt)}</dd>
                    </div>
                  </dl>

                  <div className="inline-actions">
                    <button
                      type="button"
                      className="ghost-button"
                      onClick={() => {
                        setEditingTask(task);
                        setIsFormOpen(true);
                      }}
                    >
                      Editar
                    </button>
                    {task.status !== "completed" ? (
                      <button
                        type="button"
                        className="primary-button"
                        onClick={() => void handleCompleteTask(task.id)}
                      >
                        Concluir
                      </button>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </AppLayout>
  );
}
