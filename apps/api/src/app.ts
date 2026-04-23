import { Hono } from "hono";
import { sql } from "drizzle-orm";
import { db } from "./db";

export const app = new Hono();

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