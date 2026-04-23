export type Customer = {
  id: string;
  tenantId: string;
  name: string;
  companyName: string | null;
  document: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CustomerPayload = {
  name: string;
  companyName?: string;
  document?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  notes?: string;
};
