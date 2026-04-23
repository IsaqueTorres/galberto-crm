import type { FormEvent } from "react";
import { useState } from "react";
import type { Customer, CustomerPayload } from "../modules/customers/customers.types";

type CustomerFormProps = {
  initialData?: Customer | null;
  isSubmitting?: boolean;
  onSubmit: (payload: CustomerPayload) => Promise<void>;
  onCancel?: () => void;
};

export function CustomerForm({
  initialData,
  isSubmitting = false,
  onSubmit,
  onCancel,
}: CustomerFormProps) {
  const [name, setName] = useState(initialData?.name ?? "");
  const [companyName, setCompanyName] = useState(initialData?.companyName ?? "");
  const [document, setDocument] = useState(initialData?.document ?? "");
  const [email, setEmail] = useState(initialData?.email ?? "");
  const [phone, setPhone] = useState(initialData?.phone ?? "");
  const [whatsapp, setWhatsapp] = useState(initialData?.whatsapp ?? "");
  const [notes, setNotes] = useState(initialData?.notes ?? "");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await onSubmit({
      name,
      companyName,
      document,
      email,
      phone,
      whatsapp,
      notes,
    });
  }

  return (
    <form className="panel form-grid" onSubmit={handleSubmit}>
      <div className="grid-two">
        <label className="field">
          <span>Nome</span>
          <input value={name} onChange={(event) => setName(event.target.value)} required />
        </label>
        <label className="field">
          <span>Empresa</span>
          <input
            value={companyName}
            onChange={(event) => setCompanyName(event.target.value)}
          />
        </label>
      </div>

      <div className="grid-two">
        <label className="field">
          <span>Documento</span>
          <input value={document} onChange={(event) => setDocument(event.target.value)} />
        </label>
        <label className="field">
          <span>Email</span>
          <input value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
      </div>

      <div className="grid-two">
        <label className="field">
          <span>Telefone</span>
          <input value={phone} onChange={(event) => setPhone(event.target.value)} />
        </label>
        <label className="field">
          <span>WhatsApp</span>
          <input value={whatsapp} onChange={(event) => setWhatsapp(event.target.value)} />
        </label>
      </div>

      <label className="field">
        <span>Observações</span>
        <textarea
          className="textarea"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={4}
        />
      </label>

      <div className="form-actions">
        {onCancel ? (
          <button type="button" className="ghost-button" onClick={onCancel}>
            Cancelar
          </button>
        ) : null}
        <button type="submit" className="primary-button" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : initialData ? "Salvar alterações" : "Criar cliente"}
        </button>
      </div>
    </form>
  );
}
