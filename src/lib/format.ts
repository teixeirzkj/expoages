const TZ = "America/Bahia";

export function formatDate(iso: string) {
  const d = new Date(iso.length === 10 ? `${iso}T12:00:00Z` : iso);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric", timeZone: TZ });
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TZ,
  });
}

export function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", timeZone: TZ });
}

export function truncate(text: string, max = 110) {
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
}

/** Converte texto com uma ideia por linha em itens de lista (remove "-", "•", "*"). */
export function toBullets(text: string) {
  return text
    .split(/\r?\n/)
    .map((l) => l.replace(/^\s*[-•*]\s*/, "").trim())
    .filter(Boolean);
}
