/**
 * Gera CSV seguro: aspas escapadas e neutralização de "CSV injection"
 * (células iniciadas por = + - @ seriam executadas como fórmula no Excel).
 */
export function toCsv(head: string[], rows: (string | number | null | undefined)[][]) {
  const cell = (v: string | number | null | undefined) => {
    let s = v === null || v === undefined ? "" : String(v);
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
    return `"${s.replace(/"/g, '""')}"`;
  };
  // BOM para acentuação correta ao abrir no Excel; separador ";" (padrão pt-BR).
  return "﻿" + [head, ...rows].map((r) => r.map(cell).join(";")).join("\r\n");
}
