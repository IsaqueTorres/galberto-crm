import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

export const customers = pgTable("customers", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  personType: text("person_type").notNull().default("pf"),
  name: text("name").notNull(),
  legalName: text("legal_name"),
  tradeName: text("trade_name"),
  document: text("document"),
  secondaryDocument: text("secondary_document"),
  email: text("email"),
  phone: text("phone"),
  whatsapp: text("whatsapp"),
  postalCode: text("postal_code"),
  street: text("street"),
  number: text("number"),
  complement: text("complement"),
  neighborhood: text("neighborhood"),
  city: text("city"),
  state: text("state"),
  status: text("status").notNull().default("lead"),
  source: text("source"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
