import type { KeyboardEvent, PropsWithChildren, ReactNode } from "react";
import type { Session } from "../lib/api";

type AppShellProps = PropsWithChildren<{
  activeView: "cash" | "dashboard" | "employees" | "locations";
  isRefreshing: boolean;
  onLogout: () => void;
  onSelectView: (view: "cash" | "dashboard" | "employees" | "locations") => void;
  session: Session;
  spotlight: string;
}>;

type FilterProps = {
  startDate: string;
  endDate: string;
  errorMessage?: string | null;
  onChange: (value: { startDate: string; endDate: string }) => void;
};

type AlertProps = {
  title: string;
  message: string;
};

type SectionTabsProps<TValue extends string> = {
  activeValue: TValue;
  description?: string;
  items: Array<{
    description: string;
    label: string;
    value: TValue;
  }>;
  onChange: (value: TValue) => void;
  panelId?: string;
  tabIdPrefix?: string;
  title: string;
};

export function AppShell({
  activeView,
  children,
  isRefreshing,
  onLogout,
  onSelectView,
  session,
  spotlight,
}: AppShellProps) {
  return (
    <main className="min-h-screen bg-[var(--canvas)] text-[var(--ink-strong)]">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <div className="grid gap-6 xl:grid-cols-[17rem_minmax(0,1fr)]">
          <aside className="flex flex-col gap-4 rounded-[2rem] border border-[var(--line-soft)] bg-[linear-gradient(180deg,rgba(251,247,240,0.98),rgba(244,237,225,0.92))] p-4 shadow-[var(--shadow-panel)] sm:gap-5 sm:p-5 xl:sticky xl:top-6 xl:self-start">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[var(--ink-muted)]">
                FeiraControl
              </p>
              <h1 className="mt-2 text-balance font-serif text-[1.75rem] leading-[0.95] text-[var(--ink-strong)] sm:text-[2rem]">
                Caderno vivo
              </h1>
              <p className="mt-2.5 text-[13px] leading-5 text-[var(--ink-muted)]">{spotlight}</p>
            </div>

            <div className="rounded-[1.45rem] border border-[var(--line-soft)] bg-[rgba(244,237,225,0.92)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--ink-muted)]">
                Sessao ativa
              </p>
              <p className="mt-2 break-all text-[15px] font-semibold leading-5 text-[var(--ink-strong)]" data-testid="session-email">
                {session.email}
              </p>
              <p className="mt-2.5 text-[13px] leading-5 text-[var(--ink-muted)]">
                Ambiente protegido e pronto para registrar o caixa da sua operacao.
              </p>
            </div>

            <div className="space-y-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--ink-muted)]">
                Navegacao
              </p>
              <nav className="grid gap-2.5">
                <NavButton
                  active={activeView === "dashboard"}
                  dataTestId="nav-dashboard"
                  eyebrow="Resumo"
                  onClick={() => onSelectView("dashboard")}
                  title="Dashboard"
                />
                <NavButton
                  active={activeView === "cash"}
                  dataTestId="nav-cash"
                  eyebrow="Operacao"
                  onClick={() => onSelectView("cash")}
                  title="Caixa"
                />
                <NavButton
                  active={activeView === "employees"}
                  dataTestId="nav-employees"
                  eyebrow="Equipe"
                  onClick={() => onSelectView("employees")}
                  title="Funcionarios"
                />
                <NavButton
                  active={activeView === "locations"}
                  dataTestId="nav-locations"
                  eyebrow="Feiras"
                  onClick={() => onSelectView("locations")}
                  title="Locais"
                />
              </nav>
            </div>

            <div className="border-t border-[var(--line-soft)] pt-4 xl:mt-auto">
              <button
                className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-[var(--line-strong)] px-5 text-sm font-semibold text-[var(--ink-strong)] transition hover:border-[var(--accent-strong)] hover:bg-[var(--accent-soft)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--focus-ring)]"
                onClick={onLogout}
                type="button"
              >
                Encerrar sessao
              </button>
            </div>
          </aside>

          <section className="space-y-6">
            <header className="overflow-hidden rounded-[2rem] border border-[var(--line-soft)] bg-[linear-gradient(135deg,rgba(164,87,42,0.12),rgba(251,247,240,0.96))] p-5 shadow-[var(--shadow-panel)] sm:p-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line-soft)] bg-[rgba(251,247,240,0.9)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--ink-muted)]">
                    <span className="h-2 w-2 rounded-full bg-[var(--accent-strong)]" />
                    Controle diario
                  </div>
                  <h2 className="mt-3 max-w-4xl text-balance font-serif text-[1.95rem] leading-tight text-[var(--ink-strong)] sm:text-[2.7rem] lg:text-[3.1rem]">
                    Um painel para vender, pagar e conferir o lucro sem voltar para a planilha.
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--ink-muted)]">
                    Acompanhe a operacao do dia, registre movimentacoes sem friccao e mantenha caixa, equipe e leitura financeira no mesmo fluxo.
                  </p>
                </div>

                <div className="grid gap-3 self-start lg:min-w-[16rem]">
                  <div className="inline-flex min-h-10 items-center gap-3 rounded-full border border-[var(--line-soft)] bg-[rgba(251,247,240,0.92)] px-4 py-2 text-sm text-[var(--ink-muted)]">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        isRefreshing ? "animate-pulse bg-[var(--accent-strong)]" : "bg-[var(--accent-income)]"
                      }`}
                    />
                    {isRefreshing ? "Atualizando dados" : "Dados sincronizados"}
                  </div>

                  <div className="rounded-[1.3rem] border border-[var(--line-soft)] bg-[rgba(255,255,255,0.38)] px-4 py-3 text-sm leading-6 text-[var(--ink-muted)]">
                    <span className="block text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--ink-muted)]">
                      Conta em uso
                    </span>
                    <span className="mt-1 block break-all text-[13px] font-medium text-[var(--ink-strong)]">
                      {session.email}
                    </span>
                  </div>
                </div>
              </div>
            </header>

            {children}
          </section>
        </div>
      </div>
    </main>
  );
}

function NavButton({
  active,
  dataTestId,
  eyebrow,
  onClick,
  title,
}: {
  active: boolean;
  dataTestId: string;
  eyebrow: string;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      className={`min-h-[4.25rem] rounded-[1.35rem] border px-4 py-3.5 text-left transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--focus-ring)] sm:min-h-[4.6rem] ${
        active
          ? "border-[var(--accent-strong)] bg-[linear-gradient(180deg,rgba(164,87,42,0.14),rgba(164,87,42,0.08))] shadow-[var(--shadow-float)]"
          : "border-[var(--line-soft)] bg-transparent hover:border-[var(--line-strong)] hover:bg-[rgba(244,237,225,0.82)]"
      }`}
      data-testid={dataTestId}
      onClick={onClick}
      type="button"
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--ink-muted)]">{eyebrow}</p>
      <p className="mt-1.5 font-serif text-[1.3rem] leading-none text-[var(--ink-strong)] sm:text-[1.45rem]">{title}</p>
    </button>
  );
}

AppShell.Filters = function AppShellFilters({ endDate, errorMessage, onChange, startDate }: FilterProps) {
  return (
    <section className="rounded-[1.9rem] border border-[var(--line-soft)] bg-[var(--surface-warm)] p-5 shadow-[var(--shadow-panel)] sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--ink-muted)]">Periodo</p>
          <h3 className="mt-2 text-balance font-serif text-[1.9rem] text-[var(--ink-strong)] sm:text-[2.2rem]">Recorte da operacao</h3>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--ink-muted)]">
            Compare o caixa com contexto e mantenha a leitura do periodo coerente com a rotina real.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[22rem]">
          <label className="grid gap-2.5 text-sm text-[var(--ink-muted)]">
            <span className="font-medium text-[var(--ink-strong)]">Inicio</span>
            <input
              aria-invalid={errorMessage ? "true" : "false"}
              autoComplete="off"
              className={`min-h-11 rounded-full border bg-[var(--paper-elevated)] px-4 text-[var(--ink-strong)] shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--focus-ring)] ${
                errorMessage
                  ? "border-[var(--accent-expense)] focus:border-[var(--accent-expense)]"
                  : "border-[var(--line-soft)] focus:border-[var(--accent-strong)]"
              }`}
              name="startDate"
              onChange={(event) => onChange({ startDate: event.target.value, endDate })}
              type="date"
              value={startDate}
            />
          </label>

          <label className="grid gap-2.5 text-sm text-[var(--ink-muted)]">
            <span className="font-medium text-[var(--ink-strong)]">Fim</span>
            <input
              aria-invalid={errorMessage ? "true" : "false"}
              autoComplete="off"
              className={`min-h-11 rounded-full border bg-[var(--paper-elevated)] px-4 text-[var(--ink-strong)] shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--focus-ring)] ${
                errorMessage
                  ? "border-[var(--accent-expense)] focus:border-[var(--accent-expense)]"
                  : "border-[var(--line-soft)] focus:border-[var(--accent-strong)]"
              }`}
              name="endDate"
              onChange={(event) => onChange({ startDate, endDate: event.target.value })}
              type="date"
              value={endDate}
            />
          </label>
        </div>
      </div>

      <div className="mt-4 min-h-6 rounded-[1.2rem] bg-[rgba(255,255,255,0.36)] px-3 py-2 text-sm" aria-live="polite">
        {errorMessage ? (
          <p className="font-medium text-rose-700">{errorMessage}</p>
        ) : (
          <p className="text-[var(--ink-muted)]">Use o recorte do periodo para comparar a operacao sem perder contexto.</p>
        )}
      </div>
    </section>
  );
};

AppShell.Alert = function AppShellAlert({ message, title }: AlertProps) {
  return (
    <section className="rounded-[1.7rem] border border-rose-300/60 bg-[linear-gradient(180deg,rgba(255,237,239,0.92),rgba(255,249,250,0.98))] p-4 text-rose-900 shadow-[var(--shadow-float)] sm:p-5" role="alert">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rose-700">{title}</p>
      <p className="mt-2 text-sm leading-6">{message}</p>
    </section>
  );
};

AppShell.SectionTabs = function AppShellSectionTabs<TValue extends string>({
  activeValue,
  description,
  items,
  onChange,
  panelId,
  tabIdPrefix,
  title,
}: SectionTabsProps<TValue>) {
  const activeItem = items.find((item) => item.value === activeValue) ?? items[0];

  function getTabId(value: TValue) {
    return tabIdPrefix ? `${tabIdPrefix}-${value}-tab` : undefined;
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const lastIndex = items.length - 1;
    let nextIndex: number | null = null;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = index === lastIndex ? 0 : index + 1;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = index === 0 ? lastIndex : index - 1;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = lastIndex;
    }

    if (nextIndex === null) {
      return;
    }

    event.preventDefault();
    const nextItem = items[nextIndex];
    onChange(nextItem.value);

    const tabElements = event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    tabElements?.[nextIndex]?.focus();
  }

  return (
    <section className="rounded-[1.8rem] border border-[var(--line-soft)] bg-[var(--paper)] p-4 shadow-[var(--shadow-panel)] sm:p-5">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ink-muted)]">{title}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2.5">
            <span className="inline-flex min-h-8 items-center rounded-full border border-[var(--accent-strong)]/20 bg-[rgba(164,87,42,0.1)] px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
              Tela atual
            </span>
            <span className="inline-flex min-h-8 items-center rounded-full border border-[var(--line-soft)] bg-[var(--card)]/65 px-3 text-sm font-medium text-[var(--ink-strong)]">
              {activeItem.label}
            </span>
          </div>
          <h3 className="mt-3 text-balance font-serif text-[1.65rem] leading-tight text-[var(--ink-strong)] sm:text-[2rem]">
            {activeItem.label}
          </h3>
          <p className="mt-2 text-sm leading-6 text-[var(--ink-muted)]">
            {description ?? "Abra uma tela por vez para manter leitura limpa e evitar blocos comprimidos."}
          </p>
          <p className="mt-2 text-sm leading-6 text-[var(--ink-muted)]">{activeItem.description}</p>
        </div>

        <div
          aria-label={`${title} subtelas`}
          aria-orientation="horizontal"
          className="flex gap-2 overflow-x-auto pb-1 pr-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 xl:grid-cols-3 [&::-webkit-scrollbar]:hidden"
          role="tablist"
        >
          {items.map((item, index) => {
            const active = item.value === activeValue;
            return (
              <button
                aria-controls={panelId}
                aria-selected={active}
                id={getTabId(item.value)}
                key={item.value}
                className={`min-w-[14rem] snap-start rounded-[1.25rem] border px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--focus-ring)] sm:min-w-0 ${
                  active
                    ? "border-[var(--accent-strong)] bg-[linear-gradient(180deg,rgba(164,87,42,0.14),rgba(164,87,42,0.08))] shadow-[var(--shadow-float)]"
                    : "border-[var(--line-soft)] bg-[var(--card)]/55 hover:border-[var(--line-strong)] hover:bg-[rgba(244,237,225,0.9)]"
                }`}
                onKeyDown={(event) => handleKeyDown(event, index)}
                onClick={() => onChange(item.value)}
                role="tab"
                tabIndex={active ? 0 : -1}
                type="button"
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--ink-muted)]">
                  {active ? "Ativa" : "Subtela"}
                </p>
                <p className="mt-1 font-semibold text-[var(--ink-strong)]">{item.label}</p>
                <p className="mt-1 text-sm leading-5 text-[var(--ink-muted)]">{item.description}</p>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
