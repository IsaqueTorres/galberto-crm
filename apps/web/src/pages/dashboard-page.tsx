import { Link } from "react-router-dom";
import { AppLayout } from "../components/app-layout";
import { useAuth } from "../modules/auth/use-auth";

export function DashboardPage() {
  const { tenant, user } = useAuth();
  const [firstName] = user?.name.split(" ") ?? ["Usuário"];

  return (
    <AppLayout
      title={`Olá, ${firstName}`}
      description="Esta é sua central do Galberto. Você vê apenas os módulos liberados para o seu perfil."
    >
      <section className="dashboard-shell">
        <div className="welcome-summary-grid">
          <section className="welcome-summary-card welcome-summary-card-blue">
            <span className="eyebrow">Usuário</span>
            <h2>{user?.name}</h2>
            <p>{user?.email}</p>
          </section>

          <section className="welcome-summary-card welcome-summary-card-green">
            <span className="eyebrow">Perfil</span>
            <h2>{user?.role}</h2>
            <p>Acesso liberado para operação diária.</p>
          </section>

          <section className="welcome-summary-card welcome-summary-card-blue">
            <span className="eyebrow">Módulos</span>
            <h2>2</h2>
            <p>Clientes e tarefas disponíveis.</p>
          </section>

          <section className="welcome-summary-card welcome-summary-card-green">
            <span className="eyebrow">Sistema</span>
            <h2>{tenant?.name}</h2>
            <p>Tenant ativo e autenticado.</p>
          </section>
        </div>

        <section className="welcome-modules-grid">
          <Link to="/customers" className="welcome-module-card welcome-module-card-green">
            <div className="welcome-module-icon">C</div>
            <h3>Clientes</h3>
            <p>Cadastre, edite e acompanhe o histórico do relacionamento.</p>
          </Link>

          <Link to="/tasks" className="welcome-module-card welcome-module-card-blue">
            <div className="welcome-module-icon">T</div>
            <h3>Tarefas</h3>
            <p>Organize pendências, prazos e acompanhe o que foi concluído.</p>
          </Link>

          <section className="welcome-module-card welcome-module-card-dark">
            <div className="welcome-module-icon">P</div>
            <h3>Perfil</h3>
            <p>
              Você está operando como <strong>{user?.role}</strong>.
            </p>
          </section>

          <section className="welcome-module-card welcome-module-card-amber">
            <div className="welcome-module-icon">S</div>
            <h3>Status</h3>
            <p>Ambiente conectado para o tenant <strong>{tenant?.slug || tenant?.name}</strong>.</p>
          </section>
        </section>
      </section>
    </AppLayout>
  );
}
