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
  const { logout, tenant } = useAuth();

  return (
    <div className="workspace-layout">
      <aside className="workspace-sidebar">
        <div className="sidebar-top">
          <div className="brand-block">
            <div className="brand-mark">G</div>
            <div>
              <span className="eyebrow">Galberto CRM</span>
              <h2 className="sidebar-title">{tenant?.name}</h2>
              <p className="sidebar-copy">Operação comercial e atendimento em um fluxo direto.</p>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/" end className="sidebar-link">
            Início
          </NavLink>
          <NavLink to="/customers" className="sidebar-link">
            Clientes
          </NavLink>
          <NavLink to="/tasks" className="sidebar-link">
            Tarefas
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <p className="sidebar-helper">Sessão ativa para o tenant atual.</p>
          <button type="button" className="ghost-button sidebar-logout" onClick={() => void logout()}>
            Sair do sistema
          </button>
        </div>
      </aside>

      <main className="workspace-main">
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
