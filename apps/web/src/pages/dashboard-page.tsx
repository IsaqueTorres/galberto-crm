import { Link } from "react-router-dom";
import { AppLayout } from "../components/app-layout";
import { useAuth } from "../modules/auth/use-auth";

export function DashboardPage() {
  const { tenant, user } = useAuth();
  const [firstName] = user?.name.split(" ") ?? ["Usuário"];

  return (
    <AppLayout
      title="Início"
      description="Acesse os fluxos principais do CRM sem camadas extras."
    >
      <section className="stack">
        <section className="panel panel-hero">
          <span className="eyebrow">Sessão ativa</span>
          <h2 className="section-title">Você está autenticado</h2>
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
        </section>

        <section className="quick-actions-grid">
          <Link to="/customers" className="panel shortcut-card shortcut-card-blue">
            <h3>Clientes</h3>
            <p>Cadastre, edite e abra o detalhe dos clientes.</p>
          </Link>
          <Link to="/tasks" className="panel shortcut-card shortcut-card-cyan">
            <h3>Tarefas</h3>
            <p>Crie tarefas operacionais e marque o que já foi concluído.</p>
          </Link>
        </section>
      </section>
    </AppLayout>
  );
}
