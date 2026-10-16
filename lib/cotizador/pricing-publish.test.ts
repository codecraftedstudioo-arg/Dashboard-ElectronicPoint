import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { saveQuoteDraft } from "@/lib/cotizador/pricing-admin";
import { demoQuoteDraft } from "@/lib/cotizador/pricing-draft";
import {
  activateQuoteRevision,
  activationConfirmed,
  deactivationConfirmed,
  deactivateQuoteRevision,
} from "@/lib/cotizador/pricing-publish";

describe("publication confirmation", () => {
  it("requires an explicit boolean confirmation", () => {
    assert.equal(activationConfirmed(true).ok, true);
    assert.equal(activationConfirmed(false).ok, false);
    assert.equal(activationConfirmed("true").ok, false);
    assert.equal(activationConfirmed(undefined).ok, false);
    assert.equal(deactivationConfirmed(true).ok, true);
    assert.equal(deactivationConfirmed(false).ok, false);
  });
});

describe("publication permissions", () => {
  it("rejects draft writes and publication without an admin session", async () => {
    await assert.rejects(() => saveQuoteDraft(demoQuoteDraft()), /permiso/);
    await assert.rejects(() => activateQuoteRevision("demo-json-draft", true), /permiso/);
    await assert.rejects(() => deactivateQuoteRevision("demo-json-draft", true), /permiso/);
  });
});
