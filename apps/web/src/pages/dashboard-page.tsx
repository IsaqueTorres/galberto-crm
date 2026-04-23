import { useState } from "react";
import { useAuth } from "../modules/auth/use-auth";

export function DashboardPage() {
  const { logout, tenant, user } = useAuth();
  const [firstName] = user?.name.split(" ") ?? ["Usuário"];
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <main className="dashboard-layout">
      <section className="dashboard-card">
        <span className="eyebrow">Sessão ativa</span>
        <h1>Você está autenticado</h1>
        <p className="dashboard-lead">
          {firstName}, seu acesso ao tenant <strong>{tenant?.name}</strong> está ativo.
        </p>

        <dl className="dashboard-grid">
          <div>
            <dt>Usuário</dt>
            <dd>{user?.name}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{user?.email}</dd>
          </div>
          <div>
            <dt>Tenant</dt>
            <dd>{tenant?.name}</dd>
          </div>
          <div>
            <dt>Perfil</dt>
            <dd>{user?.role}</dd>
          </div>
        </dl>

        <button type="button" className="primary-button" onClick={handleLogout} disabled={isLoggingOut}>
          {isLoggingOut ? "Saindo..." : "Logout"}
        </button>
      </section>
    </main>
  );
}
