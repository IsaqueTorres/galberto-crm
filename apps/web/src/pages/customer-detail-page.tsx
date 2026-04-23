import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AppLayout } from "../components/app-layout";
import { CustomerForm } from "../components/customer-form";
import { InteractionForm } from "../components/interaction-form";
import { getCustomer, updateCustomer } from "../modules/customers/customers.service";
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

export function CustomerDetailPage() {
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

  return (
    <AppLayout
      title={customer ? customer.name : "Cliente"}
      description="Consulte dados do cliente e registre o histórico de contato."
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
                onCancel={() => setIsEditing(false)}
              />
            ) : (
              <section className="panel">
                <div className="detail-grid">
                  <div>
                    <span className="detail-label">Empresa</span>
                    <strong>{customer.companyName || "-"}</strong>
                  </div>
                  <div>
                    <span className="detail-label">Documento</span>
                    <strong>{customer.document || "-"}</strong>
                  </div>
                  <div>
                    <span className="detail-label">Email</span>
                    <strong>{customer.email || "-"}</strong>
                  </div>
                  <div>
                    <span className="detail-label">Telefone</span>
                    <strong>{customer.phone || "-"}</strong>
                  </div>
                  <div>
                    <span className="detail-label">WhatsApp</span>
                    <strong>{customer.whatsapp || "-"}</strong>
                  </div>
                </div>

                <div className="notes-box">
                  <span className="detail-label">Observações</span>
                  <p>{customer.notes || "Sem observações."}</p>
                </div>
              </section>
            )}

            <section className="stack">
              <div className="section-heading">
                <h2 className="section-title">Nova interação</h2>
              </div>
              <InteractionForm
                isSubmitting={isSavingInteraction}
                onSubmit={handleCreateInteraction}
              />
            </section>

            <section className="stack">
              <div className="section-heading">
                <h2 className="section-title">Histórico de interações</h2>
              </div>

              <section className="panel">
                {interactions.length === 0 ? (
                  <p>Nenhuma interação registrada para este cliente.</p>
                ) : (
                  <div className="timeline">
                    {interactions.map((interaction) => (
                      <article key={interaction.id} className="timeline-item">
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
            </section>
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
