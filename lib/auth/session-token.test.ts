import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { afterEach, describe, it } from "node:test";
import { passwordMatches, hasDashboardPassword } from "@/lib/auth/password";
import {
  SESSION_MAX_AGE_SECONDS,
  createSessionToken,
  sessionCookieOptions,
  verifySessionToken,
} from "@/lib/auth/session-token";

const ORIGINAL = process.env.DASHBOARD_PASSWORD;
const FIXTURE = "fixture-password";

afterEach(() => {
  if (ORIGINAL === undefined) delete process.env.DASHBOARD_PASSWORD;
  else process.env.DASHBOARD_PASSWORD = ORIGINAL;
});

describe("dashboard password", () => {
  it("rejects a wrong password and accepts the configured one", () => {
    process.env.DASHBOARD_PASSWORD = FIXTURE;
    assert.equal(hasDashboardPassword(), true);
    assert.equal(passwordMatches("no-es-la-clave"), false);
    assert.equal(passwordMatches(FIXTURE), true);
    assert.equal(passwordMatches(""), false);
  });

  it("stays closed when the server password is missing", () => {
    delete process.env.DASHBOARD_PASSWORD;
    assert.equal(hasDashboardPassword(), false);
    assert.equal(passwordMatches(FIXTURE), false);
  });
});

describe("signed session cookie", () => {
  it("accepts a signed token and rejects the password, tampering and expiry", async () => {
    process.env.DASHBOARD_PASSWORD = FIXTURE;
    const now = Date.parse("2026-10-15T12:00:00Z");
    const token = await createSessionToken(now);
    assert.ok(token);
    assert.equal(token === FIXTURE, false);
    assert.equal(token.includes(FIXTURE), false);
    assert.equal(await verifySessionToken(token, now + 1000), true);
    assert.equal(await verifySessionToken(FIXTURE, now + 1000), false);
    assert.equal(await verifySessionToken(`${token}x`, now + 1000), false);
    const [body] = token.split(".");
    assert.equal(await verifySessionToken(`${body}.aaaa`, now + 1000), false);
    assert.equal(
      await verifySessionToken(token, now + (SESSION_MAX_AGE_SECONDS + 120) * 1000),
      false,
    );
  });

  it("uses an HttpOnly cookie that JavaScript cannot read", () => {
    const options = sessionCookieOptions();
    assert.equal(options.httpOnly, true);
    assert.equal(options.sameSite, "lax");
    assert.equal(options.path, "/");
    assert.equal(sessionCookieOptions(0).maxAge, 0);
  });

  it("does not keep the email allowlist on the admin gate", () => {
    const session = readFileSync("lib/auth/session.ts", "utf8");
    const actions = readFileSync("lib/auth/actions.ts", "utf8");
    const proxy = readFileSync("proxy.ts", "utf8");
    assert.equal(session.includes("ADMIN_EMAILS"), false);
    assert.equal(session.includes("getUser"), false);
    assert.equal(actions.includes("signInWithPassword"), false);
    assert.equal(actions.includes("email"), false);
    assert.equal(proxy.includes("getUser"), false);
    assert.equal(proxy.includes("ADMIN_EMAILS"), false);
    assert.match(actions, /passwordMatches/);
    assert.match(actions, /createSessionToken/);
  });
});
