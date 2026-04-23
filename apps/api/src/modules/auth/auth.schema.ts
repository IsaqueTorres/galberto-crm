import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Email inválido").transform((value) => value.toLowerCase()),
  password: z.string().min(1, "Senha é obrigatória"),
});
