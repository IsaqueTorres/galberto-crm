import type { AuthUser } from "../middlewares/auth.middleware";

declare module "hono" {
  interface ContextVariableMap {
    authUser: AuthUser;
  }
}

export {};
