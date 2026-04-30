import { formatDisplayDate } from "../lib/date";
import type { CashMovement, DashboardSummary, FairLocation } from "../lib/api";
import { FeedbackMessage } from "./FeedbackMessage";

type CashFeedProps = {
  fairLocationsById: Map<string, FairLocation>;
  filter: {
    startDate: string;
    endDate: string;
  };
  isLoading: boolean;
  items: CashMovement[];
  successMessage: string | null;
  summary: DashboardSummary;
};

export function CashFeed({
  fairLocationsById,
  filter,
  isLoading,
  items,
  successMessage,
  summary,
}: CashFeedProps) {
  return (
    <section className="min-w-0 overflow-hidden rounded-[2rem] border border-[var(--line-soft)] bg-[var(--paper)] p-5 shadow-[var(--shadow-panel)] sm:p-6 lg:p-7">
      <div className="flex flex-col gap-4 border-b border-[var(--line-soft)] pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ink-muted)]">Livro caixa</p>
            <span className="inline-flex min-h-8 items-center rounded-full border border-[var(--line-soft)] bg-[var(--card)]/65 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--ink-muted)]">
              Tela de consulta
            </span>
          </div>
          <h3 className="mt-3 text-balance font-serif text-[1.9rem] leading-tight text-[var(--ink-strong)] sm:text-[2.4rem]">
            Livro caixa do periodo
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--ink-muted)]">
            Leia o historico sem competir com o formulario de lancamento. Esta tela concentra apenas consulta e conferencia.
          </p>
        </div>
        <div className="max-w-full break-words rounded-[1.2rem] border border-[var(--line-soft)] bg-[var(--card)] px-4 py-2 text-sm leading-6 text-[var(--ink-muted)] sm:max-w-[15rem]">
          {formatDisplayDate(filter.startDate)} ate {formatDisplayDate(filter.endDate)}
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <MiniStat label="Receita" value={summary.totalIncome} />
        <MiniStat label="Despesa" value={summary.totalExpense} />
        <MiniStat label="Lucro" value={summary.profit} />
      </div>

      {successMessage ? (
        <div className="mt-6">
          <FeedbackMessage message={successMessage} tone="success" />
        </div>
      ) : null}

      {isLoading ? (
        <div className="mt-8 space-y-3" aria-live="polite">
          {[0, 1, 2].map((item) => (
            <div
              className="animate-pulse rounded-[1.5rem] border border-[var(--line-soft)] bg-[var(--card)] px-4 py-5"
              key={item}
            >
              <div className="h-3 w-24 rounded-full bg-[var(--line-soft)]" />
              <div className="mt-3 h-7 w-2/3 rounded-full bg-[var(--line-soft)]" />
              <div className="mt-4 h-4 w-28 rounded-full bg-[var(--line-soft)]" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="mt-8 rounded-[1.7rem] border border-dashed border-[var(--line-strong)] bg-[linear-gradient(180deg,rgba(248,243,236,0.95),rgba(241,233,221,0.9))] px-5 py-8 text-sm leading-7 text-[var(--ink-muted)] shadow-[var(--shadow-float)]">
          Nenhuma movimentacao encontrada no periodo informado. Ajuste o filtro ou registre a primeira anotacao do caixa.
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {items.map((item) => (
            <CashFeedItem fairLocationsById={fairLocationsById} item={item} key={item.id} />
          ))}
        </div>
      )}
    </section>
  );
}

function CashFeedItem({
  fairLocationsById,
  item,
}: {
  fairLocationsById: Map<string, FairLocation>;
  item: CashMovement;
}) {
  const linkedLocation = item.fairLocationId ? fairLocationsById.get(item.fairLocationId) : undefined;

  return (
    <article
      className="min-w-0 overflow-hidden rounded-[1.7rem] border border-[var(--line-soft)] bg-[linear-gradient(180deg,rgba(251,247,240,0.96),rgba(244,238,229,0.92))] px-4 py-4 shadow-[var(--shadow-float)] sm:px-5"
      data-testid="cash-feed-item"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ink-muted)]">
              {item.type === "INCOME" ? "Entrada" : "Saida"}
            </p>
            {linkedLocation ? (
              <span className="inline-flex min-h-7 items-center rounded-full border border-[var(--accent-strong)]/20 bg-[rgba(164,87,42,0.1)] px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
                {linkedLocation.name}
              </span>
            ) : null}
          </div>
          <h4 className="mt-1 break-words text-balance font-serif text-xl leading-tight text-[var(--ink-strong)] sm:text-2xl">
            {item.description}
          </h4>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-[var(--ink-muted)]">
            <span>{formatDisplayDate(item.occurredOn)}</span>
            {linkedLocation ? (
              <span className="inline-flex min-h-7 items-center rounded-full border border-[var(--line-soft)] bg-[var(--card)]/72 px-3 text-[11px] font-medium leading-none text-[var(--ink-muted)]">
                {linkedLocation.city}/{linkedLocation.state}
              </span>
            ) : item.fairLocationId ? (
              <span className="inline-flex min-h-7 items-center rounded-full border border-[var(--line-soft)] bg-[var(--card)]/72 px-3 text-[11px] font-medium leading-none text-[var(--ink-muted)]">
                Local vinculado
              </span>
            ) : null}
          </div>
        </div>

        <div className="min-w-0 text-left sm:max-w-[11rem] sm:text-right">
          <p
            className={`break-all font-serif text-2xl leading-tight sm:text-3xl ${
              item.type === "INCOME" ? "text-emerald-700" : "text-rose-700"
            }`}
          >
            {item.type === "INCOME" ? "+" : "-"}
            {formatCurrency(item.amount)}
          </p>
          <p className="mt-1 text-xs uppercase tracking-[0.22em] text-[var(--ink-muted)]">
            {linkedLocation ? "Lancado com local vinculado" : "Lancado no caixa do periodo"}
          </p>
        </div>
      </div>
    </article>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[1.35rem] border border-[var(--line-soft)] bg-[var(--card)] px-4 py-4 shadow-[var(--shadow-float)]">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ink-muted)]">{label}</p>
      <p className="mt-2 break-all font-serif text-[1.7rem] leading-tight text-[var(--ink-strong)] sm:text-2xl">{formatCurrency(value)}</p>
    </div>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}
