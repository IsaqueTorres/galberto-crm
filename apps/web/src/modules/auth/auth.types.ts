export type AuthUser = {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  role: string;
  isActive?: boolean;
};

export type AuthTenant = {
  id: string;
  name: string;
  slug: string;
  status: string;
  document?: string | null;
};

export type AuthResponse = {
  user: AuthUser;
  tenant: AuthTenant;
};

export type AuthContextValue = {
  user: AuthUser | null;
  tenant: AuthTenant | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
};
