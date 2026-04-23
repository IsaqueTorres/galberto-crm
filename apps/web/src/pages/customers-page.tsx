import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "../components/app-layout";
import { CustomerForm } from "../components/customer-form";
import {
  createCustomer,
  listCustomers,
  updateCustomer,
} from "../modules/customers/customers.service";
import type { Customer, CustomerPayload } from "../modules/customers/customers.types";

export function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
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

      setIsFormOpen(false);
      setEditingCustomer(null);
      await loadCustomers(search);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Não foi possível salvar o cliente."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function openNewCustomerForm() {
    setEditingCustomer(null);
    setIsFormOpen(true);
  }

  function openEditCustomerForm(customer: Customer) {
    setEditingCustomer(customer);
    setIsFormOpen(true);
  }

  async function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearch(searchInput);
    await loadCustomers(searchInput);
  }

  return (
    <AppLayout
      title="Clientes"
      description="Cadastre, busque e acompanhe seus clientes em um fluxo direto."
      actions={
        <button type="button" className="primary-button" onClick={openNewCustomerForm}>
          Novo cliente
        </button>
      }
    >
      <section className="stack">
        <form className="panel search-row" onSubmit={handleSearchSubmit}>
          <input
            className="search-input"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Buscar por nome, documento ou telefone"
          />
          <button type="submit" className="ghost-button">
            Buscar
          </button>
        </form>

        {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

        {isFormOpen ? (
          <CustomerForm
            initialData={editingCustomer}
            isSubmitting={isSubmitting}
            onSubmit={handleSaveCustomer}
            onCancel={() => {
              setIsFormOpen(false);
              setEditingCustomer(null);
            }}
          />
        ) : null}

        <section className="panel">
          {isLoading ? (
            <p>Carregando clientes...</p>
          ) : customers.length === 0 ? (
            <p>Nenhum cliente encontrado.</p>
          ) : (
            <div className="list-grid">
              {customers.map((customer) => (
                <article key={customer.id} className="list-card">
                  <div>
                    <h3>{customer.name}</h3>
                    <p>{customer.companyName || "Sem empresa informada"}</p>
                  </div>

                  <dl className="meta-list">
                    <div>
                      <dt>Documento</dt>
                      <dd>{customer.document || "-"}</dd>
                    </div>
                    <div>
                      <dt>Telefone</dt>
                      <dd>{customer.phone || customer.whatsapp || "-"}</dd>
                    </div>
                  </dl>

                  <div className="inline-actions">
                    <button
                      type="button"
                      className="ghost-button"
                      onClick={() => openEditCustomerForm(customer)}
                    >
                      Editar
                    </button>
                    <Link className="primary-button" to={`/customers/${customer.id}`}>
                      Abrir detalhe
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </AppLayout>
  );
}
