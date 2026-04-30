import { useState, type FormEvent } from "react";
import { FeedbackMessage } from "./FeedbackMessage";
import type { CashMovementPayload, CashMovementType, FairLocation } from "../lib/api";
import { getTodayDate } from "../lib/date";
import {
  hasFieldErrors,
  type FieldErrors,
  validateCashMovement,
} from "../lib/validation";

type CashComposerProps = {
  errorMessage: string | null;
  fairLocations: FairLocation[];
  isLoadingLocations: boolean;
  isSaving: boolean;
  onInteraction?: () => void;
  onSubmit: (payload: CashMovementPayload) => Promise<void>;
  successMessage: string | null;
};

function createInitialState(): CashMovementPayload {
  return {
    type: "INCOME",
    description: "",
    amount: 0,
    occurredOn: getTodayDate(),
  };
}

export function CashComposer({
  errorMessage,
  fairLocations,
  isLoadingLocations,
  isSaving,
  onInteraction,
  onSubmit,
  successMessage,
}: CashComposerProps) {
  const [formState, setFormState] = useState<CashMovementPayload>(() => createInitialState());
  const [fieldErrors, setFieldErrors] = useState<
    FieldErrors<"description" | "amount" | "occurredOn">
  >({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateCashMovement(formState);
    setFieldErrors(nextErrors);
    if (hasFieldErrors(nextErrors)) {
      queueMicrotask(() => {
        if (nextErrors.description) {
          document.querySelector<HTMLInputElement>('input[name="description"]')?.focus();
          return;
        }

        if (nextErrors.amount) {
          document.querySelector<HTMLInputElement>('input[name="amount"]')?.focus();
          return;
        }

        if (nextErrors.occurredOn) {
          document.querySelector<HTMLInputElement>('input[name="occurredOn"]')?.focus();
        }
      });
      return;
    }

    await onSubmit(formState);
    setFormState(createInitialState());
    setFieldErrors({});
  }

  return (
    <section className="rounded-[2rem] border border-[var(--line-soft)] bg-[var(--paper)] p-5 shadow-[var(--shadow-panel)] sm:p-6 lg:p-7">
      <div className="flex flex-wrap items-center gap-2.5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ink-muted)]">Novo lancamento</p>
        <span className="inline-flex min-h-8 items-center rounded-full border border-[var(--accent-strong)]/20 bg-[rgba(164,87,42,0.1)] px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
          Tela dedicada
        </span>
      </div>
      <h3 className="mt-3 text-balance font-serif text-[1.9rem] leading-tight text-[var(--ink-strong)] sm:text-[2.4rem]">
        Registrar entrada ou saida sem perder o ritmo
      </h3>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--ink-muted)]">
        Use esta tela apenas para lancamento. O historico fica separado para evitar competicao visual e reduzir erro operacional.
      </p>

      <form className="mt-7 space-y-5 sm:mt-8 sm:space-y-6" onSubmit={handleSubmit}>
        <FormBlock
          hint="Escolha se a anotacao reforca o caixa ou se representa uma saida operacional."
          title="Tipo de lancamento"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <ChoiceButton
              active={formState.type === "INCOME"}
              label="Entrada"
              onClick={() => {
                onInteraction?.();
                setFormState((current) => ({ ...current, type: "INCOME" }));
              }}
            />
            <ChoiceButton
              active={formState.type === "EXPENSE"}
              label="Saida"
              onClick={() => {
                onInteraction?.();
                setFormState((current) => ({ ...current, type: "EXPENSE" }));
              }}
            />
          </div>
        </FormBlock>

        <FormBlock
          hint="Descricao, valor e data entram direto no historico usado pelo dashboard."
          title="Dados da movimentacao"
        >
          <Field
            errorMessage={fieldErrors.description}
            label="Descricao"
            name="description"
            onChange={(value) => {
              onInteraction?.();
              setFieldErrors((current) => ({ ...current, description: undefined }));
              setFormState((current) => ({ ...current, description: value }));
            }}
            placeholder="Venda no almoco, compra de insumo, taxa da feira…"
            value={formState.description}
          />

          <div className="grid gap-y-4 md:grid-cols-2 md:gap-x-6">
            <Field
              errorMessage={fieldErrors.amount}
              label="Valor"
              min="0.01"
              name="amount"
              onChange={(value) => {
                onInteraction?.();
                setFieldErrors((current) => ({ ...current, amount: undefined }));
                setFormState((current) => ({ ...current, amount: Number(value) }));
              }}
              placeholder="0,00…"
              step="0.01"
              type="number"
              value={formState.amount === 0 ? "" : String(formState.amount)}
            />
            <Field
              errorMessage={fieldErrors.occurredOn}
              label="Data"
              name="occurredOn"
              onChange={(value) => {
                onInteraction?.();
                setFieldErrors((current) => ({ ...current, occurredOn: undefined }));
                setFormState((current) => ({ ...current, occurredOn: value }));
              }}
              type="date"
              value={formState.occurredOn}
            />
          </div>
        </FormBlock>

        <FormBlock
          hint="Vincule o lancamento a uma feira quando ele fizer parte da operacao daquele ponto. O campo continua opcional."
          title="Contexto do local"
        >
          {isLoadingLocations ? (
            <div
              className="rounded-[1.3rem] border border-[var(--line-soft)] bg-[var(--card)]/75 px-4 py-4 text-sm leading-6 text-[var(--ink-muted)]"
              data-testid="cash-location-loading"
            >
              Carregando locais cadastrados para vincular esta movimentacao.
            </div>
          ) : fairLocations.length === 0 ? (
            <div
              className="rounded-[1.4rem] border border-dashed border-[var(--line-strong)] bg-[linear-gradient(180deg,rgba(248,243,236,0.92),rgba(241,233,221,0.88))] px-4 py-4 text-sm leading-6 text-[var(--ink-muted)]"
              data-testid="cash-location-empty"
            >
              Nenhum local cadastrado ainda. O lancamento pode seguir sem local vinculado.
            </div>
          ) : (
            <SelectField
              hint="Use esta vinculacao para alimentar o caixa por local e melhorar as leituras futuras do dashboard."
              label="Local da feira"
              name="fairLocationId"
              onChange={(value) => {
                onInteraction?.();
                setFormState((current) => ({
                  ...current,
                  fairLocationId: value || undefined,
                }));
              }}
              options={[
                { label: "Sem local vinculado", value: "" },
                ...fairLocations.map((location) => ({
                  label: `${location.name} • ${location.city}/${location.state}`,
                  value: location.id,
                })),
              ]}
              value={formState.fairLocationId ?? ""}
            />
          )}
        </FormBlock>

        <ActionPanel>
          {errorMessage ? <FeedbackMessage message={errorMessage} role="alert" tone="error" /> : null}
          {successMessage ? <FeedbackMessage message={successMessage} tone="success" /> : null}

          <button
            className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[var(--accent-strong)] px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:brightness-105 hover:shadow-[var(--shadow-float)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSaving}
            type="submit"
          >
            {isSaving ? "Registrando…" : "Registrar movimentacao"}
          </button>
        </ActionPanel>
      </form>
    </section>
  );
}

function FormBlock({
  children,
  hint,
  title,
}: {
  children: React.ReactNode;
  hint: string;
  title: string;
}) {
  return (
    <section className="space-y-5 rounded-[1.5rem] border border-[var(--line-soft)] bg-[var(--card)]/78 p-4 sm:p-5">
      <div className="space-y-1">
        <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--ink-strong)]">{title}</h4>
        <p className="text-sm leading-6 text-[var(--ink-muted)]">{hint}</p>
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

function ActionPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-4 rounded-[1.5rem] border border-[var(--line-soft)] bg-[linear-gradient(180deg,rgba(251,247,240,0.88),rgba(244,238,229,0.98))] p-4 sm:p-5">
      {children}
    </div>
  );
}

function ChoiceButton({
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
      className={`min-h-12 rounded-[1.1rem] border px-4 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--focus-ring)] sm:rounded-[1.2rem] ${
        active
          ? "border-transparent bg-[var(--ink-strong)] text-[var(--paper)]"
          : "border-[var(--line-soft)] bg-[var(--card)] text-[var(--ink-muted)] hover:border-[var(--accent-strong)] hover:text-[var(--ink-strong)]"
      }`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

function Field({
  errorMessage,
  label,
  min,
  name,
  onChange,
  placeholder,
  step,
  type = "text",
  value,
}: {
  errorMessage?: string;
  label: string;
  min?: string;
  name?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  step?: string;
  type?: "date" | "number" | "text";
  value: string;
}) {
  const inputId = name ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <label className="grid gap-2.5 text-sm text-[var(--ink-muted)]" htmlFor={inputId}>
      <span className="font-medium text-[var(--ink-strong)]">{label}</span>
      <input
        aria-invalid={errorMessage ? "true" : "false"}
        autoComplete={type === "date" ? "off" : undefined}
        className={`min-h-12 rounded-[1.15rem] border bg-[var(--paper)] px-4 text-[var(--ink-strong)] shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--focus-ring)] focus:shadow-[var(--shadow-float)] ${
          errorMessage
            ? "border-[var(--accent-expense)] text-rose-900 focus:border-[var(--accent-expense)]"
            : "border-[var(--line-soft)] focus:border-[var(--accent-strong)]"
        }`}
        id={inputId}
        min={min}
        name={name}
        onChange={(event) => {
          onChange(event.target.value);
        }}
        placeholder={placeholder}
        step={step}
        type={type}
        value={value}
      />
      {errorMessage ? <span className="text-sm text-rose-700">{errorMessage}</span> : null}
    </label>
  );
}

function SelectField({
  hint,
  label,
  name,
  onChange,
  options,
  value,
}: {
  hint?: string;
  label: string;
  name?: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  value: string;
}) {
  const selectId = name ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <label className="grid gap-2.5 text-sm text-[var(--ink-muted)]" htmlFor={selectId}>
      <span className="font-medium text-[var(--ink-strong)]">{label}</span>
      <select
        className="min-h-12 rounded-[1.15rem] border border-[var(--line-soft)] bg-[var(--paper)] px-4 text-[var(--ink-strong)] shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--focus-ring)] focus:border-[var(--accent-strong)] focus:shadow-[var(--shadow-float)]"
        id={selectId}
        name={name}
        onChange={(event) => {
          onChange(event.target.value);
        }}
        value={value}
      >
        {options.map((option) => (
          <option key={option.value || "empty"} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hint ? <p className="text-sm leading-6 text-[var(--ink-muted)]">{hint}</p> : null}
    </label>
  );
}
