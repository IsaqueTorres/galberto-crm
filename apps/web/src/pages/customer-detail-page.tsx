import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AppLayout } from "../components/app-layout";
import { CustomerForm } from "../components/customer-form";
import { InteractionForm } from "../components/interaction-form";
import {
  deleteCustomer,
  getCustomer,
  updateCustomer,
} from "../modules/customers/customers.service";
import type { Customer, CustomerPayload } from "../modules/customers/customers.types";
import {
  createInteraction,
  listInteractions,
} from "../modules/interactions/interactions.service";
import type {
  Interaction,
  InteractionPayload,
} from "../modules/interactions/interactions.types";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

const customerStatusLabels = {
  lead: "Lead",
  active: "Ativo",
  inactive: "Inativo",
} as const;

export function CustomerDetailPage() {
  const navigate = useNavigate();
  const { id = "" } = useParams();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSavingCustomer, setIsSavingCustomer] = useState(false);
  const [isSavingInteraction, setIsSavingInteraction] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadPage() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const [customerData, interactionsData] = await Promise.all([
        getCustomer(id),
        listInteractions(id),
      ]);

      setCustomer(customerData);
      setInteractions(interactionsData);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Não foi possível carregar o cliente."
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadPage();
  }, [id]);

  async function handleSaveCustomer(payload: CustomerPayload) {
    setIsSavingCustomer(true);
    setErrorMessage("");

    try {
      const updatedCustomer = await updateCustomer(id, payload);
      setCustomer(updatedCustomer);
      setIsEditing(false);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Não foi possível atualizar o cliente."
      );
    } finally {
      setIsSavingCustomer(false);
    }
  }

  async function handleCreateInteraction(payload: InteractionPayload) {
    setIsSavingInteraction(true);
    setErrorMessage("");

    try {
      await createInteraction(id, payload);
      const items = await listInteractions(id);
      setInteractions(items);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Não foi possível registrar a interação."
      );
    } finally {
      setIsSavingInteraction(false);
    }
  }

  async function handleDeleteCustomer() {
    if (!customer) {
      return;
    }

    const confirmed = window.confirm(
      `Excluir o cliente "${customer.tradeName || customer.name}"? Esta ação remove também as interações vinculadas.`
    );

    if (!confirmed) {
      return;
    }

    setErrorMessage("");

    try {
      await deleteCustomer(customer.id);
      navigate("/customers", { replace: true });
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Não foi possível excluir o cliente."
      );
    }
  }

  return (
    <AppLayout
      title={customer ? customer.name : "Cliente"}
      actions={
        <div className="inline-actions">
          <Link to="/customers" className="ghost-button">
            Voltar
          </Link>
          {customer ? (
            <button type="button" className="primary-button" onClick={() => setIsEditing(true)}>
              Editar cliente
            </button>
          ) : null}
        </div>
      }
    >
      <section className="stack">
        {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

        {isLoading ? (
          <section className="panel">
            <p>Carregando cliente...</p>
          </section>
        ) : customer ? (
          <>
            {isEditing ? (
              <CustomerForm
                initialData={customer}
                isSubmitting={isSavingCustomer}
                onSubmit={handleSaveCustomer}
                onDelete={handleDeleteCustomer}
                onCancel={() => setIsEditing(false)}
              />
            ) : (
              <section className="customer-detail-layout">
                <div className="customer-detail-main">
                  <section className="panel interaction-compose-panel">
                    <div className="interaction-compose-header">
                      <div>
                     
                        <h2 className="section-title">Histórico de interações</h2>
                      </div>
                      <div className="interaction-counter">
                        <strong>{interactions.length}</strong>
                        <span>interações registradas</span>
                      </div>
                    </div>

                    <InteractionForm
                      isSubmitting={isSavingInteraction}
                      onSubmit={handleCreateInteraction}
                    />
                  </section>

                  <section className="panel interaction-feed-panel">
                    <div className="section-heading">
                      <h2 className="section-title">Histórico de interações</h2>
                    </div>

                    {interactions.length === 0 ? (
                      <div className="interaction-empty-state">
                        <strong>Nenhuma interação registrada.</strong>
                        <p>Comece acima anotando o primeiro contato ou contexto deste cliente.</p>
                      </div>
                    ) : (
                      <div className="timeline interaction-timeline">
                        {interactions.map((interaction) => (
                          <article key={interaction.id} className="timeline-item interaction-timeline-item">
                            <div className="timeline-head">
                              <strong>{interaction.subject || "Sem assunto"}</strong>
                              <span className="status-badge">{interaction.type}</span>
                            </div>
                            <p>{interaction.description}</p>
                            <small>
                              {formatDate(interaction.interactionDate)}
                              {interaction.createdByUserName
                                ? ` por ${interaction.createdByUserName}`
                                : ""}
                            </small>
                          </article>
                        ))}
                      </div>
                    )}
                  </section>
                </div>

                <aside className="customer-detail-aside">
                  <section className="panel customer-summary-panel">
                    <div className="inline-tags detail-tags">
                      <span className="status-badge">
                        {customer.personType === "pf" ? "Pessoa física" : "Pessoa jurídica"}
                      </span>
                      <span className={`status-badge customer-status-${customer.status}`}>
                        {customerStatusLabels[customer.status]}
                      </span>
                      {customer.source ? <span className="status-badge">Origem: {customer.source}</span> : null}
                    </div>

                    <div className="customer-summary-block">
                      <strong>{customer.tradeName || customer.name}</strong>
                      <p>{customer.contactPerson || customer.name}</p>
                    </div>

                    <div className="customer-mini-grid">
                      <div>
                        <span className="detail-label">Documento</span>
                        <strong>{customer.document || "-"}</strong>
                      </div>
                      <div>
                        <span className="detail-label">Telefone</span>
                        <strong>{customer.phone || customer.whatsapp || "-"}</strong>
                      </div>
                      <div>
                        <span className="detail-label">Email</span>
                        <strong>{customer.email || "-"}</strong>
                      </div>
                      <div>
                        <span className="detail-label">Cidade</span>
                        <strong>{customer.city || "-"}</strong>
                      </div>
                    </div>

                    <div className="notes-box customer-summary-notes">
                      <span className="detail-label">Observações rápidas</span>
                      <p>{customer.notes || "Sem observações cadastradas."}</p>
                    </div>
                  </section>
                </aside>
              </section>
            )}
          </>
        ) : (
          <section className="panel">
            <p>Cliente não encontrado.</p>
          </section>
        )}
      </section>
    </AppLayout>
  );
}
