import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { db } from "../../db";
import { sessions } from "../../db/schema";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { verifyPassword } from "../../lib/password";
import {
  clearSessionCookie,
  generateSessionToken,
  getSessionExpiresAt,
  hashSessionToken,
  readSessionCookie,
  setSessionCookie,
} from "../../lib/session";
import { loginSchema } from "./auth.schema";

type AppEnv = {
  Variables: {
    authUser: {
      id: string;
      tenantId: string;
      name: string;
      email: string;
      role: string;
    };
  };
};

const INVALID_CREDENTIALS_MESSAGE = "Credenciais inválidas";

export const authRoutes = new Hono<AppEnv>();

authRoutes.post("/login", async (c) => {
  try {
    const body = await c.req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return c.json(
        {
          message: "Dados inválidos",
          errors: parsed.error.flatten(),
        },
        400
      );
    }

    const user = await db.query.users.findFirst({
      where: (table, { eq }) => eq(table.email, parsed.data.email),
    });

    if (!user || !user.isActive) {
      return c.json({ message: INVALID_CREDENTIALS_MESSAGE }, 401);
    }

    const passwordMatches = await verifyPassword(parsed.data.password, user.passwordHash);

    if (!passwordMatches) {
      return c.json({ message: INVALID_CREDENTIALS_MESSAGE }, 401);
    }

    const tenant = await db.query.tenants.findFirst({
      where: (table, { eq }) => eq(table.id, user.tenantId),
    });

    if (!tenant) {
      return c.json({ message: "Tenant não encontrado" }, 404);
    }

    const token = generateSessionToken();
    const tokenHash = hashSessionToken(token);
    const expiresAt = getSessionExpiresAt();

    await db.insert(sessions).values({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    await setSessionCookie(c, token, expiresAt);

    return c.json({
      user: {
        id: user.id,
        tenantId: user.tenantId,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        document: tenant.document,
        status: tenant.status,
        createdAt: tenant.createdAt,
        updatedAt: tenant.updatedAt,
      },
    });
  } catch (error) {
    console.error("Erro no login:", error);

    return c.json(
      {
        message: "Erro interno ao realizar login",
      },
      500
    );
  }
});

authRoutes.post("/logout", async (c) => {
  try {
    const sessionToken = await readSessionCookie(c);

    if (sessionToken) {
      const tokenHash = hashSessionToken(sessionToken);
      await db.delete(sessions).where(eq(sessions.tokenHash, tokenHash));
    }

    clearSessionCookie(c);

    return c.json({ success: true });
  } catch (error) {
    console.error("Erro no logout:", error);
    clearSessionCookie(c);

    return c.json({ success: true });
  }
});

authRoutes.get("/me", authMiddleware, async (c) => {
  try {
    const authUser = c.get("authUser");

    const user = await db.query.users.findFirst({
      columns: {
        id: true,
        tenantId: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      where: (table, { eq }) => eq(table.id, authUser.id),
    });

    if (!user) {
      clearSessionCookie(c);
      return c.json({ message: "Não autenticado" }, 401);
    }

    const tenant = await db.query.tenants.findFirst({
      columns: {
        id: true,
        name: true,
        slug: true,
        document: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      where: (table, { eq }) => eq(table.id, user.tenantId),
    });

    if (!tenant) {
      return c.json({ message: "Tenant não encontrado" }, 404);
    }

    return c.json({ user, tenant });
  } catch (error) {
    console.error("Erro ao buscar sessão atual:", error);

    return c.json(
      {
        message: "Erro interno ao buscar sessão",
      },
      500
    );
  }
});
