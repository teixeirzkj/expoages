import "server-only";
import { createHash, randomInt } from "node:crypto";

/** Alfabeto Crockford Base32: sem I, L, O e U para evitar confusões ao digitar. */
const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

function randomChunk(length: number) {
  let out = "";
  for (let i = 0; i < length; i++) out += ALPHABET[randomInt(ALPHABET.length)];
  return out;
}

/**
 * Gera um protocolo em duas partes:
 *  - `reference` (HZ-XXXX-XXXX, ~40 bits): identificador exibido à gestão.
 *  - `secret`    (XXXX-XXXX, ~40 bits): conhecido apenas por quem enviou.
 * O protocolo completo (HZ-XXXX-XXXX-XXXX-XXXX, ~80 bits) é necessário para
 * consultar o andamento. No banco guardamos somente o hash SHA-256 do segredo.
 */
export function generateProtocol() {
  const reference = `HZ-${randomChunk(4)}-${randomChunk(4)}`;
  const secret = `${randomChunk(4)}-${randomChunk(4)}`;
  return { reference, secret, full: `${reference}-${secret}`, secretHash: hashSecret(secret) };
}

export function splitProtocol(full: string) {
  const parts = full.split("-"); // HZ, A, B, C, D
  return { reference: parts.slice(0, 3).join("-"), secret: parts.slice(3).join("-") };
}

export function hashSecret(secret: string) {
  return createHash("sha256").update(secret, "utf8").digest("hex");
}
