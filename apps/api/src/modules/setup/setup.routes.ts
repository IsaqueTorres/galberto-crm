import { Hono } from "hono";
import { db } from "../../db";
import { tenants, users } from "../../db/schema";
import { hashPassword } from "../../lib/password";
import { bootstrapSchema } from "./setup.schema";

export const setupRoutes = new Hono();

setupRoutes.post("/bootstrap", async (c) => {
  try {
    const body = await c.req.json();
    const parsed = bootstrapSchema.safeParse(body);

    if (!parsed.success) {
      return c.json(
        {
          message: "Dados inválidos",
          errors: parsed.error.flatten(),
        },
        400
      );
    }

    const existingTenants = await db.select().from(tenants).limit(1);
    const existingUsers = await db.select().from(users).limit(1);

    if (existingTenants.length > 0 || existingUsers.length > 0) {
      return c.json(
        {
          message: "Bootstrap já foi executado. O sistema já possui dados iniciais.",
        },
        409
      );
    }

    const { tenantName, tenantSlug, tenantDocument, adminName, adminEmail, adminPassword } =
      parsed.data;

    const passwordHash = await hashPassword(adminPassword);

    const result = await db.transaction(async (tx) => {
      const insertedTenant = await tx
        .insert(tenants)
        .values({
          name: tenantName,
          slug: tenantSlug,
          document: tenantDocument || null,
          status: "active",
        })
        .returning({
          id: tenants.id,
          name: tenants.name,
          slug: tenants.slug,
          status: tenants.status,
        });

      const tenant = insertedTenant[0];

      const insertedUser = await tx
        .insert(users)
        .values({
          tenantId: tenant.id,
          name: adminName,
          email: adminEmail,
          passwordHash,
          role: "admin",
          isActive: true,
        })
        .returning({
          id: users.id,
          tenantId: users.tenantId,
          name: users.name,
          email: users.email,
          role: users.role,
          isActive: users.isActive,
        });

      const user = insertedUser[0];

      return { tenant, user };
    });

    return c.json(
      {
        message: "Bootstrap executado com sucesso",
        tenant: result.tenant,
        user: result.user,
      },
      201
    );
  } catch (error) {
    console.error("Erro no bootstrap:", error);

    return c.json(
      {
        message: "Erro interno ao executar bootstrap",
      },
      500
    );
  }
});
