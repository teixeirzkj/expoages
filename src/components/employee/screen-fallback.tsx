export function EmployeeFallback() {
  return (
    <div className="min-h-dvh bg-cream">
      <div className="h-16 bg-navy" />
      <div className="mx-auto max-w-4xl space-y-4 px-5 pt-8" aria-busy="true" aria-label="Carregando">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-cream-2" />
        <div className="h-40 animate-pulse rounded-[var(--radius-card)] bg-white" />
        <div className="h-24 animate-pulse rounded-[var(--radius-card)] bg-white" />
      </div>
    </div>
  );
}
