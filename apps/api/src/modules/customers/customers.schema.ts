import { z } from "zod";

const customerPersonTypes = ["pf", "pj"] as const;
const customerStatuses = ["lead", "active", "inactive"] as const;

function nullIfEmpty(value?: string) {
  if (!value) {
    return null;
  }

  return value;
}

const optionalTextField = z.string().trim().optional().transform((value) => nullIfEmpty(value));

const optionalEmailField = z
  .email("Email inválido")
  .optional()
  .or(z.literal(""))
  .transform((value) => (value ? value.toLowerCase() : null));

const optionalDigitsField = z
  .string()
  .trim()
  .optional()
  .transform((value) => nullIfEmpty(value?.replace(/\D/g, "")));

const optionalStateField = z
  .string()
  .trim()
  .optional()
  .transform((value) => {
    const parsedValue = nullIfEmpty(value);
    return parsedValue ? parsedValue.toUpperCase() : null;
  })
  .refine((value) => !value || /^[A-Z]{2}$/.test(value), {
    message: "UF deve ter 2 letras",
  });

export const customerParamsSchema = z.object({
  id: z.uuid("ID de cliente inválido"),
});

export const listCustomersQuerySchema = z.object({
  search: z.string().trim().optional(),
});

export const createCustomerSchema = z
  .object({
    personType: z.enum(customerPersonTypes).default("pf"),
    name: z.string().trim().min(2, "Nome é obrigatório"),
    legalName: optionalTextField,
    tradeName: optionalTextField,
    document: optionalDigitsField,
    secondaryDocument: optionalTextField,
    email: optionalEmailField,
    phone: optionalDigitsField,
    whatsapp: optionalDigitsField,
    postalCode: optionalDigitsField,
    street: optionalTextField,
    number: optionalTextField,
    complement: optionalTextField,
    neighborhood: optionalTextField,
    city: optionalTextField,
    state: optionalStateField,
    status: z.enum(customerStatuses).default("lead"),
    source: optionalTextField,
    notes: optionalTextField,
  })
  .superRefine((data, ctx) => {
    if (data.personType === "pf" && data.document && data.document.length !== 11) {
      ctx.addIssue({
        code: "custom",
        path: ["document"],
        message: "CPF deve ter 11 dígitos",
      });
    }

    if (data.personType === "pj" && data.document && data.document.length !== 14) {
      ctx.addIssue({
        code: "custom",
        path: ["document"],
        message: "CNPJ deve ter 14 dígitos",
      });
    }
  });

export const updateCustomerSchema = createCustomerSchema;
