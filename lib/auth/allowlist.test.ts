import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isAllowedAdminEmail,
  parseAdminEmails,
} from "@/lib/auth/allowlist";
import { isDashboardAdminPath, safeNextPath } from "@/lib/auth/routes";

describe("admin allowlist", () => {
it("ignores blanks and normalizes case", () => {
  assert.deepEqual(
    parseAdminEmails("  Ana@Example.com, ,bob@example.com "),
    ["ana@example.com", "bob@example.com"],
  );
  assert.deepEqual(parseAdminEmails(undefined), []);
  assert.deepEqual(parseAdminEmails("not-an-email"), []);
});

it("only matches the provided list", () => {
  const list = ["admin@usadospremium.com.ar"];
  assert.equal(isAllowedAdminEmail("Admin@UsadosPremium.com.ar", list), true);
  assert.equal(isAllowedAdminEmail("otra@example.com", list), false);
  assert.equal(isAllowedAdminEmail("", list), false);
});

});

describe("admin routes", () => {
it("stay separate from the public catalog and APIs", () => {
  assert.equal(isDashboardAdminPath("/"), true);
  assert.equal(isDashboardAdminPath("/inventario"), true);
  assert.equal(isDashboardAdminPath("/equipos/abc/editar"), true);
  assert.equal(isDashboardAdminPath("/configuracion"), true);
  assert.equal(isDashboardAdminPath("/cotizador"), true);
  assert.equal(isDashboardAdminPath("/api/cotizador/quote"), false);
  assert.equal(isDashboardAdminPath("/api/exchange-rate"), false);
  assert.equal(isDashboardAdminPath("/api/mercadopago/checkout"), false);
  assert.equal(isDashboardAdminPath("/usados"), false);
  assert.equal(isDashboardAdminPath("/usados/cotizar-iphone"), false);
  assert.equal(isDashboardAdminPath("/cotizar-iphone"), false);
  assert.equal(isDashboardAdminPath("/ingresar"), false);
});

it("rejects external and non-admin return paths", () => {
  assert.equal(safeNextPath("/inventario"), "/inventario");
  assert.equal(safeNextPath("/cotizador"), "/cotizador");
  assert.equal(safeNextPath("/equipos/1?tab=fotos"), "/equipos/1?tab=fotos");
  assert.equal(safeNextPath("https://evil.example"), "/");
  assert.equal(safeNextPath("//evil.example"), "/");
  assert.equal(safeNextPath("/ingresar"), "/");
  assert.equal(safeNextPath("/api/cotizador/quote"), "/");
  assert.equal(safeNextPath("/usados"), "/");
});
});
