import type { FormEvent } from "react";
import { useState } from "react";
import type {
  InteractionPayload,
  InteractionType,
} from "../modules/interactions/interactions.types";

type InteractionFormProps = {
  isSubmitting?: boolean;
  onSubmit: (payload: InteractionPayload) => Promise<void>;
};

const interactionTypeOptions: Array<{ value: InteractionType; label: string }> = [
  { value: "note", label: "Nota" },
  { value: "call", label: "Ligação" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "email", label: "Email" },
  { value: "visit", label: "Visita" },
];

export function InteractionForm({
  isSubmitting = false,
  onSubmit,
}: InteractionFormProps) {
  const [type, setType] = useState<InteractionType>("note");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await onSubmit({
      type,
      subject,
      description,
    });

    setType("note");
    setSubject("");
    setDescription("");
  }

  return (
    <form className="panel form-grid" onSubmit={handleSubmit}>
      <div className="grid-two">
        <label className="field">
          <span>Tipo</span>
          <select value={type} onChange={(event) => setType(event.target.value as InteractionType)}>
            {interactionTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Assunto</span>
          <input value={subject} onChange={(event) => setSubject(event.target.value)} />
        </label>
      </div>

      <label className="field">
        <span>Descrição</span>
        <textarea
          className="textarea"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={4}
          required
        />
      </label>

      <div className="form-actions">
        <button type="submit" className="primary-button" disabled={isSubmitting}>
          {isSubmitting ? "Registrando..." : "Registrar interação"}
        </button>
      </div>
    </form>
  );
}
