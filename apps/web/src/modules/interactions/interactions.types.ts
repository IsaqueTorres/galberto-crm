export type InteractionType = "note" | "call" | "whatsapp" | "email" | "visit" | "observation" | "complaint" | "negotiation" | "support";

export type Interaction = {
  id: string;
  tenantId: string;
  customerId: string;
  createdByUserId: string;
  type: InteractionType;
  subject: string | null;
  description: string;
  interactionDate: string;
  createdAt: string;
  createdByUserName: string | null;
};

export type InteractionPayload = {
  type: InteractionType;
  subject?: string;
  description: string;
  interactionDate?: string;
};
