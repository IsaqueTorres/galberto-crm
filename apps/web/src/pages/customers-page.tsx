import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "../components/app-layout";
import { CustomerForm } from "../components/customer-form";
import {
  createCustomer,
  deleteCustomer,
  listCustomers,
  updateCustomer,
} from "../modules/customers/customers.service";
import type { Customer, CustomerPayload } from "../modules/customers/customers.types";

const customerStatusLabels = {
  lead: "Lead",
  active: "Ativo",
  inactive: "Inativo",
} as const;

export function CustomersPage() {
  const [activeTab, setActiveTab] = useState<"list" | "form">("list");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [nameSearchInput, setNameSearchInput] = useState("");
  const [documentSearchInput, setDocumentSearchInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  async function loadCustomers(currentSearch = search) {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const items = await listCustomers(currentSearch);
      setCustomers(items);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Não foi possível carregar os clientes."
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadCustomers("");
  }, []);

  async function handleSaveCustomer(payload: CustomerPayload) {
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      if (editingCustomer) {
        await updateCustomer(editingCustomer.id, payload);
      } else {
        await createCustomer(payload);
      }

      setEditingCustomer(null);
      setActiveTab("list");
      await loadCustomers(search);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Não foi possível salvar o cliente."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function openEditCustomerForm(customer: Customer) {
    setEditingCustomer(customer);
    setActiveTab("form");
  }

  async function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextSearch = `${nameSearchInput} ${documentSearchInput}`.trim();
    setSearch(nextSearch);
    await loadCustomers(nextSearch);
  }

  async function handleDeleteCustomer(customer: Customer) {
    const confirmed = window.confirm(
      `Excluir o cliente "${customer.tradeName || customer.name}"? Esta ação remove também as interações vinculadas.`
    );

    if (!confirmed) {
      return;
    }

    setErrorMessage("");

    try {
      await deleteCustomer(customer.id);
      await loadCustomers(search);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Não foi possível excluir o cliente."
      );
    }
  }

  return (
    <AppLayout
      title="Clientes"
      description="Cadastre, busque e acompanhe seus clientes em um fluxo direto."
    >
      <section className="stack">
        <section className="erp-tabs-shell">
          <button
            type="button"
            className={`erp-tab ${activeTab === "list" ? "erp-tab-active" : ""}`}
            onClick={() => {
              setActiveTab("list");
              setEditingCustomer(null);
            }}
          >
            Clientes
          </button>
          <button
            type="button"
            className={`erp-tab ${activeTab === "form" ? "erp-tab-active" : ""}`}
            onClick={() => {
              setEditingCustomer(null);
              setActiveTab("form");
            }}
          >
            {editingCustomer ? "Editar cliente" : "Cadastrar cliente"}
          </button>
        </section>

        {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

        {activeTab === "list" ? (
          <>
            <section className="panel customers-toolbar">
              <form className="customers-search-grid" onSubmit={handleSearchSubmit}>
                <input
                  className="search-input"
                  value={nameSearchInput}
                  onChange={(event) => setNameSearchInput(event.target.value)}
                  placeholder="Nome, razão social ou nome fantasia"
                />
                <input
                  className="search-input"
                  value={documentSearchInput}
                  onChange={(event) => setDocumentSearchInput(event.target.value)}
                  placeholder="CPF / CNPJ / telefone"
                />
                <button type="submit" className="primary-button customers-search-button">
                  Buscar
                </button>
                <button
                  type="button"
                  className="ghost-button"
                  onClick={async () => {
                    setSearch("");
                    setNameSearchInput("");
                    setDocumentSearchInput("");
                    await loadCustomers("");
                  }}
                >
                  Limpar
                </button>
              </form>
            </section>

            <section className="panel customers-table-panel">
              {isLoading ? (
                <p>Carregando clientes...</p>
              ) : customers.length === 0 ? (
                <p>Nenhum cliente encontrado.</p>
              ) : (
                <div className="customers-table">
                  <div className="customers-table-head">
                    <span>Cliente</span>
                    <span>Documento</span>
                    <span>Contato</span>
                    <span>Status</span>
                    <span>Ação</span>
                  </div>

                  {customers.map((customer) => (
                    <article key={customer.id} className="customers-table-row">
                      <div>
                        <strong>{customer.tradeName || customer.name}</strong>
                        <small>{customer.legalName || customer.name}</small>
                      </div>
                      <div>{customer.document || "-"}</div>
                      <div>
                        <strong>{customer.phone || customer.whatsapp || "-"}</strong>
                        <small>{customer.email || "Sem email"}</small>
                      </div>
                      <div className="inline-tags">
                        <span className="status-badge">
                          {customer.personType === "pf" ? "PF" : "PJ"}
                        </span>
                        <span className={`status-badge customer-status-${customer.status}`}>
                          {customerStatusLabels[customer.status]}
                        </span>
                      </div>
                      <div className="customers-row-action">
                        <button
                          type="button"
                          className="ghost-button"
                          onClick={() => openEditCustomerForm(customer)}
                        >
                          Editar
                        </button>
                        <Link className="customers-link" to={`/customers/${customer.id}`}>
                          Detalhes
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        ) : (
          <CustomerForm
            initialData={editingCustomer}
            isSubmitting={isSubmitting}
            onSubmit={handleSaveCustomer}
            onDelete={
              editingCustomer
                ? async () => {
                    await handleDeleteCustomer(editingCustomer);
                    setEditingCustomer(null);
                    setActiveTab("list");
                  }
                : undefined
            }
            onCancel={() => {
              setEditingCustomer(null);
              setActiveTab("list");
            }}
          />
        )}
      </section>
    </AppLayout>
  );
}
