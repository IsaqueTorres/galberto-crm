import { z } from "zod";

const interactionTypes = ["note", "call", "whatsapp", "email", "visit", "observation", "complaint", "negotiation", "support"] as const;

export const interactionParamsSchema = z.object({
  id: z.uuid("ID de cliente inválido"),
});

export const createInteractionSchema = z.object({
  type: z.enum(interactionTypes),
  subject: z.string().trim().optional().transform((value) => value || null),
  description: z.string().trim().min(1, "Descrição é obrigatória"),
  interactionDate: z
    .string()
    .datetime({ offset: true })
    .optional()
    .transform((value) => (value ? new Date(value) : undefined)),
});
