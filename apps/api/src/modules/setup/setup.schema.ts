import { z } from "zod";

export const bootstrapSchema = z.object({
  tenantName: z.string().min(2, "Nome do tenant é obrigatório"),
  tenantSlug: z
    .string()
    .min(2, "Slug é obrigatório")
    .regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hífen"),
  tenantDocument: z.string().optional(),
  adminName: z.string().min(2, "Nome do admin é obrigatório"),
  adminEmail: z.email("Email inválido").transform((value) => value.toLowerCase()),
  adminPassword: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});