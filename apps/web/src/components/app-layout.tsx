import type { PropsWithChildren, ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../modules/auth/use-auth";

type AppLayoutProps = PropsWithChildren<{
  title: string;
  description?: string;
  actions?: ReactNode;
}>;

export function AppLayout({
  title,
  description,
  actions,
  children,
}: AppLayoutProps) {
  const { logout, tenant, user } = useAuth();

  return (
    <div className="workspace-layout">
      <aside className="workspace-sidebar">
        <div className="sidebar-top">
          <div className="brand-block">
            <div className="brand-mark">G</div>
            <div>
              <h2 className="sidebar-title">Galberto</h2>
              <p className="sidebar-copy">{tenant?.name}</p>
            </div>
          </div>

          <div className="sidebar-section">
            <span className="sidebar-section-label">Principal</span>
            <nav className="sidebar-nav">
              <NavLink to="/" end className="sidebar-link">
                <span className="sidebar-link-mark" />
                Início
              </NavLink>
            </nav>
          </div>

          <div className="sidebar-section">
            <span className="sidebar-section-label">Gestão</span>
            <nav className="sidebar-nav">
              <NavLink to="/customers" className="sidebar-link">
                <span className="sidebar-link-mark" />
                Clientes
              </NavLink>
              <NavLink to="/tasks" className="sidebar-link">
                <span className="sidebar-link-mark" />
                Tarefas
              </NavLink>
            </nav>
          </div>
        </div>

        <div className="sidebar-footer">
          <p className="sidebar-helper">Sessão ativa para o tenant atual.</p>
          <button type="button" className="ghost-button sidebar-logout" onClick={() => void logout()}>
            Sair do sistema
          </button>
        </div>
      </aside>

      <main className="workspace-main">
        <div className="workspace-topbar">
          <div className="topbar-chip">Tenant: {tenant?.slug || tenant?.name}</div>
          <div className="topbar-chip topbar-chip-secondary">Operador: {user?.name}</div>
        </div>

        <header className="page-header">
          <div>
            <h1 className="page-title">{title}</h1>
            {description ? <p>{description}</p> : null}
          </div>
          {actions ? <div className="page-actions">{actions}</div> : null}
        </header>

        {children}
      </main>
    </div>
  );
}
