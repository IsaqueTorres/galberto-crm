import { z } from "zod";

const optionalTextField = z.string().trim().optional().transform((value) => {
  if (!value) {
    return null;
  }

  return value;
});

export const customerParamsSchema = z.object({
  id: z.uuid("ID de cliente inválido"),
});

export const listCustomersQuerySchema = z.object({
  search: z.string().trim().optional(),
});

export const createCustomerSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório"),
  companyName: optionalTextField,
  document: optionalTextField,
  email: optionalTextField,
  phone: optionalTextField,
  whatsapp: optionalTextField,
  notes: optionalTextField,
});

export const updateCustomerSchema = createCustomerSchema;
