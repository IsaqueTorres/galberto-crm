import type { FormEvent } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../modules/auth/use-auth";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate("/", { replace: true });
    } catch (error) {
      const message =
        error instanceof Error && error.message === "Credenciais inválidas"
          ? "Email ou senha inválidos."
          : "Não foi possível entrar. Tente novamente.";

      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-layout">
      <section className="auth-stage">
        <div className="auth-brand">
          <div className="brand-mark auth-brand-mark">G</div>
          <span className="eyebrow">Sistema CRM</span>
          <p className="auth-brand-copy">Base operacional sólida para clientes, interações e tarefas.</p>
        </div>

        <section className="auth-panel">
          <div className="auth-copy">
            <span className="eyebrow">Acesso seguro</span>
          <h1>Entrar no CRM</h1>
          <p>Use seu email corporativo e sua senha para acessar a área interna.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="field">
              <span>Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@cliente.com"
                autoComplete="email"
                required
              />
            </label>

            <label className="field">
              <span>Senha</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </label>

            {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

            <button type="submit" className="primary-button" disabled={isSubmitting}>
              {isSubmitting ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </section>
      </section>
    </main>
  );
}
