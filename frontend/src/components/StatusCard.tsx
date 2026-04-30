type StatusCardProps = {
  title: string;
  description: string;
};

export function StatusCard({ title, description }: StatusCardProps) {
  return (
    <article className="group rounded-[1.5rem] border border-white/10 bg-stone-900/80 p-5 transition-transform duration-200 hover:-translate-y-1 hover:border-ember-400/30">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-white">{title}</h2>
        <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-300">
          Planejado
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-stone-400">{description}</p>
    </article>
  );
}

