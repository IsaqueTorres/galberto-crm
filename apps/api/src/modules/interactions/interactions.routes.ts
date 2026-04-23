import { and, desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { db } from "../../db";
import { customers, interactions, users } from "../../db/schema";
import { authMiddleware } from "../../middlewares/auth.middleware";
import {
  createInteractionSchema,
  interactionParamsSchema,
} from "./interactions.schema";

export const interactionsRoutes = new Hono();

interactionsRoutes.use("*", authMiddleware);

async function getTenantCustomer(customerId: string, tenantId: string) {
  return db.query.customers.findFirst({
    where: (table, { and, eq }) =>
      and(eq(table.id, customerId), eq(table.tenantId, tenantId)),
  });
}

interactionsRoutes.get("/:id/interactions", async (c) => {
  const authUser = c.get("authUser");
  const parsedParams = interactionParamsSchema.safeParse(c.req.param());

  if (!parsedParams.success) {
    return c.json(
      {
        message: "Parâmetros inválidos",
        errors: parsedParams.error.flatten(),
      },
      400
    );
  }

  const customer = await getTenantCustomer(parsedParams.data.id, authUser.tenantId);

  if (!customer) {
    return c.json({ message: "Cliente não encontrado" }, 404);
  }

  const items = await db
    .select({
      id: interactions.id,
      tenantId: interactions.tenantId,
      customerId: interactions.customerId,
      createdByUserId: interactions.createdByUserId,
      type: interactions.type,
      subject: interactions.subject,
      description: interactions.description,
      interactionDate: interactions.interactionDate,
      createdAt: interactions.createdAt,
      createdByUserName: users.name,
    })
    .from(interactions)
    .leftJoin(users, eq(interactions.createdByUserId, users.id))
    .where(
      and(
        eq(interactions.customerId, parsedParams.data.id),
        eq(interactions.tenantId, authUser.tenantId)
      )
    )
    .orderBy(desc(interactions.interactionDate));

  return c.json({ items });
});

interactionsRoutes.post("/:id/interactions", async (c) => {
  try {
    const authUser = c.get("authUser");
    const parsedParams = interactionParamsSchema.safeParse(c.req.param());

    if (!parsedParams.success) {
      return c.json(
        {
          message: "Parâmetros inválidos",
          errors: parsedParams.error.flatten(),
        },
        400
      );
    }

    const customer = await getTenantCustomer(parsedParams.data.id, authUser.tenantId);

    if (!customer) {
      return c.json({ message: "Cliente não encontrado" }, 404);
    }

    const body = await c.req.json();
    const parsedBody = createInteractionSchema.safeParse(body);

    if (!parsedBody.success) {
      return c.json(
        {
          message: "Dados inválidos",
          errors: parsedBody.error.flatten(),
        },
        400
      );
    }

    const insertedInteractions = await db
      .insert(interactions)
      .values({
        tenantId: authUser.tenantId,
        customerId: customer.id,
        createdByUserId: authUser.id,
        type: parsedBody.data.type,
        subject: parsedBody.data.subject,
        description: parsedBody.data.description,
        interactionDate: parsedBody.data.interactionDate ?? new Date(),
      })
      .returning();

    return c.json({ interaction: insertedInteractions[0] }, 201);
  } catch (error) {
    console.error("Erro ao criar interação:", error);

    return c.json(
      {
        message: "Erro interno ao criar interação",
      },
      500
    );
  }
});
