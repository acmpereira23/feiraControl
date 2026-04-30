import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  type CreateEmployeePayload,
  type CreateEmployeePaymentPayload,
  type Employee,
  type EmployeeStatus,
} from "../lib/api";
import { getTodayDate } from "../lib/date";
import {
  hasFieldErrors,
  type FieldErrors,
  validateEmployee,
  validateEmployeePayment,
} from "../lib/validation";
import { FeedbackMessage } from "./FeedbackMessage";

type EmployeesWorkspaceProps = {
  activeScreen: "create" | "list" | "payment";
  createErrorMessage: string | null;
  createSuccessMessage: string | null;
  employees: Employee[];
  isCreatingEmployee: boolean;
  isLoadingEmployees: boolean;
  isPayingEmployee: boolean;
  onCreateEmployee: (payload: CreateEmployeePayload) => Promise<void>;
  onCreatePayment: (payload: CreateEmployeePaymentPayload) => Promise<void>;
  onInteraction?: () => void;
  paymentErrorMessage: string | null;
  paymentSuccessMessage: string | null;
};

const statusOptions: Array<{ label: string; value: EmployeeStatus }> = [
  { label: "Ativo", value: "ACTIVE" },
  { label: "Inativo", value: "INACTIVE" },
];

function createInitialEmployeeState(): CreateEmployeePayload {
  return {
    name: "",
    documentNumber: "",
    role: "",
    defaultDailyRate: undefined,
    hiredOn: "",
    status: "ACTIVE",
  };
}

function createInitialPaymentState(): CreateEmployeePaymentPayload {
  return {
    employeeId: "",
    amount: 0,
    paidOn: getTodayDate(),
    notes: "",
  };
}

export function EmployeesWorkspace({
  activeScreen,
  createErrorMessage,
  createSuccessMessage,
  employees,
  isCreatingEmployee,
  isLoadingEmployees,
  isPayingEmployee,
  onCreateEmployee,
  onCreatePayment,
  onInteraction,
  paymentErrorMessage,
  paymentSuccessMessage,
}: EmployeesWorkspaceProps) {
  const [employeeState, setEmployeeState] = useState<CreateEmployeePayload>(() => createInitialEmployeeState());
  const [paymentState, setPaymentState] = useState<CreateEmployeePaymentPayload>(() => createInitialPaymentState());
  const [employeeErrors, setEmployeeErrors] = useState<
    FieldErrors<"name" | "defaultDailyRate" | "status">
  >({});
  const [paymentErrors, setPaymentErrors] = useState<
    FieldErrors<"employeeId" | "amount" | "paidOn">
  >({});

  const activeEmployees = useMemo(
    () => employees.filter((employee) => employee.status === "ACTIVE"),
    [employees],
  );
  const inactiveEmployeesCount = employees.length - activeEmployees.length;

  async function handleCreateEmployee(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateEmployee(employeeState);
    setEmployeeErrors(nextErrors);
    if (hasFieldErrors(nextErrors)) {
      queueMicrotask(() => {
        if (nextErrors.name) {
          document.querySelector<HTMLInputElement>('input[name="employeeName"]')?.focus();
          return;
        }

        if (nextErrors.defaultDailyRate) {
          document.querySelector<HTMLInputElement>('input[name="defaultDailyRate"]')?.focus();
        }
      });
      return;
    }

    await onCreateEmployee({
      name: employeeState.name.trim(),
      documentNumber: normalizeOptional(employeeState.documentNumber),
      role: normalizeOptional(employeeState.role),
      defaultDailyRate: employeeState.defaultDailyRate,
      hiredOn: normalizeOptional(employeeState.hiredOn),
      status: employeeState.status,
    });
    setEmployeeState(createInitialEmployeeState());
    setEmployeeErrors({});
  }

  async function handleCreatePayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateEmployeePayment(paymentState);
    setPaymentErrors(nextErrors);
    if (hasFieldErrors(nextErrors)) {
      queueMicrotask(() => {
        if (nextErrors.employeeId) {
          document.querySelector<HTMLSelectElement>('select[name="employeeId"]')?.focus();
          return;
        }

        if (nextErrors.amount) {
          document.querySelector<HTMLInputElement>('input[name="paymentAmount"]')?.focus();
          return;
        }

        if (nextErrors.paidOn) {
          document.querySelector<HTMLInputElement>('input[name="paymentDate"]')?.focus();
        }
      });
      return;
    }

    await onCreatePayment({
      employeeId: paymentState.employeeId,
      amount: paymentState.amount,
      paidOn: paymentState.paidOn,
      notes: normalizeOptional(paymentState.notes),
    });
    setPaymentState((current) => ({
      ...createInitialPaymentState(),
      employeeId: current.employeeId,
    }));
    setPaymentErrors({});
  }

  return (
    <div className="grid gap-6">
      {activeScreen === "create" ? (
        <WorkspaceCard
          eyebrow="Equipe"
          title="Cadastrar funcionario"
          description="Tela dedicada para montar a base da operacao com clareza, sem misturar cadastro com consulta e pagamento."
        >
          <form className="mt-7 space-y-6 sm:space-y-7" onSubmit={handleCreateEmployee}>
            <div className="grid gap-2.5 sm:grid-cols-2">
              <FormBadge label="Obrigatorio" text="Nome e status operacional" tone="primary" />
              <FormBadge label="Opcional" text="Documento, funcao, diaria e admissao" tone="neutral" />
            </div>

            <FormBlock
              hint="Dados principais para identificar a pessoa na operacao e localizar rapidamente no historico."
              title="Identificacao"
            >
              <FieldGroup surface="strong">
                <Field
                  errorMessage={employeeErrors.name}
                  label="Nome"
                  name="employeeName"
                  onChange={(value) => {
                    onInteraction?.();
                    setEmployeeErrors((current) => ({ ...current, name: undefined }));
                    setEmployeeState((current) => ({ ...current, name: value }));
                  }}
                  placeholder="Ex.: Maria Clara"
                  value={employeeState.name}
                />
              </FieldGroup>

              <FieldGroup
                hint="Campos auxiliares para enriquecer o cadastro sem travar a operacao."
                title="Complementos do cadastro"
              >
                <div className="grid gap-5 lg:grid-cols-2 lg:gap-x-7">
                  <Field
                    label="Documento"
                    onChange={(value) => {
                      onInteraction?.();
                      setEmployeeState((current) => ({ ...current, documentNumber: value }));
                    }}
                    placeholder="CPF ou referencia interna"
                    value={employeeState.documentNumber ?? ""}
                  />
                  <Field
                    label="Funcao"
                    onChange={(value) => {
                      onInteraction?.();
                      setEmployeeState((current) => ({ ...current, role: value }));
                    }}
                    placeholder="Caixa, ajudante, cozinha…"
                    value={employeeState.role ?? ""}
                  />
                </div>
              </FieldGroup>
            </FormBlock>

            <FormBlock
              hint="Informacoes opcionais para dar contexto financeiro e de rotina ao time."
              title="Parametros operacionais"
            >
              <FieldGroup
                hint="Esses dados ajudam na leitura financeira e no controle da equipe."
                title="Base de operacao"
              >
                <div className="grid gap-5 lg:grid-cols-2 lg:gap-x-7">
                  <Field
                    errorMessage={employeeErrors.defaultDailyRate}
                    label="Diaria padrao"
                    min="0.01"
                    name="defaultDailyRate"
                    onChange={(value) => {
                      onInteraction?.();
                      setEmployeeErrors((current) => ({ ...current, defaultDailyRate: undefined }));
                      setEmployeeState((current) => ({
                        ...current,
                        defaultDailyRate: value ? Number(value) : undefined,
                      }));
                    }}
                    placeholder="0,00"
                    step="0.01"
                    type="number"
                    value={employeeState.defaultDailyRate ? String(employeeState.defaultDailyRate) : ""}
                  />
                  <Field
                    label="Admissao"
                    onChange={(value) => {
                      onInteraction?.();
                      setEmployeeState((current) => ({ ...current, hiredOn: value }));
                    }}
                    type="date"
                    value={employeeState.hiredOn ?? ""}
                  />
                </div>
              </FieldGroup>

              <FieldGroup
                hint="Defina se a pessoa ja pode aparecer no fluxo de pagamento."
                title="Status do cadastro"
                surface="soft"
              >
                <div className="grid gap-3 md:grid-cols-2">
                  {statusOptions.map((option) => (
                    <ChoiceButton
                      key={option.value}
                      active={employeeState.status === option.value}
                      label={option.label}
                      onClick={() => {
                        onInteraction?.();
                        setEmployeeErrors((current) => ({ ...current, status: undefined }));
                        setEmployeeState((current) => ({ ...current, status: option.value }));
                      }}
                    />
                  ))}
                </div>
              </FieldGroup>
            </FormBlock>

            <ActionPanel>
              {createErrorMessage ? <FeedbackMessage message={createErrorMessage} role="alert" tone="error" /> : null}
              {createSuccessMessage ? <FeedbackMessage message={createSuccessMessage} tone="success" /> : null}

              <button
                className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[var(--accent-strong)] px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:brightness-105 hover:shadow-[var(--shadow-float)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isCreatingEmployee}
                type="submit"
              >
                {isCreatingEmployee ? "Salvando funcionario…" : "Cadastrar funcionario"}
              </button>
            </ActionPanel>
          </form>
        </WorkspaceCard>
      ) : null}

      {activeScreen === "payment" ? (
        <WorkspaceCard
          eyebrow="Pagamento"
          title="Registrar repasse"
          description="Tela dedicada para repasse. O pagamento sai daqui e a despesa correspondente entra no caixa automaticamente."
        >
          <form className="mt-7 space-y-6 sm:space-y-7" onSubmit={handleCreatePayment}>
            <div className="grid gap-2.5 sm:grid-cols-2">
              <FormBadge label="Destino" text="Selecionar funcionario ativo" tone="primary" />
              <FormBadge label="Lancamento" text="Valor, data e observacao do repasse" tone="neutral" />
            </div>

            <FormBlock
              hint="Defina com clareza quem recebeu antes de registrar a saida no caixa."
              title="Destino do pagamento"
            >
              <FieldGroup
                hint="Apenas funcionarios ativos aparecem aqui para evitar repasse em cadastro indisponivel."
                surface="strong"
              >
                <SelectField
                  disabled={isLoadingEmployees || activeEmployees.length === 0}
                  errorMessage={paymentErrors.employeeId}
                  label="Funcionario"
                  name="employeeId"
                  onChange={(value) => {
                    onInteraction?.();
                    setPaymentErrors((current) => ({ ...current, employeeId: undefined }));
                    setPaymentState((current) => ({ ...current, employeeId: value }));
                  }}
                  value={paymentState.employeeId}
                >
                  <option value="">
                    {isLoadingEmployees
                      ? "Carregando equipe…"
                      : activeEmployees.length === 0
                        ? "Cadastre um funcionario ativo primeiro"
                        : "Selecione quem recebeu"}
                  </option>
                  {activeEmployees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name}
                    </option>
                  ))}
                </SelectField>
              </FieldGroup>
            </FormBlock>

            <FormBlock
              hint="Esses dados viram um registro financeiro e alimentam o historico automaticamente."
              title="Lancamento do repasse"
            >
              <FieldGroup
                hint="Informe o valor e a data para que o caixa reflita o repasse com precisao."
                title="Dados financeiros"
              >
                <div className="grid gap-5 lg:grid-cols-2 lg:gap-x-7">
                  <Field
                    errorMessage={paymentErrors.amount}
                    label="Valor pago"
                    min="0.01"
                    name="paymentAmount"
                    onChange={(value) => {
                      onInteraction?.();
                      setPaymentErrors((current) => ({ ...current, amount: undefined }));
                      setPaymentState((current) => ({ ...current, amount: Number(value) }));
                    }}
                    placeholder="0,00"
                    step="0.01"
                    type="number"
                    value={paymentState.amount === 0 ? "" : String(paymentState.amount)}
                  />
                  <Field
                    errorMessage={paymentErrors.paidOn}
                    label="Data do pagamento"
                    name="paymentDate"
                    onChange={(value) => {
                      onInteraction?.();
                      setPaymentErrors((current) => ({ ...current, paidOn: undefined }));
                      setPaymentState((current) => ({ ...current, paidOn: value }));
                    }}
                    type="date"
                    value={paymentState.paidOn}
                  />
                </div>
              </FieldGroup>

              <FieldGroup
                hint="Use este campo para dar contexto ao repasse quando isso ajudar na conferência posterior."
                title="Observacao complementar"
                surface="soft"
              >
                <Field
                  label="Observacao"
                  onChange={(value) => {
                    onInteraction?.();
                    setPaymentState((current) => ({ ...current, notes: value }));
                  }}
                  placeholder="Pix, semana de teste, diaria de quarta…"
                  value={paymentState.notes ?? ""}
                />
              </FieldGroup>
            </FormBlock>

            <ActionPanel>
              {paymentErrorMessage ? <FeedbackMessage message={paymentErrorMessage} role="alert" tone="error" /> : null}
              {paymentSuccessMessage ? <FeedbackMessage message={paymentSuccessMessage} tone="success" /> : null}

              <button
                className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[var(--accent-income)] px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:brightness-105 hover:shadow-[var(--shadow-float)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isPayingEmployee || activeEmployees.length === 0}
                type="submit"
              >
                {isPayingEmployee ? "Registrando pagamento…" : "Registrar pagamento"}
              </button>
            </ActionPanel>
          </form>
        </WorkspaceCard>
      ) : null}

      {activeScreen === "list" ? (
        <WorkspaceCard
          eyebrow="Base ativa"
          title="Funcionarios cadastrados"
          description="Tela principal de consulta da equipe, separando leitura operacional do cadastro e do fluxo de repasse."
        >
          <div className="mt-7 space-y-5">
            {createSuccessMessage ? <FeedbackMessage message={createSuccessMessage} tone="success" /> : null}
            {paymentSuccessMessage ? <FeedbackMessage message={paymentSuccessMessage} tone="success" /> : null}

            <div className="grid gap-3 sm:grid-cols-3">
              <StatChip
                label="Total"
                tone="neutral"
                value={String(employees.length)}
              />
              <StatChip
                label="Ativos"
                tone="positive"
                value={String(activeEmployees.length)}
              />
              <StatChip
                label="Inativos"
                tone="negative"
                value={String(inactiveEmployeesCount)}
              />
            </div>

            {isLoadingEmployees ? (
              <div className="grid gap-3" data-testid="employees-loading">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="min-h-24 animate-pulse rounded-[1.4rem] border border-[var(--line-soft)] bg-[var(--card)]/80"
                  />
                ))}
              </div>
            ) : employees.length === 0 ? (
              <div className="rounded-[1.7rem] border border-dashed border-[var(--line-strong)] bg-[linear-gradient(180deg,rgba(248,243,236,0.95),rgba(241,233,221,0.9))] px-5 py-6 shadow-[var(--shadow-float)]" data-testid="employees-empty">
                <p className="text-lg font-semibold text-[var(--ink-strong)]">Nenhum funcionario cadastrado ainda.</p>
                <p className="mt-2 text-sm leading-7 text-[var(--ink-muted)]">
                  Cadastre a primeira pessoa da equipe para liberar o fluxo de pagamento direto pela aplicacao.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {employees.map((employee) => (
                  <article
                    key={employee.id}
                    className="min-w-0 rounded-[1.7rem] border border-[var(--line-soft)] bg-[linear-gradient(180deg,rgba(251,247,240,0.96),rgba(244,238,229,0.92))] px-4 py-4 shadow-[var(--shadow-float)] sm:px-5"
                    data-testid="employee-card"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 space-y-2">
                        <div className="space-y-1">
                          <p className="break-words font-serif text-[1.45rem] leading-tight text-[var(--ink-strong)] sm:text-[1.6rem]">
                            {employee.name}
                          </p>
                          <p className="break-words text-sm text-[var(--ink-muted)]">
                            {employee.role?.trim() || "Funcao nao informada"}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {employee.documentNumber ? (
                            <InlineBadge label={`Doc. ${employee.documentNumber}`} />
                          ) : null}
                          {employee.hiredOn ? (
                            <InlineBadge label={`Desde ${employee.hiredOn}`} />
                          ) : null}
                        </div>
                      </div>
                      <span
                        className={`inline-flex min-h-11 items-center justify-center self-start rounded-full px-4 text-xs font-semibold uppercase tracking-[0.2em] ${
                          employee.status === "ACTIVE"
                            ? "bg-[var(--accent-income-soft)] text-[var(--accent-income)]"
                            : "bg-[var(--accent-expense-soft)] text-[var(--accent-expense)]"
                        }`}
                      >
                        {employee.status === "ACTIVE" ? "Ativo" : "Inativo"}
                      </span>
                    </div>

                    <dl className="mt-5 grid gap-3 md:grid-cols-3">
                      <EmployeeMeta
                        label="Diaria"
                        value={employee.defaultDailyRate ? formatCurrency(employee.defaultDailyRate) : "Nao informada"}
                      />
                      <EmployeeMeta label="Documento" value={employee.documentNumber || "Nao informado"} />
                      <EmployeeMeta label="Admissao" value={employee.hiredOn || "Nao informada"} />
                    </dl>
                  </article>
                ))}
              </div>
            )}
          </div>
        </WorkspaceCard>
      ) : null}
    </div>
  );
}

function WorkspaceCard({
  children,
  description,
  eyebrow,
  title,
}: {
  children: ReactNode;
  description: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <section className="rounded-[2rem] border border-[var(--line-soft)] bg-[var(--paper)] p-5 shadow-[var(--shadow-panel)] sm:p-6 lg:p-7">
      <div className="flex flex-wrap items-center gap-2.5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ink-muted)]">{eyebrow}</p>
        <span className="inline-flex min-h-8 items-center rounded-full border border-[var(--line-soft)] bg-[var(--card)]/65 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--ink-muted)]">
          Tela dedicada
        </span>
      </div>
      <h3 className="mt-3 text-balance font-serif text-[1.85rem] leading-tight text-[var(--ink-strong)] sm:text-[2.4rem]">
        {title}
      </h3>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--ink-muted)]">{description}</p>
      {children}
    </section>
  );
}

function FormBlock({
  children,
  hint,
  title,
}: {
  children: ReactNode;
  hint: string;
  title: string;
}) {
  return (
    <section className="space-y-5 rounded-[1.5rem] border border-[var(--line-soft)] bg-[var(--card)]/78 p-4 sm:p-5">
      <div className="space-y-1">
        <h4 className="text-[13px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-strong)]">{title}</h4>
        <p className="text-sm leading-6 text-[var(--ink-muted)]">{hint}</p>
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

function ActionPanel({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-4 rounded-[1.5rem] border border-[var(--line-soft)] bg-[linear-gradient(180deg,rgba(251,247,240,0.88),rgba(244,238,229,0.98))] p-4 sm:p-5">
      {children}
    </div>
  );
}

function FormBadge({
  label,
  text,
  tone,
}: {
  label: string;
  text: string;
  tone: "neutral" | "primary";
}) {
  const toneClassName =
    tone === "primary"
      ? "border-[var(--accent-strong)]/20 bg-[rgba(164,87,42,0.1)]"
      : "border-[var(--line-soft)] bg-[rgba(255,255,255,0.42)]";

  return (
    <div className={`rounded-[1.2rem] border px-3.5 py-3 shadow-[var(--shadow-float)] ${toneClassName}`}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--ink-muted)]">{label}</p>
      <p className="mt-1 text-[13px] leading-5 text-[var(--ink-strong)]">{text}</p>
    </div>
  );
}

function FieldGroup({
  children,
  hint,
  surface = "neutral",
  title,
}: {
  children: ReactNode;
  hint?: string;
  surface?: "neutral" | "soft" | "strong";
  title?: string;
}) {
  const surfaceClassName = {
    neutral: "bg-[rgba(255,255,255,0.38)]",
    soft: "bg-[rgba(244,237,225,0.72)]",
    strong: "bg-[rgba(255,250,243,0.7)]",
  }[surface];

  return (
    <div className={`space-y-4 rounded-[1.35rem] border border-[var(--line-soft)] p-4 sm:p-5 ${surfaceClassName}`}>
      {title || hint ? (
        <div className="space-y-1">
          {title ? (
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--ink-muted)]">{title}</p>
          ) : null}
          {hint ? <p className="text-sm leading-6 text-[var(--ink-muted)]">{hint}</p> : null}
        </div>
      ) : null}
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function StatChip({
  label,
  tone,
  value,
}: {
  label: string;
  tone: "negative" | "neutral" | "positive";
  value: string;
}) {
  const toneClassName = {
    neutral: "border-[var(--line-soft)] bg-[var(--card)] text-[var(--ink-strong)]",
    positive: "border-[var(--accent-income-soft)] bg-[rgba(31,122,78,0.08)] text-[var(--accent-income)]",
    negative: "border-[var(--accent-expense-soft)] bg-[rgba(170,71,56,0.08)] text-[var(--accent-expense)]",
  }[tone];

  return (
    <div className={`rounded-[1.35rem] border px-4 py-4 shadow-[var(--shadow-float)] ${toneClassName}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] opacity-80">{label}</p>
      <p className="mt-2 font-serif text-[1.8rem] leading-none">{value}</p>
    </div>
  );
}

function InlineBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex min-h-9 items-center rounded-full border border-[var(--line-soft)] bg-[var(--paper)] px-3 text-xs font-medium text-[var(--ink-muted)]">
      {label}
    </span>
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
      className={`min-h-[3.15rem] rounded-[1.1rem] border px-4 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--focus-ring)] sm:min-h-[3.25rem] sm:rounded-[1.2rem] ${
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
  return (
    <label className="grid gap-2.5 text-sm text-[var(--ink-muted)]">
      <span className="font-medium text-[var(--ink-strong)]">{label}</span>
      <input
        aria-invalid={errorMessage ? "true" : "false"}
        autoComplete={type === "date" ? "off" : undefined}
        className={`min-h-[3.25rem] rounded-[1.15rem] border bg-[var(--paper)] px-4 text-[15px] text-[var(--ink-strong)] shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--focus-ring)] focus:shadow-[var(--shadow-float)] ${
          errorMessage
            ? "border-[var(--accent-expense)] text-rose-900 focus:border-[var(--accent-expense)]"
            : "border-[var(--line-soft)] focus:border-[var(--accent-strong)]"
        }`}
        min={min}
        name={name}
        onChange={(event) => onChange(event.target.value)}
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
  children,
  disabled,
  errorMessage,
  label,
  name,
  onChange,
  value,
}: {
  children: ReactNode;
  disabled?: boolean;
  errorMessage?: string;
  label: string;
  name?: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="grid gap-2.5 text-sm text-[var(--ink-muted)]">
      <span className="font-medium text-[var(--ink-strong)]">{label}</span>
      <select
        aria-invalid={errorMessage ? "true" : "false"}
        className={`min-h-[3.25rem] rounded-[1.15rem] border bg-[var(--paper)] px-4 text-[15px] text-[var(--ink-strong)] shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--focus-ring)] focus:shadow-[var(--shadow-float)] ${
          errorMessage
            ? "border-[var(--accent-expense)] text-rose-900 focus:border-[var(--accent-expense)]"
            : "border-[var(--line-soft)] focus:border-[var(--accent-strong)]"
        } disabled:cursor-not-allowed disabled:opacity-60`}
        disabled={disabled}
        name={name}
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {children}
      </select>
      {errorMessage ? <span className="text-sm text-rose-700">{errorMessage}</span> : null}
    </label>
  );
}

function EmployeeMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-[1.15rem] border border-[var(--line-soft)] bg-[var(--paper)] px-3 py-3.5">
      <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--ink-muted)]">{label}</dt>
      <dd className="mt-2 break-words text-sm leading-6 text-[var(--ink-strong)]">{value}</dd>
    </div>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function normalizeOptional(value?: string) {
  if (!value) {
    return undefined;
  }

  const normalized = value.trim();
  return normalized ? normalized : undefined;
}
