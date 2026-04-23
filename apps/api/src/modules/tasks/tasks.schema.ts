import { z } from "zod";

const taskStatuses = ["pending", "in_progress", "completed"] as const;
const taskPriorities = ["low", "medium", "high"] as const;

const optionalTextField = z.string().trim().optional().transform((value) => {
  if (!value) {
    return null;
  }

  return value;
});

const optionalUuidField = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : null))
  .pipe(z.uuid().nullable());

export const taskParamsSchema = z.object({
  id: z.uuid("ID de tarefa inválido"),
});

export const listTasksQuerySchema = z.object({
  status: z.enum(taskStatuses).optional(),
  customerId: z.uuid().optional(),
});

export const createTaskSchema = z.object({
  title: z.string().trim().min(1, "Título é obrigatório"),
  description: optionalTextField,
  status: z.enum(taskStatuses).optional().default("pending"),
  priority: z.enum(taskPriorities).optional().default("medium"),
  dueAt: z
    .string()
    .datetime({ offset: true })
    .optional()
    .transform((value) => (value ? new Date(value) : null)),
  customerId: optionalUuidField,
  assignedToUserId: optionalUuidField,
});

export const updateTaskSchema = createTaskSchema.partial().extend({
  title: z.string().trim().min(1, "Título é obrigatório").optional(),
});
