import { useState, type FormEvent } from "react";
import { FeedbackMessage } from "./FeedbackMessage";
import type { LoginPayload, RegisterPayload } from "../lib/api";
import {
  hasFieldErrors,
  type FieldErrors,
  validateLogin,
  validateRegister,
} from "../lib/validation";

type AuthScreenProps = {
  busy: boolean;
  errorMessage: string | null;
  noticeMessage: string | null;
  onInteraction?: () => void;
  onLogin: (payload: LoginPayload) => Promise<void>;
  onRegister: (payload: RegisterPayload) => Promise<void>;
};

type Mode = "login" | "register";

const initialRegister: RegisterPayload = {
  fullName: "",
  email: "",
  password: "",
};

const initialLogin: LoginPayload = {
  email: "",
  password: "",
};

export function AuthScreen({
  busy,
  errorMessage,
  noticeMessage,
  onInteraction,
  onLogin,
  onRegister,
}: AuthScreenProps) {
  const [mode, setMode] = useState<Mode>("login");
  const [loginForm, setLoginForm] = useState<LoginPayload>(initialLogin);
  const [registerForm, setRegisterForm] = useState<RegisterPayload>(initialRegister);
  const [loginErrors, setLoginErrors] = useState<FieldErrors<"email" | "password">>({});
  const [registerErrors, setRegisterErrors] = useState<
    FieldErrors<"fullName" | "email" | "password">
  >({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mode === "login") {
      const nextErrors = validateLogin(loginForm);
      setLoginErrors(nextErrors);
      if (hasFieldErrors(nextErrors)) {
        return;
      }

      await onLogin(loginForm);
      return;
    }

    const nextErrors = validateRegister(registerForm);
    setRegisterErrors(nextErrors);
    if (hasFieldErrors(nextErrors)) {
      return;
    }

    await onRegister(registerForm);
  }

  return (
    <main className="min-h-screen bg-[var(--canvas)] px-4 py-6 text-[var(--ink-strong)] sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <section className="relative overflow-hidden rounded-[2rem] border border-[var(--line-soft)] bg-[linear-gradient(155deg,rgba(251,247,240,0.98),rgba(232,223,209,0.92))] p-6 shadow-[var(--shadow-panel)] sm:rounded-[2.4rem] sm:p-8 lg:p-10">
          <div className="absolute -right-20 top-6 h-40 w-40 rounded-full bg-[var(--accent-soft)] blur-3xl sm:-right-16 sm:top-8 sm:h-48 sm:w-48" />
          <div className="absolute bottom-0 left-0 h-32 w-full bg-[radial-gradient(circle_at_bottom_left,rgba(31,122,78,0.12),transparent_55%)] sm:h-40" />

          <p className="relative text-xs font-semibold uppercase tracking-[0.32em] text-[var(--ink-muted)]">
            FeiraControl
          </p>
          <h1 className="relative mt-4 max-w-3xl text-balance font-serif text-[2.85rem] leading-[0.92] text-[var(--ink-strong)] sm:text-6xl">
            O caixa da feira em uma pagina que parece feita para a sua rotina.
          </h1>
          <p className="relative mt-5 max-w-2xl text-[0.98rem] leading-7 text-[var(--ink-muted)] sm:mt-6 sm:text-lg">
            Crie seu acesso, registre entradas e saidas e acompanhe o lucro sem planilha
            paralela e sem caderno perdido.
          </p>

          <div className="relative mt-8 grid gap-4 sm:mt-10 sm:grid-cols-3">
            <FeatureCard
              title="Sessao direta"
              text="Cadastro inicial e login no mesmo fluxo, com acesso protegido para sua operacao."
            />
            <FeatureCard
              title="Lucro do periodo"
              text="Dashboard enxuto para ver entradas, saidas e resultado financeiro sem calculo manual."
            />
            <FeatureCard
              title="Caixa vivo"
              text="Registre movimentacoes durante a operacao e revise o historico do periodo filtrado."
            />
          </div>
        </section>

        <section className="rounded-[2rem] border border-[var(--line-soft)] bg-[var(--paper)] p-5 shadow-[var(--shadow-panel)] sm:rounded-[2.4rem] sm:p-8">
          <div className="flex items-center gap-3 rounded-full border border-[var(--line-soft)] bg-[var(--card)] p-1">
            <ModeButton
              active={mode === "login"}
              label="Entrar"
              onClick={() => {
                onInteraction?.();
                setMode("login");
              }}
            />
            <ModeButton
              active={mode === "register"}
              label="Criar acesso"
              onClick={() => {
                onInteraction?.();
                setMode("register");
              }}
            />
          </div>

          <form className="mt-8 space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
            {mode === "register" ? (
              <>
                <Field
                  autoComplete="name"
                  errorMessage={registerErrors.fullName}
                  label="Responsavel"
                  name="fullName"
                  onChange={(value) => {
                    onInteraction?.();
                    setRegisterErrors((current) => ({ ...current, fullName: undefined }));
                    setRegisterForm((current) => ({ ...current, fullName: value }));
                  }}
                  placeholder="Rosana Lima…"
                  value={registerForm.fullName}
                />
              </>
            ) : null}

            <Field
              autoComplete={mode === "login" ? "email" : "username"}
              errorMessage={mode === "login" ? loginErrors.email : registerErrors.email}
              label="Email"
              name="email"
              onChange={(value) => {
                onInteraction?.();
                if (mode === "login") {
                  setLoginErrors((current) => ({ ...current, email: undefined }));
                  setLoginForm((current) => ({ ...current, email: value }));
                } else {
                  setRegisterErrors((current) => ({ ...current, email: undefined }));
                  setRegisterForm((current) => ({ ...current, email: value }));
                }
              }}
              placeholder="voce@negocio.com…"
              type="email"
              value={mode === "login" ? loginForm.email : registerForm.email}
            />
            <Field
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              errorMessage={mode === "login" ? loginErrors.password : registerErrors.password}
              label="Senha"
              name="password"
              onChange={(value) => {
                onInteraction?.();
                if (mode === "login") {
                  setLoginErrors((current) => ({ ...current, password: undefined }));
                  setLoginForm((current) => ({ ...current, password: value }));
                } else {
                  setRegisterErrors((current) => ({ ...current, password: undefined }));
                  setRegisterForm((current) => ({ ...current, password: value }));
                }
              }}
              placeholder="Minimo de 8 caracteres…"
              type="password"
              value={mode === "login" ? loginForm.password : registerForm.password}
            />

            {noticeMessage ? <FeedbackMessage message={noticeMessage} tone="info" /> : null}

            {errorMessage ? <FeedbackMessage message={errorMessage} role="alert" tone="error" /> : null}

            <button
              className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[var(--ink-strong)] px-5 text-sm font-semibold text-[var(--paper)] transition hover:-translate-y-0.5 hover:bg-[var(--accent-strong)] hover:shadow-[var(--shadow-float)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={busy}
              type="submit"
            >
              {busy ? "Processando…" : mode === "login" ? "Entrar na operacao" : "Criar conta e abrir o sistema"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

function FeatureCard({ text, title }: { text: string; title: string }) {
  return (
    <article className="rounded-[1.6rem] border border-[var(--line-soft)] bg-[var(--paper)]/70 p-4 shadow-[var(--shadow-float)] backdrop-blur">
      <h2 className="text-balance font-serif text-[1.7rem] leading-tight text-[var(--ink-strong)] sm:text-2xl">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-[var(--ink-muted)]">{text}</p>
    </article>
  );
}

function ModeButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`min-h-11 flex-1 rounded-full px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--focus-ring)] ${
        active
          ? "bg-[var(--ink-strong)] text-[var(--paper)]"
          : "text-[var(--ink-muted)] hover:bg-[rgba(251,247,240,0.8)] hover:text-[var(--ink-strong)]"
      }`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

function Field({
  autoComplete,
  errorMessage,
  label,
  name,
  onChange,
  placeholder,
  type = "text",
  value,
}: {
  autoComplete?: string;
  errorMessage?: string;
  label: string;
  name: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  value: string;
}) {
  return (
    <label className="grid gap-2 text-sm text-[var(--ink-muted)]">
      <span>{label}</span>
      <input
        autoComplete={autoComplete}
        aria-invalid={errorMessage ? "true" : "false"}
        className={`min-h-12 rounded-[1.2rem] border bg-[var(--card)] px-4 text-[var(--ink-strong)] transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--focus-ring)] focus:shadow-[var(--shadow-float)] ${
          errorMessage
            ? "border-[var(--accent-expense)] text-rose-900 focus:border-[var(--accent-expense)]"
            : "border-[var(--line-soft)] focus:border-[var(--accent-strong)]"
        }`}
        name={name}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        spellCheck={type === "email" ? false : undefined}
        type={type}
        value={value}
      />
      {errorMessage ? <span className="text-sm text-rose-700">{errorMessage}</span> : null}
    </label>
  );
}
