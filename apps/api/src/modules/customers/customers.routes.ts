import { and, desc, eq, ilike, or } from "drizzle-orm";
import { Hono } from "hono";
import { db } from "../../db";
import { customers } from "../../db/schema";
import { authMiddleware } from "../../middlewares/auth.middleware";
import {
  createCustomerSchema,
  customerParamsSchema,
  listCustomersQuerySchema,
  updateCustomerSchema,
} from "./customers.schema";

export const customersRoutes = new Hono();

customersRoutes.use("*", authMiddleware);

customersRoutes.get("/", async (c) => {
  const authUser = c.get("authUser");
  const parsedQuery = listCustomersQuerySchema.safeParse({
    search: c.req.query("search"),
  });

  if (!parsedQuery.success) {
    return c.json(
      {
        message: "Parâmetros inválidos",
        errors: parsedQuery.error.flatten(),
      },
      400
    );
  }

  const search = parsedQuery.data.search?.trim();

  const items = await db.query.customers.findMany({
    where: (table, { and, eq, ilike, or }) =>
      and(
        eq(table.tenantId, authUser.tenantId),
        search
          ? or(
              ilike(table.name, `%${search}%`),
              ilike(table.document, `%${search}%`),
              ilike(table.phone, `%${search}%`)
            )
          : undefined
      ),
    orderBy: (table, { desc }) => [desc(table.createdAt)],
  });

  return c.json({ items });
});

customersRoutes.post("/", async (c) => {
  try {
    const authUser = c.get("authUser");
    const body = await c.req.json();
    const parsed = createCustomerSchema.safeParse(body);

    if (!parsed.success) {
      return c.json(
        {
          message: "Dados inválidos",
          errors: parsed.error.flatten(),
        },
        400
      );
    }

    const insertedCustomers = await db
      .insert(customers)
      .values({
        tenantId: authUser.tenantId,
        ...parsed.data,
      })
      .returning();

    return c.json({ customer: insertedCustomers[0] }, 201);
  } catch (error) {
    console.error("Erro ao criar cliente:", error);

    return c.json(
      {
        message: "Erro interno ao criar cliente",
      },
      500
    );
  }
});

customersRoutes.get("/:id", async (c) => {
  const authUser = c.get("authUser");
  const parsedParams = customerParamsSchema.safeParse(c.req.param());

  if (!parsedParams.success) {
    return c.json(
      {
        message: "Parâmetros inválidos",
        errors: parsedParams.error.flatten(),
      },
      400
    );
  }

  const customer = await db.query.customers.findFirst({
    where: (table, { and, eq }) =>
      and(eq(table.id, parsedParams.data.id), eq(table.tenantId, authUser.tenantId)),
  });

  if (!customer) {
    return c.json({ message: "Cliente não encontrado" }, 404);
  }

  return c.json({ customer });
});

customersRoutes.put("/:id", async (c) => {
  try {
    const authUser = c.get("authUser");
    const parsedParams = customerParamsSchema.safeParse(c.req.param());

    if (!parsedParams.success) {
      return c.json(
        {
          message: "Parâmetros inválidos",
          errors: parsedParams.error.flatten(),
        },
        400
      );
    }

    const body = await c.req.json();
    const parsedBody = updateCustomerSchema.safeParse(body);

    if (!parsedBody.success) {
      return c.json(
        {
          message: "Dados inválidos",
          errors: parsedBody.error.flatten(),
        },
        400
      );
    }

    const updatedCustomers = await db
      .update(customers)
      .set({
        ...parsedBody.data,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(customers.id, parsedParams.data.id),
          eq(customers.tenantId, authUser.tenantId)
        )
      )
      .returning();

    if (updatedCustomers.length === 0) {
      return c.json({ message: "Cliente não encontrado" }, 404);
    }

    return c.json({ customer: updatedCustomers[0] });
  } catch (error) {
    console.error("Erro ao atualizar cliente:", error);

    return c.json(
      {
        message: "Erro interno ao atualizar cliente",
      },
      500
    );
  }
});
