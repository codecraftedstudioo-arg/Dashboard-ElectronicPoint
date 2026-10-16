import { CatalogModelCarousel } from "@/components/catalog/catalog-model-carousel";
import type { CatalogModelGroup, PublicCatalogProduct } from "@/lib/public-catalog";

export function CatalogModels({
  groups,
  opportunities,
}: {
  groups: CatalogModelGroup[];
  opportunities: PublicCatalogProduct[];
}) {
  if (groups.length === 0 && opportunities.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-card-border bg-card/50 px-6 py-16 text-center">
        <h3 className="text-lg font-semibold text-foreground">
          No encontramos equipos
        </h3>
        <p className="mt-2 text-sm text-muted">
          Cuando haya equipos publicados, van a aparecer acá.
        </p>
      </div>
    );
  }

  return (
    <div className="flex w-full min-w-0 max-w-full flex-col gap-7 sm:gap-8">
      {opportunities.length > 0 ? (
        <div className="min-w-0">
          <CatalogModelCarousel model="Oportunidades" products={opportunities} />
        </div>
      ) : null}
      {groups.map((group, index) => (
        <div
          key={group.model}
          className={
            opportunities.length === 0 && index === 0
              ? "min-w-0"
              : "min-w-0 border-t border-card-border/80 pt-6 sm:pt-7"
          }
        >
          <CatalogModelCarousel
            model={group.model}
            products={group.products}
          />
        </div>
      ))}
    </div>
  );
}
