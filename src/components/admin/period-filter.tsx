import Form from "next/form";
import Link from "next/link";

const control =
  "h-11 rounded-xl border border-petrol/15 bg-card px-3 text-sm focus:border-petrol focus:outline-none focus:ring-4 focus:ring-terracotta/20";

/** Filtro de período (GET), funciona mesmo sem JavaScript. */
export function PeriodFilter({ action, from, to }: { action: string; from?: string; to?: string }) {
  return (
    <Form action={action} className="mb-6 flex flex-wrap items-end gap-2.5">
      <label className="flex flex-col text-xs text-ink/55">
        De
        <input type="date" name="de" defaultValue={from} className={control} />
      </label>
      <label className="flex flex-col text-xs text-ink/55">
        Até
        <input type="date" name="ate" defaultValue={to} className={control} />
      </label>
      <button type="submit" className="h-11 rounded-xl bg-petrol px-4 text-sm font-semibold text-ivory">Aplicar período</button>
      {(from || to) && (
        <Link href={action} className="flex h-11 items-center rounded-xl px-3 text-sm text-ink/60 hover:bg-ivory-2">Todo o período</Link>
      )}
    </Form>
  );
}
