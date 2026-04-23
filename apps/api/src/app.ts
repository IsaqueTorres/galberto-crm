import { Hono } from "hono";
import { cors } from "hono/cors";
import { sql } from "drizzle-orm";
import { db } from "./db";
import { authRoutes } from "./modules/auth/auth.routes";
import { setupRoutes } from "./modules/setup/setup.routes";

export const app = new Hono();

app.use(
  "*",
  cors({
    origin: process.env.CORS_ORIGIN?.trim() || "http://localhost:5173",
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type"],
    credentials: true,
  })
);

app.get("/", (c) => {
  return c.json({
    name: "Galberto CRM API",
    status: "ok"
  });
});

app.get("/health", async (c) => {
  try {
    const result = await db.execute(sql`select 1 as test`);
    return c.json({
      status: "ok",
      database: "connected",
      result,
    });
  } catch (error) {
    console.error(error);
    return c.json(
      {
        status: "error",
        database: "disconnected",
      },
      500
    );
  };

});

app.route("/setup", setupRoutes);
app.route("/auth", authRoutes);
