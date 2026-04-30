import { formatDisplayDate } from "../lib/date";
import type { DashboardDaySummary, DashboardLocationSummary, DashboardSummary, Session } from "../lib/api";

type DashboardSummaryPanelProps = {
  activeScreen: "days" | "locations" | "overview";
  fairLocationsCount: number;
  filter: {
    startDate: string;
    endDate: string;
  };
  hasMovements: boolean;
  isLoading: boolean;
  isLoadingLocations: boolean;
  session: Session;
  summary?: DashboardSummary;
};

export function DashboardSummaryPanel({
  activeScreen,
  fairLocationsCount,
  filter,
  hasMovements,
  isLoading,
  isLoadingLocations,
  session,
  summary,
}: DashboardSummaryPanelProps) {
  const current: DashboardSummary = summary ?? {
    totalIncome: 0,
    totalExpense: 0,
    profit: 0,
    startDate: filter.startDate,
    endDate: filter.endDate,
    byDay: [],
    byLocation: [],
  };

  return (
    <div className="grid gap-6">
      {activeScreen === "overview" ? (
        <>
          <section className="grid gap-4 md:grid-cols-3">
            <MetricCard
              accent="var(--accent-income)"
              helper="Entradas do periodo"
              testId="metric-card-receita"
              loading={isLoading}
              title="Receita"
              value={formatCurrency(current.totalIncome)}
            />
            <MetricCard
              accent="var(--accent-expense)"
              helper="Saidas do periodo"
              testId="metric-card-despesa"
              loading={isLoading}
              title="Despesa"
              value={formatCurrency(current.totalExpense)}
            />
            <MetricCard
              accent="var(--accent-strong)"
              helper="Resultado consolidado"
              testId="metric-card-lucro"
              loading={isLoading}
              title="Lucro"
              value={formatCurrency(current.profit)}
            />
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <article className="rounded-[2rem] border border-[var(--line-soft)] bg-[var(--paper)] p-5 shadow-[var(--shadow-panel)] sm:p-6 lg:p-7">
              <div className="flex flex-wrap items-center gap-2.5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ink-muted)]">Painel geral</p>
                <span className="inline-flex min-h-8 items-center rounded-full border border-[var(--line-soft)] bg-[var(--card)]/65 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--ink-muted)]">
                  Tela de leitura
                </span>
              </div>
              <h3 className="mt-3 text-balance font-serif text-[1.9rem] leading-tight text-[var(--ink-strong)] sm:text-[2.4rem]">Resumo da operacao atual</h3>
              {isLoading ? (
                <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--ink-muted)]">
                  Atualizando indicadores do periodo selecionado.
                </p>
              ) : hasMovements ? (
                <>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--ink-muted)]">
                    O painel cruza apenas as movimentacoes da sua sessao e mostra se o periodo esta sustentando a
                    operacao com folga ou pressao de saidas.
                  </p>

                  <dl className="mt-8 grid gap-4 md:grid-cols-2">
                    <DetailItem
                      label="Periodo aplicado"
                      value={`${formatDisplayDate(current.startDate ?? filter.startDate)} ate ${formatDisplayDate(current.endDate ?? filter.endDate)}`}
                    />
                    <DetailItem label="Conta em sessao" value={session.email} />
                    <DetailItem
                      label="Leitura operacional"
                      value={current.profit >= 0 ? "Periodo positivo" : "Periodo pressionado por saidas"}
                    />
                    <DetailItem
                      label="Prioridade"
                      value={current.totalExpense > current.totalIncome ? "Revisar despesas do periodo" : "Manter ritmo de caixa"}
                    />
                  </dl>
                </>
              ) : (
                <div className="mt-6 rounded-[1.7rem] border border-dashed border-[var(--line-strong)] bg-[linear-gradient(180deg,rgba(248,243,236,0.95),rgba(241,233,221,0.9))] px-5 py-6 shadow-[var(--shadow-float)]">
                  <p className="text-lg font-semibold text-[var(--ink-strong)]">Ainda nao ha movimentacoes neste periodo.</p>
                  <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--ink-muted)]">
                    Registre a primeira entrada ou saida para transformar este painel em uma leitura real da operacao.
                  </p>
                </div>
              )}
            </article>

            <article className="rounded-[2rem] border border-[var(--line-soft)] bg-[linear-gradient(180deg,rgba(244,237,225,0.92),rgba(251,247,240,0.9))] p-5 shadow-[var(--shadow-panel)] sm:p-6 lg:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ink-muted)]">Ritmo</p>
              <h3 className="mt-3 text-balance font-serif text-[1.9rem] text-[var(--ink-strong)] sm:text-[2.25rem]">Direcao do caixa</h3>

              <div className="mt-8 space-y-4">
                <BalanceRow label="Entradas" tone="income" value={current.totalIncome} />
                <BalanceRow label="Saidas" tone="expense" value={current.totalExpense} />
                <BalanceRow label="Lucro" tone="profit" value={current.profit} />
              </div>
            </article>
          </section>
        </>
      ) : null}

      {activeScreen === "days" ? (
        <article className="rounded-[2rem] border border-[var(--line-soft)] bg-[var(--paper)] p-5 shadow-[var(--shadow-panel)] sm:p-6 lg:p-7">
          <div className="flex flex-wrap items-center gap-2.5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ink-muted)]">Analise por dia</p>
            <span className="inline-flex min-h-8 items-center rounded-full border border-[var(--line-soft)] bg-[var(--card)]/65 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--ink-muted)]">
              Tela comparativa
            </span>
          </div>
          <h3 className="mt-3 text-balance font-serif text-[1.9rem] leading-tight text-[var(--ink-strong)] sm:text-[2.25rem]">
            Quando a operacao rende mais
          </h3>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--ink-muted)]">
            Leitura do historico por dia da semana para identificar ritmo de receita, pressao de despesas e volume real.
          </p>

          {isLoading ? (
            <AnalyticsSkeleton rows={4} />
          ) : current.byDay.length > 0 ? (
            <div className="mt-7 grid gap-3">
              {current.byDay.map((item: DashboardDaySummary) => (
                <DayPerformanceCard key={item.dayOfWeek} item={item} />
              ))}
            </div>
          ) : (
            <AnalyticsEmptyState
              message="Ainda nao ha historico suficiente para comparar dias da semana neste periodo."
              title="Sem leitura por dia"
            />
          )}
        </article>
      ) : null}

      {activeScreen === "locations" ? (
        <article className="rounded-[2rem] border border-[var(--line-soft)] bg-[linear-gradient(180deg,rgba(251,247,240,0.96),rgba(244,237,225,0.92))] p-5 shadow-[var(--shadow-panel)] sm:p-6 lg:p-7">
          <div className="flex flex-wrap items-center gap-2.5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ink-muted)]">Analise por local</p>
            <span className="inline-flex min-h-8 items-center rounded-full border border-[var(--line-soft)] bg-[var(--card)]/65 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--ink-muted)]">
              Tela comparativa
            </span>
          </div>
          <h3 className="mt-3 text-balance font-serif text-[1.9rem] leading-tight text-[var(--ink-strong)] sm:text-[2.25rem]">
            Quais feiras sustentam o resultado
          </h3>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--ink-muted)]">
            Ranking dos locais com movimentacao vinculada, sem inventar desempenho para feiras que ainda nao tiveram uso real.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <ContextChip
              label="Locais cadastrados"
              value={isLoadingLocations ? "Atualizando…" : String(fairLocationsCount)}
            />
            <ContextChip
              label="Locais com leitura"
              value={isLoading ? "Atualizando…" : String(current.byLocation.length)}
            />
            <ContextChip
              label="Origem"
              value="Movimentos com local"
            />
          </div>

          {isLoading || isLoadingLocations ? (
            <AnalyticsSkeleton rows={3} />
          ) : current.byLocation.length > 0 ? (
            <div className="mt-7 grid gap-3">
              {current.byLocation.map((item: DashboardLocationSummary, index: number) => (
                <LocationPerformanceCard key={item.fairLocationId} index={index} item={item} />
              ))}
            </div>
          ) : fairLocationsCount === 0 ? (
            <AnalyticsEmptyState
              message="Cadastre a primeira feira na base ativa para transformar esta subtela em uma leitura operacional por local."
              title="Nenhum local cadastrado"
            />
          ) : !hasMovements ? (
            <AnalyticsEmptyState
              message="O periodo ainda nao tem movimentacoes suficientes para leitura por local. Registre lancamentos no caixa e vincule a uma feira cadastrada."
              title="Sem movimentacoes no periodo"
            />
          ) : (
            <div className="mt-7 space-y-4">
              <AnalyticsEmptyState
                message="Ja existem feiras cadastradas, mas as movimentacoes deste periodo ainda nao foram vinculadas a elas no caixa."
                title="Sem vinculacao no caixa"
              />
              <div className="rounded-[1.5rem] border border-[var(--line-soft)] bg-[rgba(255,255,255,0.45)] px-4 py-4 text-sm leading-7 text-[var(--ink-muted)]">
                Para alimentar esta leitura:
                vincule o local no `Novo lancamento` do caixa ou consulte `Locais` para revisar a base cadastrada.
              </div>
            </div>
          )}
        </article>
      ) : null}
    </div>
  );
}

function MetricCard({
  accent,
  helper,
  loading,
  testId,
  title,
  value,
}: {
  accent: string;
  helper: string;
  loading: boolean;
  testId: string;
  title: string;
  value: string;
}) {
  return (
    <article
      className="min-w-0 overflow-hidden rounded-[1.8rem] border border-[var(--line-soft)] bg-[var(--paper)] p-5 shadow-[var(--shadow-panel)]"
      data-testid={testId}
      style={{ boxShadow: `inset 0 1px 0 rgba(255,255,255,0.7), 0 20px 45px -28px ${accent}` }}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ink-muted)]">{title}</p>
      <p className="mt-3 break-all font-serif text-[1.8rem] leading-tight text-[var(--ink-strong)] sm:text-[2.15rem] lg:text-[2.4rem]">
        {loading ? "Atualizando…" : value}
      </p>
      <p className="mt-2 text-sm text-[var(--ink-muted)]">{helper}</p>
    </article>
  );
}

function ContextChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.25rem] border border-[var(--line-soft)] bg-[rgba(255,255,255,0.45)] px-4 py-4 shadow-[var(--shadow-float)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--ink-muted)]">{label}</p>
      <p className="mt-2 break-words font-serif text-[1.5rem] leading-tight text-[var(--ink-strong)]">{value}</p>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.4rem] border border-[var(--line-soft)] bg-[var(--card)] px-4 py-4">
      <dt className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ink-muted)]">{label}</dt>
      <dd className="mt-2 break-all text-sm leading-6 text-[var(--ink-strong)]">{value}</dd>
    </div>
  );
}

function BalanceRow({
  label,
  tone,
  value,
}: {
  label: string;
  tone: "income" | "expense" | "profit";
  value: number;
}) {
  const color =
    tone === "income"
      ? "var(--accent-income)"
      : tone === "expense"
        ? "var(--accent-expense)"
        : "var(--accent-strong)";

  return (
    <div className="rounded-[1.4rem] border border-[var(--line-soft)] bg-[var(--paper)] px-4 py-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-sm font-medium text-[var(--ink-muted)]">{label}</span>
        </div>
        <span className="break-all text-right font-serif text-[1.7rem] text-[var(--ink-strong)] sm:text-2xl">{formatCurrency(value)}</span>
      </div>
    </div>
  );
}

function DayPerformanceCard({ item }: { item: DashboardDaySummary }) {
  return (
    <article className="rounded-[1.4rem] border border-[var(--line-soft)] bg-[var(--card)] px-4 py-4" data-testid="dashboard-day-card">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ink-muted)]">
            {formatDayLabel(item.dayOfWeek)}
          </p>
          <p className="mt-2 font-serif text-[1.55rem] leading-none text-[var(--ink-strong)]">
            {formatCurrency(item.profit)}
          </p>
        </div>
        <p className="text-sm text-[var(--ink-muted)]">
          {item.movementCount} moviment{item.movementCount === 1 ? "o" : "os"}
        </p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <MiniBreakdown label="Receita" tone="income" value={item.totalIncome} />
        <MiniBreakdown label="Despesa" tone="expense" value={item.totalExpense} />
      </div>
    </article>
  );
}

function LocationPerformanceCard({
  index,
  item,
}: {
  index: number;
  item: DashboardLocationSummary;
}) {
  return (
    <article className="rounded-[1.5rem] border border-[var(--line-soft)] bg-[var(--paper)] px-4 py-4 shadow-[var(--shadow-float)]" data-testid="dashboard-location-card">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ink-muted)]">
            Local #{index + 1}
          </p>
          <p className="mt-2 break-words font-serif text-[1.55rem] leading-tight text-[var(--ink-strong)]">
            {item.fairLocationName}
          </p>
          <p className="mt-1 text-sm text-[var(--ink-muted)]">
            {item.city}, {item.state}
          </p>
        </div>
        <div className="rounded-full border border-[var(--line-soft)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-[var(--ink-muted)]">
          {item.movementCount} moviment{item.movementCount === 1 ? "o" : "os"}
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <MiniBreakdown label="Receita" tone="income" value={item.totalIncome} />
        <MiniBreakdown label="Despesa" tone="expense" value={item.totalExpense} />
        <MiniBreakdown label="Lucro" tone="profit" value={item.profit} />
      </div>
    </article>
  );
}

function MiniBreakdown({
  label,
  tone,
  value,
}: {
  label: string;
  tone: "income" | "expense" | "profit";
  value: number;
}) {
  const toneClass =
    tone === "income"
      ? "text-[var(--accent-income)]"
      : tone === "expense"
        ? "text-[var(--accent-expense)]"
        : "text-[var(--accent-strong)]";

  return (
    <div className="rounded-[1.1rem] border border-[var(--line-soft)] bg-[var(--paper)] px-3 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--ink-muted)]">{label}</p>
      <p className={`mt-2 break-all font-serif text-[1.35rem] leading-none ${toneClass}`}>{formatCurrency(value)}</p>
    </div>
  );
}

function AnalyticsEmptyState({ message, title }: { message: string; title: string }) {
  return (
    <div className="mt-7 rounded-[1.6rem] border border-dashed border-[var(--line-strong)] bg-[var(--card)] px-5 py-6">
      <p className="text-lg font-semibold text-[var(--ink-strong)]">{title}</p>
      <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--ink-muted)]">{message}</p>
    </div>
  );
}

function AnalyticsSkeleton({ rows }: { rows: number }) {
  return (
    <div className="mt-7 grid gap-3" aria-hidden="true">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="min-h-24 animate-pulse rounded-[1.4rem] border border-[var(--line-soft)] bg-[var(--card)]/80" />
      ))}
    </div>
  );
}

function formatDayLabel(dayOfWeek: DashboardDaySummary["dayOfWeek"]) {
  switch (dayOfWeek) {
    case "MONDAY":
      return "Segunda";
    case "TUESDAY":
      return "Terca";
    case "WEDNESDAY":
      return "Quarta";
    case "THURSDAY":
      return "Quinta";
    case "FRIDAY":
      return "Sexta";
    case "SATURDAY":
      return "Sabado";
    case "SUNDAY":
      return "Domingo";
  }
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}
