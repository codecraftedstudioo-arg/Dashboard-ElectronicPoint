"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Select } from "@/components/ui";
import {
  activateQuoteRevisionAction,
  deactivateQuoteRevisionAction,
  previewQuoteDraftAction,
  saveQuoteDraftAction,
} from "@/lib/cotizador/pricing-actions";
import { DEDUCTION_LABELS, formatStorage } from "@/lib/cotizador/pricing-engine";
import {
  PENALTY_SPECS,
  type DraftPenalty,
  type DraftPrice,
  type PenaltyKind,
  type QuoteDraftInput,
} from "@/lib/cotizador/pricing-draft";
import { roundTo5 } from "@/lib/cotizador/pricing-engine";
import type { QuoteAnswers } from "@/lib/cotizador/types";

type RevisionOption = {
  id: string;
  status: "DRAFT" | "PUBLISHED";
  note: string | null;
  createdBy: string;
  createdAtLabel: string;
  publishedAtLabel: string | null;
  publishedBy: string | null;
  draft: QuoteDraftInput;
};

type PreviewState = {
  basePrice: number;
  finalPrice: number;
  lines: { reason: string; amount: number }[];
};

type EditorSection = "precios" | "penalizaciones" | "vista-previa";

const SECTIONS: { id: EditorSection; label: string }[] = [
  { id: "precios", label: "Precios base" },
  { id: "penalizaciones", label: "Penalizaciones" },
  { id: "vista-previa", label: "Vista previa" },
];

const EMPTY_ANSWERS: QuoteAnswers = {
  model: "iPhone 15 Pro",
  storage: "128",
  screenCondition: "perfect",
  backCondition: "perfect",
  frameCondition: "perfect",
  hasLiquidDamage: false,
  batteryHealth: "good",
  originalParts: { screen: true, battery: true },
  hasOriginalBox: true,
  functionalityIssues: {
    faceId: false,
    camera: false,
    audio: false,
    charging: false,
  },
};

function cloneDraft(draft: QuoteDraftInput): QuoteDraftInput {
  return {
    note: draft.note,
    prices: draft.prices.map((price) => ({ ...price })),
    penalties: draft.penalties.map((penalty) => ({ ...penalty })),
  };
}

function priceGroups(prices: DraftPrice[]) {
  const groups: { model: string; rows: { index: number; storage: string }[] }[] = [];
  prices.forEach((price, index) => {
    const current = groups[groups.length - 1];
    if (!current || current.model !== price.model) {
      groups.push({ model: price.model, rows: [] });
    }
    groups[groups.length - 1]?.rows.push({ index, storage: price.storage });
  });
  return groups;
}

function referenceBaseUsd(prices: DraftPrice[]) {
  const preferred = prices.find(
    (price) => price.model === "iPhone 15 Pro" && price.storage === "128",
  );
  return preferred?.priceUsd ?? prices[0]?.priceUsd ?? 0;
}

export function PricingEditor({
  demo,
  revisions,
  pendingMigration,
  pendingMessage,
}: {
  demo: QuoteDraftInput;
  revisions: RevisionOption[];
  pendingMigration: boolean;
  pendingMessage: string;
}) {
  const [draft, setDraft] = useState(() => cloneDraft(demo));
  const [source, setSource] = useState("demo");
  const [answers, setAnswers] = useState<QuoteAnswers>(EMPTY_ANSWERS);
  const [section, setSection] = useState<EditorSection>("precios");
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const [message, setMessage] = useState<string | null>(
    pendingMigration ? pendingMessage : null,
  );
  const [saving, startSave] = useTransition();
  const [previewing, startPreview] = useTransition();
  const [activating, startActivation] = useTransition();
  const [confirmedId, setConfirmedId] = useState<string | null>(null);
  const router = useRouter();

  const storages = draft.prices
    .filter((price) => price.model === answers.model)
    .map((price) => price.storage);

  function loadDraft(next: QuoteDraftInput, nextSource: string) {
    const cloned = cloneDraft(next);
    setDraft(cloned);
    setSource(nextSource);
    setPreview(null);
    setMessage(null);
    if (!cloned.prices.some((price) => price.model === answers.model && price.storage === answers.storage)) {
      const first = cloned.prices[0];
      if (first) {
        setAnswers((current) => ({
          ...current,
          model: first.model,
          storage: first.storage as QuoteAnswers["storage"],
        }));
      }
    }
  }

  function updatePrice(index: number, raw: string) {
    const priceUsd = Number(raw);
    setDraft((current) => ({
      ...current,
      prices: current.prices.map((price, priceIndex) =>
        priceIndex === index ? { ...price, priceUsd } : price,
      ),
    }));
  }

  function updatePenalty(index: number, raw: string) {
    const value = Number(raw);
    setDraft((current) => ({
      ...current,
      penalties: current.penalties.map((penalty, penaltyIndex) =>
        penaltyIndex === index ? { ...penalty, value } : penalty,
      ),
    }));
  }

  function updatePenaltyKind(index: number, kind: PenaltyKind) {
    setDraft((current) => {
      const base = referenceBaseUsd(current.prices);
      return {
        ...current,
        penalties: current.penalties.map((penalty, penaltyIndex) => {
          if (penaltyIndex !== index || penalty.kind === kind) return penalty;
          if (kind === "FIXED_USD" && penalty.kind === "PERCENTAGE") {
            return {
              ...penalty,
              kind,
              value: roundTo5(base * penalty.value),
            };
          }
          if (kind === "PERCENTAGE" && penalty.kind === "FIXED_USD") {
            const next =
              base > 0 ? Math.min(1, Math.round((penalty.value / base) * 1000) / 1000) : 0;
            return { ...penalty, kind, value: next };
          }
          return { ...penalty, kind };
        }),
      };
    });
  }

  function save() {
    setMessage(null);
    startSave(async () => {
      const result = await saveQuoteDraftAction({
        note: draft.note,
        prices: draft.prices,
        penalties: draft.penalties,
      });
      setMessage(result.ok ? "Borrador guardado. El cotizador público no cambió." : result.message);
    });
  }

  function changePublication(revision: RevisionOption) {
    setMessage(null);
    startActivation(async () => {
      const confirmed = confirmedId === revision.id;
      const result =
        revision.status === "PUBLISHED"
          ? await deactivateQuoteRevisionAction(revision.id, confirmed)
          : await activateQuoteRevisionAction(revision.id, confirmed);
      setMessage(
        result.ok
          ? revision.status === "PUBLISHED"
            ? "La revisión dejó de estar vigente. El cotizador público volvió a la demostración."
            : "Revisión activada. El cotizador público ahora usa estos valores."
          : result.message,
      );
      if (result.ok) {
        setConfirmedId(null);
        router.refresh();
      }
    });
  }

  function calculatePreview() {
    setMessage(null);
    startPreview(async () => {
      const result = await previewQuoteDraftAction({
        draft,
        answers,
      });
      if (!result.ok) {
        setPreview(null);
        setMessage(result.message);
        return;
      }
      setPreview({
        basePrice: result.basePrice,
        finalPrice: result.finalPrice,
        lines: result.lines,
      });
    });
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-card-border bg-card p-5">
        <h2 className="text-base font-semibold">Historial</h2>
        <p className="mt-2 text-sm text-muted">
          Cada guardado crea una revisión nueva. Solo una puede estar vigente, y hace falta confirmarlo.
        </p>
        {revisions.length === 0 ? (
          <p className="mt-4 text-sm text-muted">Todavía no hay revisiones guardadas en la base.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {revisions.map((revision) => {
              const live = revision.status === "PUBLISHED";
              return (
                <li
                  key={revision.id}
                  className="flex flex-col gap-3 rounded-xl border border-card-border px-4 py-3"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="text-sm font-medium">
                        {live ? "Vigente" : "Borrador"} · {revision.createdAtLabel}
                      </div>
                      <div className="text-xs text-muted">Guardada por {revision.createdBy}</div>
                      {live && revision.publishedAtLabel ? (
                        <div className="text-xs text-muted">
                          Activada el {revision.publishedAtLabel} por {revision.publishedBy ?? "panel"}
                        </div>
                      ) : null}
                      {revision.note ? <div className="mt-1 text-sm">{revision.note}</div> : null}
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => loadDraft(revision.draft, revision.id)}
                    >
                      {source === revision.id ? "Editando" : "Editar copia"}
                    </Button>
                  </div>
                  {pendingMigration ? null : (
                    <div className="flex flex-col gap-3 border-t border-card-border pt-3 sm:flex-row sm:items-center sm:justify-between">
                      <label className="flex items-start gap-2 text-sm text-muted">
                        <input
                          type="checkbox"
                          className="mt-1"
                          checked={confirmedId === revision.id}
                          onChange={(event) =>
                            setConfirmedId(event.target.checked ? revision.id : null)
                          }
                        />
                        <span>
                          {live
                            ? "Confirmo que el cotizador público vuelve a la demostración."
                            : "Confirmo que esta revisión pasa a ser la única configuración vigente."}
                        </span>
                      </label>
                      <Button
                        type="button"
                        variant={live ? "secondary" : "primary"}
                        disabled={activating || confirmedId !== revision.id}
                        onClick={() => changePublication(revision)}
                      >
                        {activating
                          ? "Aplicando…"
                          : live
                            ? "Dejar de usar"
                            : "Activar"}
                      </Button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Secciones del cotizador">
        {SECTIONS.map((item) => {
          const selected = section === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setSection(item.id)}
              className={
                selected
                  ? "rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-contrast"
                  : "rounded-full border border-card-border bg-card px-4 py-2 text-sm font-medium text-muted hover:text-foreground"
              }
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {section === "precios" ? (
      <section className="rounded-xl border border-card-border bg-card p-5" role="tabpanel">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-base font-semibold">Precios base</h2>
            <p className="mt-2 text-sm text-muted">
              {source === "demo"
                ? "Estás editando una copia de la demostración. Guardar no la reemplaza."
                : "Estás editando un borrador ya guardado. Guardar crea otra revisión."}
            </p>
          </div>
          <Button type="button" variant="secondary" onClick={() => loadDraft(demo, "demo")}>
            Volver a la demostración
          </Button>
        </div>
        <label className="mt-4 block text-sm font-medium">
          Nota del próximo borrador
          <textarea
            value={draft.note ?? ""}
            onChange={(event) =>
              setDraft((current) => ({ ...current, note: event.target.value }))
            }
            rows={2}
            maxLength={280}
            className="mt-1.5 w-full rounded-xl border border-card-border bg-input px-3.5 py-2.5 text-sm text-foreground outline-none"
          />
        </label>
        <div className="mt-5 space-y-5">
          {priceGroups(draft.prices).map((group) => (
            <div key={group.model}>
              <h3 className="text-sm font-semibold">{group.model}</h3>
              <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {group.rows.map((row) => (
                  <label key={`${group.model}-${row.storage}`} className="text-xs text-muted">
                    {formatStorage(row.storage)}
                    <Input
                      type="number"
                      min={0}
                      step={1}
                      inputMode="numeric"
                      className="mt-1"
                      value={Number.isFinite(draft.prices[row.index]?.priceUsd) ? draft.prices[row.index]?.priceUsd : ""}
                      onChange={(event) => updatePrice(row.index, event.target.value)}
                    />
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button type="button" onClick={save} disabled={pendingMigration || saving}>
            {saving ? "Guardando…" : "Guardar borrador"}
          </Button>
        </div>
        {message ? <p className="mt-3 text-sm text-muted">{message}</p> : null}
      </section>
      ) : null}

      {section === "penalizaciones" ? (
      <section className="rounded-xl border border-card-border bg-card p-5" role="tabpanel">
        <h2 className="text-base font-semibold">Penalizaciones</h2>
        <p className="mt-2 text-sm text-muted">
          Cada penalización puede ser un porcentaje del precio base o un monto fijo en USD. La equivalencia
          usa como referencia{" "}
          {referenceBaseUsd(draft.prices) > 0
            ? `USD ${referenceBaseUsd(draft.prices)} (iPhone 15 Pro 128 GB o el primer precio del borrador).`
            : "el precio base del borrador."}
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {draft.penalties.map((penalty, index) => (
            <PenaltyField
              key={penalty.key}
              penalty={penalty}
              referenceBaseUsd={referenceBaseUsd(draft.prices)}
              onChange={(raw) => updatePenalty(index, raw)}
              onKindChange={(kind) => updatePenaltyKind(index, kind)}
            />
          ))}
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button type="button" onClick={save} disabled={pendingMigration || saving}>
            {saving ? "Guardando…" : "Guardar borrador"}
          </Button>
        </div>
        {message ? <p className="mt-3 text-sm text-muted">{message}</p> : null}
      </section>
      ) : null}

      {section === "vista-previa" ? (
      <section className="rounded-xl border border-card-border bg-card p-5" role="tabpanel">
        <h2 className="text-base font-semibold">Vista previa</h2>
        <p className="mt-2 text-sm text-muted">
          Calcula con los valores de esta pantalla. No se guarda y no consulta el endpoint público.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            Modelo
            <Select
              className="mt-1.5"
              value={answers.model}
              onChange={(event) => {
                const model = event.target.value;
                const storage = draft.prices.find((price) => price.model === model)?.storage ?? "128";
                setAnswers((current) => ({
                  ...current,
                  model,
                  storage: storage as QuoteAnswers["storage"],
                }));
              }}
            >
              {priceGroups(draft.prices).map((group) => (
                <option key={group.model} value={group.model}>
                  {group.model}
                </option>
              ))}
            </Select>
          </label>
          <label className="text-sm">
            Capacidad
            <Select
              className="mt-1.5"
              value={answers.storage}
              onChange={(event) =>
                setAnswers((current) => ({
                  ...current,
                  storage: event.target.value as QuoteAnswers["storage"],
                }))
              }
            >
              {storages.map((storage) => (
                <option key={storage} value={storage}>
                  {formatStorage(storage)}
                </option>
              ))}
            </Select>
          </label>
          <label className="text-sm">
            Pantalla
            <Select
              className="mt-1.5"
              value={answers.screenCondition}
              onChange={(event) =>
                setAnswers((current) => ({
                  ...current,
                  screenCondition: event.target.value as QuoteAnswers["screenCondition"],
                }))
              }
            >
              <option value="perfect">Impecable</option>
              <option value="scratches">Rayones</option>
              <option value="cracked">Rajada</option>
            </Select>
          </label>
          <label className="text-sm">
            Tapa
            <Select
              className="mt-1.5"
              value={answers.backCondition}
              onChange={(event) =>
                setAnswers((current) => ({
                  ...current,
                  backCondition: event.target.value as QuoteAnswers["backCondition"],
                }))
              }
            >
              <option value="perfect">Impecable</option>
              <option value="cracked">Rota</option>
            </Select>
          </label>
          <label className="text-sm">
            Marco
            <Select
              className="mt-1.5"
              value={answers.frameCondition}
              onChange={(event) =>
                setAnswers((current) => ({
                  ...current,
                  frameCondition: event.target.value as QuoteAnswers["frameCondition"],
                }))
              }
            >
              <option value="perfect">Impecable</option>
              <option value="damaged">Dañado</option>
            </Select>
          </label>
          <label className="text-sm">
            Batería
            <Select
              className="mt-1.5"
              value={answers.batteryHealth}
              onChange={(event) =>
                setAnswers((current) => ({
                  ...current,
                  batteryHealth: event.target.value as QuoteAnswers["batteryHealth"],
                }))
              }
            >
              <option value="good">85 % o más</option>
              <option value="low">Menor a 85 %</option>
            </Select>
          </label>
        </div>
        <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          <Check
            label="Daño por líquido"
            checked={answers.hasLiquidDamage}
            onChange={(checked) => setAnswers((current) => ({ ...current, hasLiquidDamage: checked }))}
          />
          <Check
            label="Tiene caja original"
            checked={answers.hasOriginalBox}
            onChange={(checked) => setAnswers((current) => ({ ...current, hasOriginalBox: checked }))}
          />
          <Check
            label="Pantalla original"
            checked={answers.originalParts.screen}
            onChange={(checked) =>
              setAnswers((current) => ({
                ...current,
                originalParts: { ...current.originalParts, screen: checked },
              }))
            }
          />
          <Check
            label="Batería original"
            checked={answers.originalParts.battery}
            onChange={(checked) =>
              setAnswers((current) => ({
                ...current,
                originalParts: { ...current.originalParts, battery: checked },
              }))
            }
          />
          <Check
            label="Falla Face ID"
            checked={answers.functionalityIssues.faceId}
            onChange={(checked) =>
              setAnswers((current) => ({
                ...current,
                functionalityIssues: { ...current.functionalityIssues, faceId: checked },
              }))
            }
          />
          <Check
            label="Falla la cámara"
            checked={answers.functionalityIssues.camera}
            onChange={(checked) =>
              setAnswers((current) => ({
                ...current,
                functionalityIssues: { ...current.functionalityIssues, camera: checked },
              }))
            }
          />
          <Check
            label="Falla el audio"
            checked={answers.functionalityIssues.audio}
            onChange={(checked) =>
              setAnswers((current) => ({
                ...current,
                functionalityIssues: { ...current.functionalityIssues, audio: checked },
              }))
            }
          />
          <Check
            label="Falla la carga"
            checked={answers.functionalityIssues.charging}
            onChange={(checked) =>
              setAnswers((current) => ({
                ...current,
                functionalityIssues: { ...current.functionalityIssues, charging: checked },
              }))
            }
          />
        </div>
        <Button type="button" className="mt-4" variant="secondary" onClick={calculatePreview} disabled={previewing}>
          {previewing ? "Calculando…" : "Calcular vista previa"}
        </Button>
        {preview ? (
          <div className="mt-4 rounded-xl border border-card-border px-4 py-3 text-sm">
            <p>Base: USD {preview.basePrice}</p>
            <p className="mt-1 font-semibold">Valor de toma: USD {preview.finalPrice}</p>
            {preview.lines.length > 0 ? (
              <ul className="mt-2 space-y-1 text-muted">
                {preview.lines.map((line) => (
                  <li key={line.reason}>
                    {DEDUCTION_LABELS[line.reason] ?? line.reason}: USD {line.amount}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-muted">Sin penalizaciones.</p>
            )}
          </div>
        ) : null}
      </section>
      ) : null}
    </div>
  );
}

function PenaltyField({
  penalty,
  referenceBaseUsd,
  onChange,
  onKindChange,
}: {
  penalty: DraftPenalty;
  referenceBaseUsd: number;
  onChange: (raw: string) => void;
  onKindChange: (kind: PenaltyKind) => void;
}) {
  const spec = PENALTY_SPECS.find((item) => item.key === penalty.key);
  const percentPoints =
    penalty.kind === "PERCENTAGE" ? Math.round(penalty.value * 1000) / 10 : null;
  const usdFromPercent =
    penalty.kind === "PERCENTAGE" && referenceBaseUsd > 0
      ? roundTo5(referenceBaseUsd * penalty.value)
      : null;
  const percentFromUsd =
    penalty.kind === "FIXED_USD" && referenceBaseUsd > 0
      ? Math.round((penalty.value / referenceBaseUsd) * 1000) / 10
      : null;

  return (
    <div className="rounded-xl border border-card-border px-3 py-3 text-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-medium">{spec?.label ?? penalty.key}</p>
          <p className="mt-0.5 text-xs text-muted">
            {penalty.kind === "PERCENTAGE"
              ? usdFromPercent !== null
                ? `${percentPoints} % · ≈ USD ${usdFromPercent} sobre la base de referencia`
                : `${percentPoints} %`
              : percentFromUsd !== null
                ? `USD ${penalty.value} · ≈ ${percentFromUsd} % sobre la base de referencia`
                : `USD ${penalty.value}`}
          </p>
        </div>
        <div className="flex shrink-0 gap-1" role="group" aria-label={`Tipo de ${spec?.label ?? penalty.key}`}>
          <button
            type="button"
            onClick={() => onKindChange("PERCENTAGE")}
            className={
              penalty.kind === "PERCENTAGE"
                ? "rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-contrast"
                : "rounded-full border border-card-border px-3 py-1 text-xs font-medium text-muted hover:text-foreground"
            }
          >
            %
          </button>
          <button
            type="button"
            onClick={() => onKindChange("FIXED_USD")}
            className={
              penalty.kind === "FIXED_USD"
                ? "rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-contrast"
                : "rounded-full border border-card-border px-3 py-1 text-xs font-medium text-muted hover:text-foreground"
            }
          >
            USD
          </button>
        </div>
      </div>
      <label className="mt-3 block text-xs text-muted">
        {penalty.kind === "PERCENTAGE" ? "Porcentaje" : "Monto en USD"}
        <Input
          type="number"
          min={0}
          max={penalty.kind === "PERCENTAGE" ? 100 : undefined}
          step={penalty.kind === "PERCENTAGE" ? 0.1 : 1}
          inputMode="decimal"
          className="mt-1.5"
          value={
            penalty.kind === "PERCENTAGE"
              ? percentPoints ?? ""
              : Number.isFinite(penalty.value)
                ? penalty.value
                : ""
          }
          onChange={(event) => {
            if (penalty.kind === "PERCENTAGE") {
              const points = Number(event.target.value);
              onChange(Number.isFinite(points) ? String(points / 100) : event.target.value);
              return;
            }
            onChange(event.target.value);
          }}
        />
      </label>
    </div>
  );
}

function Check({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      {label}
    </label>
  );
}
