import { and, desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { db } from "../../db";
import { customers, tasks, users } from "../../db/schema";
import { authMiddleware } from "../../middlewares/auth.middleware";
import {
  createTaskSchema,
  listTasksQuerySchema,
  taskParamsSchema,
  updateTaskSchema,
} from "./tasks.schema";

export const tasksRoutes = new Hono();

tasksRoutes.use("*", authMiddleware);

async function ensureTenantCustomer(customerId: string, tenantId: string) {
  return db.query.customers.findFirst({
    where: (table, { and, eq }) =>
      and(eq(table.id, customerId), eq(table.tenantId, tenantId)),
  });
}

async function ensureTenantUser(userId: string, tenantId: string) {
  return db.query.users.findFirst({
    where: (table, { and, eq }) =>
      and(eq(table.id, userId), eq(table.tenantId, tenantId)),
  });
}

tasksRoutes.get("/", async (c) => {
  const authUser = c.get("authUser");
  const parsedQuery = listTasksQuerySchema.safeParse({
    status: c.req.query("status"),
    customerId: c.req.query("customerId"),
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

  const items = await db
    .select({
      id: tasks.id,
      tenantId: tasks.tenantId,
      customerId: tasks.customerId,
      assignedToUserId: tasks.assignedToUserId,
      title: tasks.title,
      description: tasks.description,
      status: tasks.status,
      priority: tasks.priority,
      dueAt: tasks.dueAt,
      completedAt: tasks.completedAt,
      createdAt: tasks.createdAt,
      updatedAt: tasks.updatedAt,
      customerName: customers.name,
      assignedToUserName: users.name,
    })
    .from(tasks)
    .leftJoin(customers, eq(tasks.customerId, customers.id))
    .leftJoin(users, eq(tasks.assignedToUserId, users.id))
    .where(
      and(
        eq(tasks.tenantId, authUser.tenantId),
        parsedQuery.data.status
          ? eq(tasks.status, parsedQuery.data.status)
          : undefined,
        parsedQuery.data.customerId
          ? eq(tasks.customerId, parsedQuery.data.customerId)
          : undefined
      )
    )
    .orderBy(desc(tasks.createdAt));

  return c.json({ items });
});

tasksRoutes.post("/", async (c) => {
  try {
    const authUser = c.get("authUser");
    const body = await c.req.json();
    const parsedBody = createTaskSchema.safeParse(body);

    if (!parsedBody.success) {
      return c.json(
        {
          message: "Dados inválidos",
          errors: parsedBody.error.flatten(),
        },
        400
      );
    }

    if (parsedBody.data.customerId) {
      const customer = await ensureTenantCustomer(
        parsedBody.data.customerId,
        authUser.tenantId
      );

      if (!customer) {
        return c.json({ message: "Cliente não encontrado" }, 404);
      }
    }

    if (parsedBody.data.assignedToUserId) {
      const assignedUser = await ensureTenantUser(
        parsedBody.data.assignedToUserId,
        authUser.tenantId
      );

      if (!assignedUser) {
        return c.json({ message: "Usuário não encontrado" }, 404);
      }
    }

    const insertedTasks = await db
      .insert(tasks)
      .values({
        tenantId: authUser.tenantId,
        title: parsedBody.data.title,
        description: parsedBody.data.description,
        status: parsedBody.data.status,
        priority: parsedBody.data.priority,
        dueAt: parsedBody.data.dueAt,
        customerId: parsedBody.data.customerId,
        assignedToUserId: parsedBody.data.assignedToUserId,
      })
      .returning();

    return c.json({ task: insertedTasks[0] }, 201);
  } catch (error) {
    console.error("Erro ao criar tarefa:", error);

    return c.json(
      {
        message: "Erro interno ao criar tarefa",
      },
      500
    );
  }
});

tasksRoutes.put("/:id", async (c) => {
  try {
    const authUser = c.get("authUser");
    const parsedParams = taskParamsSchema.safeParse(c.req.param());

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
    const parsedBody = updateTaskSchema.safeParse(body);

    if (!parsedBody.success) {
      return c.json(
        {
          message: "Dados inválidos",
          errors: parsedBody.error.flatten(),
        },
        400
      );
    }

    if (parsedBody.data.customerId) {
      const customer = await ensureTenantCustomer(
        parsedBody.data.customerId,
        authUser.tenantId
      );

      if (!customer) {
        return c.json({ message: "Cliente não encontrado" }, 404);
      }
    }

    if (parsedBody.data.assignedToUserId) {
      const assignedUser = await ensureTenantUser(
        parsedBody.data.assignedToUserId,
        authUser.tenantId
      );

      if (!assignedUser) {
        return c.json({ message: "Usuário não encontrado" }, 404);
      }
    }

    const updatedTasks = await db
      .update(tasks)
      .set({
        ...parsedBody.data,
        updatedAt: new Date(),
      })
      .where(
        and(eq(tasks.id, parsedParams.data.id), eq(tasks.tenantId, authUser.tenantId))
      )
      .returning();

    if (updatedTasks.length === 0) {
      return c.json({ message: "Tarefa não encontrada" }, 404);
    }

    return c.json({ task: updatedTasks[0] });
  } catch (error) {
    console.error("Erro ao atualizar tarefa:", error);

    return c.json(
      {
        message: "Erro interno ao atualizar tarefa",
      },
      500
    );
  }
});

tasksRoutes.patch("/:id/complete", async (c) => {
  try {
    const authUser = c.get("authUser");
    const parsedParams = taskParamsSchema.safeParse(c.req.param());

    if (!parsedParams.success) {
      return c.json(
        {
          message: "Parâmetros inválidos",
          errors: parsedParams.error.flatten(),
        },
        400
      );
    }

    const updatedTasks = await db
      .update(tasks)
      .set({
        status: "completed",
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(eq(tasks.id, parsedParams.data.id), eq(tasks.tenantId, authUser.tenantId))
      )
      .returning();

    if (updatedTasks.length === 0) {
      return c.json({ message: "Tarefa não encontrada" }, 404);
    }

    return c.json({ task: updatedTasks[0] });
  } catch (error) {
    console.error("Erro ao concluir tarefa:", error);

    return c.json(
      {
        message: "Erro interno ao concluir tarefa",
      },
      500
    );
  }
});
