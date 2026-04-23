import { Hono } from "hono";

export const app = new Hono();

app.get("/", (c) => {
  return c.json({
    name: "Galberto CRM API",
    status: "ok"
  });
});