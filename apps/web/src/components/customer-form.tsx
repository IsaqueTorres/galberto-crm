import type { FormEvent } from "react";
import { useState } from "react";
import type { Customer, CustomerPayload } from "../modules/customers/customers.types";

type CustomerFormProps = {
  initialData?: Customer | null;
  isSubmitting?: boolean;
  onSubmit: (payload: CustomerPayload) => Promise<void>;
  onCancel?: () => void;
  onDelete?: () => Promise<void> | void;
};

export function CustomerForm({
  initialData,
  isSubmitting = false,
  onSubmit,
  onCancel,
  onDelete,
}: CustomerFormProps) {
  const [personType, setPersonType] = useState<"pf" | "pj">(initialData?.personType ?? "pf");
  const [name, setName] = useState(initialData?.name ?? "");
  const [contactPerson, setContactPerson] = useState(initialData?.contactPerson ?? "");
  const [tradeName, setTradeName] = useState(initialData?.tradeName ?? "");
  const [document, setDocument] = useState(initialData?.document ?? "");
  const [secondaryDocument, setSecondaryDocument] = useState(
    initialData?.secondaryDocument ?? ""
  );
  const [email, setEmail] = useState(initialData?.email ?? "");
  const [phone, setPhone] = useState(initialData?.phone ?? "");
  const [ramal, setRamal] = useState(initialData?.ramal ?? "");
  const [postalCode, setPostalCode] = useState(initialData?.postalCode ?? "");
  const [street, setStreet] = useState(initialData?.street ?? "");
  const [number, setNumber] = useState(initialData?.number ?? "");
  const [complement, setComplement] = useState(initialData?.complement ?? "");
  const [neighborhood, setNeighborhood] = useState(initialData?.neighborhood ?? "");
  const [city, setCity] = useState(initialData?.city ?? "");
  const [state, setState] = useState(initialData?.state ?? "");
  const [status, setStatus] = useState<"lead" | "active" | "inactive">(
    initialData?.status ?? "lead"
  );
  const [source, setSource] = useState(initialData?.source ?? "");
  const [notes, setNotes] = useState(initialData?.notes ?? "");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await onSubmit({
      personType,
      name,
      contactPerson,
      tradeName,
      document,
      secondaryDocument,
      email,
      phone,
      ramal,
      postalCode,
      street,
      number,
      complement,
      neighborhood,
      city,
      state,
      status,
      source,
      notes,
    });
  }

  return (
    <form className="customer-form-shell" onSubmit={handleSubmit}>
      <div className="customer-form-grid">
        <section className="customer-form-card">
          <div className="customer-form-card-header">
            <h3 className="customer-form-card-title">Identificação</h3>
          </div>

          <div className="grid-three compact-grid">
            <label className="field">
              <span>Tipo</span>
              <select
                value={personType}
                onChange={(event) => setPersonType(event.target.value as "pf" | "pj")}
              >
                <option value="pf">Pessoa física</option>
                <option value="pj">Pessoa jurídica</option>
              </select>
            </label>
            <label className="field">
              <span>Status</span>
              <select
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as "lead" | "active" | "inactive")
                }
              >
                <option value="lead">Lead</option>
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
              </select>
            </label>
            <label className="field">
              <span>Origem</span>
              <input value={source} onChange={(event) => setSource(event.target.value)} />
            </label>
          </div>

          <div className="grid-two compact-grid">
            <label className="field">
              <span>{personType === "pf" ? "Nome completo" : "Razão social"}</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={personType === "pf" ? "Nome do cliente" : "Razão social"}
                required
              />
            </label>
            <label className="field">
              <span>Nome fantasia</span>
              <input value={tradeName} onChange={(event) => setTradeName(event.target.value)} />
            </label>
          </div>

          <div className="grid-two compact-grid">
            <label className="field">
              <span>{personType === "pf" ? "CPF" : "CNPJ"}</span>
              <input value={document} onChange={(event) => setDocument(event.target.value)} />
            </label>
            <label className="field">
              <span>{personType === "pf" ? "RG" : "Inscrição estadual"}</span>
              <input
                value={secondaryDocument}
                onChange={(event) => setSecondaryDocument(event.target.value)}
              />
            </label>
          </div>
          
        </section>

        <section className="customer-form-card">
          <div className="customer-form-card-header">
            <h3 className="customer-form-card-title">Contato</h3>
          </div>

          <div className="grid-three compact-grid">
            <label className="field">
              <span>Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
            <label className="field">
              <span>Telefone</span>
              <input value={phone} onChange={(event) => setPhone(event.target.value)} />
            </label>
            <label className="field">
              <span>Ramal</span>
              <input value={ramal} onChange={(event) => setRamal(event.target.value)} />
            </label>
          </div>

 {personType === "pj" ? (
            <label className="field">
              <span>Nome do contato</span>
              <input value={contactPerson} onChange={(event) => setContactPerson(event.target.value)} />
            </label>
          ) : null}
        </section>

        <section className="customer-form-card">
          <div className="customer-form-card-header">
            <h3 className="customer-form-card-title">Endereço</h3>
          </div>

          <div className="grid-two compact-grid">
            <label className="field">
              <span>CEP</span>
              <input value={postalCode} onChange={(event) => setPostalCode(event.target.value)} />
            </label>
            <label className="field">
              <span>Rua</span>
              <input value={street} onChange={(event) => setStreet(event.target.value)} />
            </label>
          </div>

          <div className="grid-two compact-grid">
            <label className="field">
              <span>Número</span>
              <input value={number} onChange={(event) => setNumber(event.target.value)} />
            </label>
            <label className="field">
              <span>Bairro</span>
              <input
                value={neighborhood}
                onChange={(event) => setNeighborhood(event.target.value)}
              />
            </label>
          </div>

          <div className="grid-three compact-grid">
            <label className="field field-span-2">
              <span>Cidade</span>
              <input value={city} onChange={(event) => setCity(event.target.value)} />
            </label>
            <label className="field">
              <span>UF</span>
              <input value={state} onChange={(event) => setState(event.target.value)} maxLength={2} />
            </label>
          </div>

          <label className="field">
            <span>Complemento</span>
            <input
              value={complement}
              onChange={(event) => setComplement(event.target.value)}
            />
          </label>
        </section>

        <section className="customer-form-card">
          <div className="customer-form-card-header">
            <h3 className="customer-form-card-title">Observações</h3>
          </div>

          <label className="field">
            <span>Notas internas</span>
            <textarea
              className="textarea customer-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={6}
            />
          </label>
        </section>
      </div>

      <div className="customer-form-actions">
        <div className="customer-form-actions-left">
          {initialData && onDelete ? (
            <button
              type="button"
              className="ghost-button ghost-button-danger ghost-button-danger-muted"
              onClick={() => void onDelete()}
            >
              Excluir cliente
            </button>
          ) : null}
        </div>
        <div className="customer-form-actions-right">
          {onCancel ? (
            <button type="button" className="ghost-button" onClick={onCancel}>
              Cancelar
            </button>
          ) : null}
          <button type="submit" className="primary-button customer-submit-button" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : "Salvar cliente"}
          </button>
        </div>
      </div>
    </form>
  );
}
