import { eq } from "drizzle-orm";
import { createMiddleware } from "hono/factory";
import { db } from "../db";
import { sessions } from "../db/schema";
import { clearSessionCookie, hashSessionToken, readSessionCookie } from "../lib/session";

export type AuthUser = {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  role: string;
};

type AppEnv = {
  Variables: {
    authUser: AuthUser;
  };
};

export const authMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  const sessionToken = await readSessionCookie(c);

  if (!sessionToken) {
    clearSessionCookie(c);
    return c.json({ message: "Não autenticado" }, 401);
  }

  const tokenHash = hashSessionToken(sessionToken);

  const session = await db.query.sessions.findFirst({
    where: (table, { and, eq, gt }) =>
      and(eq(table.tokenHash, tokenHash), gt(table.expiresAt, new Date())),
  });

  if (!session) {
    clearSessionCookie(c);
    return c.json({ message: "Não autenticado" }, 401);
  }

  const user = await db.query.users.findFirst({
    columns: {
      id: true,
      tenantId: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
    },
    where: (table, { and, eq }) =>
      and(eq(table.id, session.userId), eq(table.isActive, true)),
  });

  if (!user) {
    await db.delete(sessions).where(eq(sessions.id, session.id));
    clearSessionCookie(c);
    return c.json({ message: "Não autenticado" }, 401);
  }

  c.set("authUser", {
    id: user.id,
    tenantId: user.tenantId,
    name: user.name,
    email: user.email,
    role: user.role,
  });

  await next();
});
