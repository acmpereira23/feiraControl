type FeedbackMessageProps = {
  message: string;
  tone: "error" | "info" | "success";
  role?: "alert" | "status";
};

const toneClassName: Record<FeedbackMessageProps["tone"], string> = {
  error:
    "border border-[var(--accent-expense)]/20 bg-[linear-gradient(180deg,rgba(176,74,90,0.12),rgba(255,248,248,0.96))] text-rose-900 shadow-[var(--shadow-float)]",
  info:
    "border border-[var(--accent-strong)]/18 bg-[linear-gradient(180deg,rgba(164,87,42,0.1),rgba(255,250,243,0.96))] text-[var(--ink-strong)] shadow-[var(--shadow-float)]",
  success:
    "border border-[var(--accent-income)]/20 bg-[linear-gradient(180deg,rgba(31,122,78,0.12),rgba(247,255,251,0.96))] text-emerald-900 shadow-[var(--shadow-float)]",
};

export function FeedbackMessage({
  message,
  role = "status",
  tone,
}: FeedbackMessageProps) {
  return (
    <div
      aria-live="polite"
      className={`rounded-[1.25rem] px-4 py-3.5 text-sm leading-6 ${toneClassName[tone]}`}
      role={role}
    >
      {message}
    </div>
  );
}
