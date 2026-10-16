import { PricingEditor } from "@/components/cotizador/admin/pricing-editor";
import { PageHeader } from "@/components/ui";
import { requireDashboardPage } from "@/lib/auth/session";
import { DEMO_QUOTE_WARNING } from "@/lib/cotizador/demo-copy";
import {
  PENDING_MIGRATION_MESSAGE,
  loadQuoteAdminState,
} from "@/lib/cotizador/pricing-admin";

export const dynamic = "force-dynamic";

const dateFormat = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/Argentina/Buenos_Aires",
});

export default async function CotizadorPage() {
  await requireDashboardPage();
  const state = await loadQuoteAdminState();

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <PageHeader
        title="Cotizador"
        subtitle="Precios base, penalizaciones y vista previa"
      />

      <section className="rounded-xl border border-amber-500/40 bg-card p-5">
        <p className="text-xs font-semibold tracking-wide text-amber-300 light:text-amber-800">
          VIGENTE PARA EL PÚBLICO
        </p>
        {state.revisions.some((revision) => revision.status === "PUBLISHED") ? (
          <>
            <h2 className="mt-2 text-base font-semibold">Revisión comercial activada</h2>
            <p className="mt-2 text-sm text-muted">
              El cotizador público usa esa revisión. Guardar un borrador no la cambia. Para volver a la demostración hay que desactivarla con confirmación.
            </p>
          </>
        ) : (
          <>
            <h2 className="mt-2 text-base font-semibold">Configuración de demostración</h2>
            <p className="mt-2 text-sm text-muted">{DEMO_QUOTE_WARNING}</p>
            <p className="mt-2 text-sm text-muted">
              No hay una revisión comercial activada. El cotizador público sigue leyendo el JSON de demostración. Esos importes no están aprobados.
            </p>
          </>
        )}
      </section>

      {state.pendingMigration ? (
        <section className="rounded-xl border border-card-border bg-card p-5 text-sm text-muted">
          {PENDING_MIGRATION_MESSAGE}
        </section>
      ) : state.revisions.some((revision) => revision.status === "PUBLISHED") ? (
        <section className="rounded-xl border border-card-border bg-card p-5 text-sm text-muted">
          La revisión vigente figura en el historial. Guardar otra copia la deja como borrador hasta que la actives con confirmación.
        </section>
      ) : (
        <section className="rounded-xl border border-card-border bg-card p-5 text-sm text-muted">
          La base puede guardar borradores. La demostración inicial queda sin activar hasta que confirmes una revisión.
        </section>
      )}

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-xl border border-card-border bg-card p-5">
          <h2 className="text-base font-semibold">Reglas del motor</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>Los precios están en USD.</li>
            <li>Las penalizaciones porcentuales se suman y después se redondean a 5.</li>
            <li>Sin caja original es el único monto fijo.</li>
            <li>El valor final no baja de 0 y también se redondea a 5.</li>
          </ul>
        </article>
        <article className="rounded-xl border border-card-border bg-card p-5">
          <h2 className="text-base font-semibold">Plan Canje</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>El destino tiene que ser un iPhone publicado, disponible y sin reserva.</li>
            <li>El precio de destino sale del catálogo, no de esta planilla.</li>
            <li>La diferencia es el precio de venta menos el valor de toma.</li>
            <li>No hay bonificación por vender sin canje.</li>
          </ul>
        </article>
      </section>

      <PricingEditor
        demo={state.demo}
        pendingMigration={state.pendingMigration}
        pendingMessage={PENDING_MIGRATION_MESSAGE}
        revisions={state.revisions.map((revision) => ({
          ...revision,
          createdAtLabel: dateFormat.format(new Date(revision.createdAt)),
          publishedAtLabel: revision.publishedAt
            ? dateFormat.format(new Date(revision.publishedAt))
            : null,
        }))}
      />
    </div>
  );
}
