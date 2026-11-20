import "server-only";
import { createHmac, randomBytes } from "node:crypto";
import { headers } from "next/headers";

/**
 * Limitador de envios em memória.
 * - A chave é um HMAC do endereço de rede com um sal aleatório gerado a cada
 *   inicialização do servidor e renovado a cada 6 horas. O endereço em si
 *   nunca é gravado em banco, log ou arquivo; o contador some sozinho.
 * - Há também um teto global por minuto, que funciona mesmo sem endereço.
 * Limitação conhecida: em hospedagem serverless cada instância tem a sua
 * memória. Para produção, ver "Proteção contra abuso" no README.
 */
type Bucket = { count: number; resetAt: number };
const g = globalThis as unknown as {
  __hzRate?: { salt: Buffer; saltAt: number; buckets: Map<string, Bucket> };
};

function store() {
  const now = Date.now();
  if (!g.__hzRate || now - g.__hzRate.saltAt > 6 * 3600_000) {
    g.__hzRate = { salt: randomBytes(32), saltAt: now, buckets: new Map() };
  }
  return g.__hzRate;
}

function hit(key: string, limit: number, windowMs: number) {
  const s = store();
  const now = Date.now();
  const b = s.buckets.get(key);
  if (!b || b.resetAt < now) {
    s.buckets.set(key, { count: 1, resetAt: now + windowMs });
    if (s.buckets.size > 5000) {
      for (const [k, v] of s.buckets) if (v.resetAt < now) s.buckets.delete(k);
    }
    return true;
  }
  b.count += 1;
  return b.count <= limit;
}

export async function checkRateLimit(action: string, perClient = 6, windowMs = 10 * 60_000) {
  const h = await headers();
  const raw = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "anon";
  const key = createHmac("sha256", store().salt).update(raw).digest("base64url").slice(0, 22);
  const globalOk = hit(`global:${action}`, 120, 60_000);
  const clientOk = hit(`${action}:${key}`, perClient, windowMs);
  return globalOk && clientOk;
}

/** Envio rápido demais (preenchimento automatizado) ou honeypot preenchido. */
export function looksAutomated(startedAt: number, website: string, minMs = 2500) {
  const elapsed = Date.now() - startedAt;
  return website.length > 0 || elapsed < minMs || elapsed > 6 * 3600_000;
}
