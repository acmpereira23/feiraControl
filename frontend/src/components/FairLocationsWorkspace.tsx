import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import type {
  CreateFairLocationPayload,
  FairLocation,
  FairLocationCashClosureSummary,
  OperatingDay,
} from "../lib/api";
import {
  hasFieldErrors,
  type FieldErrors,
  validateFairLocation,
} from "../lib/validation";
import { FeedbackMessage } from "./FeedbackMessage";

type FairLocationsWorkspaceProps = {
  activeScreen: "closure" | "create" | "list";
  closureErrorMessage: string | null;
  closurePeriod: {
    startDate: string;
    endDate: string;
  };
  closurePeriodError?: string | null;
  closureSelectedLocationId: string;
  closureSummary?: FairLocationCashClosureSummary;
  createErrorMessage: string | null;
  createSuccessMessage: string | null;
  isCreatingLocation: boolean;
  isLoadingClosure: boolean;
  isLoadingLocations: boolean;
  locations: FairLocation[];
  onChangeClosureLocation: (fairLocationId: string) => void;
  onChangeClosurePeriod: (period: { startDate: string; endDate: string }) => void;
  onCreateLocation: (payload: CreateFairLocationPayload) => Promise<void>;
  onInteraction?: () => void;
};

const operatingDayOptions: Array<{ label: string; value: OperatingDay }> = [
  { label: "Seg", value: "MONDAY" },
  { label: "Ter", value: "TUESDAY" },
  { label: "Qua", value: "WEDNESDAY" },
  { label: "Qui", value: "THURSDAY" },
  { label: "Sex", value: "FRIDAY" },
  { label: "Sab", value: "SATURDAY" },
  { label: "Dom", value: "SUNDAY" },
];

function createInitialState(): CreateFairLocationPayload {
  return {
    name: "",
    city: "",
    state: "",
    reference: "",
    operatingDays: [],
  };
}

export function FairLocationsWorkspace({
  activeScreen,
  closureErrorMessage,
  closurePeriod,
  closurePeriodError,
  closureSelectedLocationId,
  closureSummary,
  createErrorMessage,
  createSuccessMessage,
  isCreatingLocation,
  isLoadingClosure,
  isLoadingLocations,
  locations,
  onChangeClosureLocation,
  onChangeClosurePeriod,
  onCreateLocation,
  onInteraction,
}: FairLocationsWorkspaceProps) {
  const [formState, setFormState] = useState<CreateFairLocationPayload>(() => createInitialState());
  const [fieldErrors, setFieldErrors] = useState<
    FieldErrors<"city" | "name" | "operatingDays" | "state">
  >({});

  const totalOperatingDays = useMemo(
    () => locations.reduce((count, location) => count + location.operatingDays.length, 0),
    [locations],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateFairLocation(formState);
    setFieldErrors(nextErrors);
    if (hasFieldErrors(nextErrors)) {
      return;
    }

    await onCreateLocation({
      name: formState.name.trim(),
      city: formState.city.trim(),
      state: formState.state.trim().toUpperCase(),
      reference: normalizeOptional(formState.reference),
      operatingDays: [...formState.operatingDays].sort(),
    });
    setFormState(createInitialState());
    setFieldErrors({});
  }

  return (
    <div className="grid gap-6">
      {activeScreen === "closure" ? (
        <WorkspaceCard
          eyebrow="Fechamento"
          title="Fechamento por local"
          description="Consulte um recorte operacional de uma feira especifica sem misturar lancamentos de outros pontos."
        >
          <div className="mt-7 space-y-6">
            <div className="grid gap-2.5 sm:grid-cols-2">
              <FormBadge
                label="Recorte"
                text="Selecione um local valido e o periodo operacional que deseja encerrar."
                tone="primary"
              />
              <FormBadge
                label="Leitura"
                text="O fechamento consolida entradas, saidas, lucro e volume sem alterar o historico."
                tone="neutral"
              />
            </div>

            <FormBlock
              hint="Defina o local e o periodo antes de analisar o resultado da operacao."
              title="Filtro do fechamento"
            >
              <FieldGroup
                hint="A leitura atualiza quando o local esta selecionado e o periodo fica valido."
                title="Local e periodo"
                surface="strong"
              >
                <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_minmax(0,0.8fr)] lg:gap-x-6">
                  <SelectField
                    disabled={isLoadingLocations || locations.length === 0}
                    label="Local da feira"
                    onChange={(value) => {
                      onInteraction?.();
                      onChangeClosureLocation(value);
                    }}
                    value={closureSelectedLocationId}
                  >
                    <option value="">
                      {locations.length === 0 ? "Nenhum local disponivel" : "Selecione um local"}
                    </option>
                    {locations.map((location) => (
                      <option key={location.id} value={location.id}>
                        {location.name} • {location.city}/{location.state}
                      </option>
                    ))}
                  </SelectField>

                  <Field
                    errorMessage={closurePeriodError ?? undefined}
                    label="Inicio"
                    onChange={(value) => {
                      onInteraction?.();
                      onChangeClosurePeriod({ startDate: value, endDate: closurePeriod.endDate });
                    }}
                    type="date"
                    value={closurePeriod.startDate}
                  />

                  <Field
                    errorMessage={closurePeriodError ?? undefined}
                    label="Fim"
                    onChange={(value) => {
                      onInteraction?.();
                      onChangeClosurePeriod({ startDate: closurePeriod.startDate, endDate: value });
                    }}
                    type="date"
                    value={closurePeriod.endDate}
                  />
                </div>

                {closurePeriodError ? (
                  <p className="text-sm text-rose-700">{closurePeriodError}</p>
                ) : null}
              </FieldGroup>
            </FormBlock>

            {closureErrorMessage ? (
              <FeedbackMessage message={closureErrorMessage} role="alert" tone="error" />
            ) : null}

            {locations.length === 0 ? (
              <EmptyState
                dataTestId="fair-location-closure-no-locations"
                description="Cadastre a primeira feira antes de consultar um fechamento operacional por local."
                title="Sem locais cadastrados"
              />
            ) : !closureSelectedLocationId ? (
              <EmptyState
                dataTestId="fair-location-closure-no-selection"
                description="Escolha um local valido para abrir a leitura consolidada daquele ponto."
                title="Selecione uma feira"
              />
            ) : closurePeriodError ? (
              <EmptyState
                dataTestId="fair-location-closure-invalid-period"
                description="Corrija o intervalo informado para consultar o fechamento sem misturar datas fora do recorte."
                title="Revise o periodo do fechamento"
              />
            ) : isLoadingClosure ? (
              <div className="grid gap-3" data-testid="fair-location-closure-loading">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="min-h-24 animate-pulse rounded-[1.4rem] border border-[var(--line-soft)] bg-[var(--card)]/80"
                  />
                ))}
              </div>
            ) : closureSummary && closureSummary.movementCount > 0 ? (
              <div className="space-y-5" data-testid="fair-location-closure-summary">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <StatChip label="Receita" tone="positive" value={formatCurrency(closureSummary.totalIncome)} />
                  <StatChip label="Despesa" tone="negative" value={formatCurrency(closureSummary.totalExpense)} />
                  <StatChip label="Lucro" tone={closureSummary.profit >= 0 ? "positive" : "negative"} value={formatCurrency(closureSummary.profit)} />
                  <StatChip label="Movimentos" tone="neutral" value={String(closureSummary.movementCount)} />
                </div>

                <article className="rounded-[1.7rem] border border-[var(--line-soft)] bg-[linear-gradient(180deg,rgba(251,247,240,0.96),rgba(244,238,229,0.92))] px-4 py-5 shadow-[var(--shadow-float)] sm:px-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--ink-muted)]">
                          Feira consultada
                        </p>
                        <p className="font-serif text-[1.55rem] leading-tight text-[var(--ink-strong)] sm:text-[1.8rem]">
                          {closureSummary.fairLocationName}
                        </p>
                        <p className="text-sm text-[var(--ink-muted)]">
                          {closureSummary.city}, {closureSummary.state}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <InlineBadge
                          label={`${closureSummary.startDate ?? closurePeriod.startDate} ate ${closureSummary.endDate ?? closurePeriod.endDate}`}
                        />
                        <InlineBadge
                          label={closureSummary.profit >= 0 ? "Fechamento positivo" : "Fechamento pressionado"}
                        />
                      </div>
                    </div>

                    <div className="rounded-[1.2rem] border border-[var(--line-soft)] bg-[var(--paper)] px-4 py-3 text-sm leading-6 text-[var(--ink-muted)]">
                      Resultado consolidado do local sem misturar lancamentos de outras feiras.
                    </div>
                  </div>
                </article>
              </div>
            ) : (
              <EmptyState
                dataTestId="fair-location-closure-empty"
                description="Este local ainda nao teve movimentacoes no periodo informado. Ajuste o recorte ou registre lancamentos vinculados."
                title="Sem movimentacoes neste fechamento"
              />
            )}
          </div>
        </WorkspaceCard>
      ) : null}

      {activeScreen === "create" ? (
        <WorkspaceCard
          eyebrow="Cadastro"
          title="Novo local de feira"
          description="Monte a base operacional dos seus pontos de venda com nome, cidade, estado e dias reais de funcionamento."
        >
          <form className="mt-7 space-y-6 sm:space-y-7" onSubmit={handleSubmit}>
            <div className="grid gap-2.5 sm:grid-cols-2">
              <FormBadge label="Obrigatorio" text="Nome, cidade, estado e dias operacionais" tone="primary" />
              <FormBadge label="Opcional" text="Referencia para facilitar localizacao" tone="neutral" />
            </div>

            <FormBlock
              hint="Defina os dados principais do local para que ele possa ser usado no caixa e no dashboard."
              title="Identificacao do local"
            >
              <FieldGroup surface="strong">
                <Field
                  errorMessage={fieldErrors.name}
                  label="Nome do local"
                  onChange={(value) => {
                    onInteraction?.();
                    setFieldErrors((current) => ({ ...current, name: undefined }));
                    setFormState((current) => ({ ...current, name: value }));
                  }}
                  placeholder="Ex.: Feira Central do Sabado"
                  value={formState.name}
                />
              </FieldGroup>

              <FieldGroup
                hint="Esses dados ajudam a diferenciar feiras com nomes parecidos e melhorar a leitura futura do dashboard."
                title="Contexto geografico"
              >
                <div className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-x-7">
                  <Field
                    errorMessage={fieldErrors.city}
                    label="Cidade"
                    onChange={(value) => {
                      onInteraction?.();
                      setFieldErrors((current) => ({ ...current, city: undefined }));
                      setFormState((current) => ({ ...current, city: value }));
                    }}
                    placeholder="Ex.: Campinas"
                    value={formState.city}
                  />
                  <Field
                    errorMessage={fieldErrors.state}
                    label="Estado"
                    onChange={(value) => {
                      onInteraction?.();
                      setFieldErrors((current) => ({ ...current, state: undefined }));
                      setFormState((current) => ({ ...current, state: value }));
                    }}
                    placeholder="Ex.: SP"
                    value={formState.state}
                  />
                </div>
              </FieldGroup>
            </FormBlock>

            <FormBlock
              hint="Registre como a operacao acontece de verdade naquele ponto."
              title="Rotina operacional"
            >
              <FieldGroup
                hint="Selecione os dias em que esse local costuma operar."
                title="Dias da semana"
                surface="soft"
              >
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-7">
                  {operatingDayOptions.map((option) => {
                    const active = formState.operatingDays.includes(option.value);
                    return (
                      <ChoiceButton
                        key={option.value}
                        active={active}
                        label={option.label}
                        onClick={() => {
                          onInteraction?.();
                          setFieldErrors((current) => ({ ...current, operatingDays: undefined }));
                          setFormState((current) => ({
                            ...current,
                            operatingDays: active
                              ? current.operatingDays.filter((day) => day !== option.value)
                              : [...current.operatingDays, option.value],
                          }));
                        }}
                      />
                    );
                  })}
                </div>
                {fieldErrors.operatingDays ? (
                  <p className="text-sm text-rose-700">{fieldErrors.operatingDays}</p>
                ) : null}
              </FieldGroup>

              <FieldGroup
                hint="Use este campo para anotar ponto de referencia ou observacao util na operacao."
                title="Referencia complementar"
              >
                <Field
                  label="Referencia"
                  onChange={(value) => {
                    onInteraction?.();
                    setFormState((current) => ({ ...current, reference: value }));
                  }}
                  placeholder="Ex.: Proximo ao mercado municipal"
                  value={formState.reference ?? ""}
                />
              </FieldGroup>
            </FormBlock>

            <ActionPanel>
              {createErrorMessage ? <FeedbackMessage message={createErrorMessage} role="alert" tone="error" /> : null}
              {createSuccessMessage ? <FeedbackMessage message={createSuccessMessage} tone="success" /> : null}

              <button
                className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[var(--accent-strong)] px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:brightness-105 hover:shadow-[var(--shadow-float)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isCreatingLocation}
                type="submit"
              >
                {isCreatingLocation ? "Salvando local…" : "Cadastrar local"}
              </button>
            </ActionPanel>
          </form>
        </WorkspaceCard>
      ) : null}

      {activeScreen === "list" ? (
        <WorkspaceCard
          eyebrow="Base ativa"
          title="Locais cadastrados"
          description="Consulte rapidamente os pontos de operacao ja mapeados para alimentar caixa, fechamento e leitura por local."
        >
          <div className="mt-7 space-y-5">
            <div className="grid gap-3 sm:grid-cols-3">
              <StatChip label="Locais" tone="neutral" value={String(locations.length)} />
              <StatChip label="Dias totais" tone="positive" value={String(totalOperatingDays)} />
              <StatChip
                label="Media por local"
                tone="neutral"
                value={locations.length === 0 ? "0" : (totalOperatingDays / locations.length).toFixed(1).replace(".", ",")}
              />
            </div>

            {isLoadingLocations ? (
              <div className="grid gap-3" data-testid="fair-locations-loading">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="min-h-24 animate-pulse rounded-[1.4rem] border border-[var(--line-soft)] bg-[var(--card)]/80"
                  />
                ))}
              </div>
            ) : locations.length === 0 ? (
              <div
                className="rounded-[1.7rem] border border-dashed border-[var(--line-strong)] bg-[linear-gradient(180deg,rgba(248,243,236,0.95),rgba(241,233,221,0.9))] px-5 py-6 shadow-[var(--shadow-float)]"
                data-testid="fair-locations-empty"
              >
                <p className="text-lg font-semibold text-[var(--ink-strong)]">Nenhum local cadastrado ainda.</p>
                <p className="mt-2 text-sm leading-7 text-[var(--ink-muted)]">
                  Cadastre a primeira feira para preparar o caixa por local e a leitura analitica futura.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {locations.map((location) => (
                  <article
                    key={location.id}
                    className="min-w-0 rounded-[1.7rem] border border-[var(--line-soft)] bg-[linear-gradient(180deg,rgba(251,247,240,0.96),rgba(244,238,229,0.92))] px-4 py-4 shadow-[var(--shadow-float)] sm:px-5"
                    data-testid="fair-location-card"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 space-y-2">
                        <div className="space-y-1">
                          <p className="break-words font-serif text-[1.45rem] leading-tight text-[var(--ink-strong)] sm:text-[1.6rem]">
                            {location.name}
                          </p>
                          <p className="break-words text-sm text-[var(--ink-muted)]">
                            {location.city}, {location.state}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {location.operatingDays.map((day) => (
                            <InlineBadge key={day} label={formatOperatingDay(day)} />
                          ))}
                        </div>
                      </div>

                      <span className="inline-flex min-h-11 items-center justify-center self-start rounded-full bg-[var(--accent-soft)] px-4 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
                        {location.operatingDays.length} dias
                      </span>
                    </div>

                    <dl className="mt-5 grid gap-3 md:grid-cols-3">
                      <LocationMeta label="Referencia" value={location.reference || "Nao informada"} />
                      <LocationMeta label="Cidade" value={location.city} />
                      <LocationMeta label="Estado" value={location.state} />
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
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ink-muted)]">{eyebrow}</p>
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
  onChange,
  placeholder,
  step,
  type = "text",
  value,
}: {
  errorMessage?: string;
  label: string;
  min?: string;
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
  onChange,
  value,
}: {
  children: ReactNode;
  disabled?: boolean;
  errorMessage?: string;
  label: string;
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
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {children}
      </select>
      {errorMessage ? <span className="text-sm text-rose-700">{errorMessage}</span> : null}
    </label>
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

function LocationMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-[1.15rem] border border-[var(--line-soft)] bg-[var(--paper)] px-3 py-3.5">
      <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--ink-muted)]">{label}</dt>
      <dd className="mt-2 break-words text-sm leading-6 text-[var(--ink-strong)]">{value}</dd>
    </div>
  );
}

function EmptyState({
  dataTestId,
  description,
  title,
}: {
  dataTestId: string;
  description: string;
  title: string;
}) {
  return (
    <div
      className="rounded-[1.7rem] border border-dashed border-[var(--line-strong)] bg-[linear-gradient(180deg,rgba(248,243,236,0.95),rgba(241,233,221,0.9))] px-5 py-6 shadow-[var(--shadow-float)]"
      data-testid={dataTestId}
    >
      <p className="text-lg font-semibold text-[var(--ink-strong)]">{title}</p>
      <p className="mt-2 text-sm leading-7 text-[var(--ink-muted)]">{description}</p>
    </div>
  );
}

function formatOperatingDay(day: OperatingDay) {
  return {
    MONDAY: "Segunda",
    TUESDAY: "Terca",
    WEDNESDAY: "Quarta",
    THURSDAY: "Quinta",
    FRIDAY: "Sexta",
    SATURDAY: "Sabado",
    SUNDAY: "Domingo",
  }[day];
}

function normalizeOptional(value?: string) {
  if (!value) {
    return undefined;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}
