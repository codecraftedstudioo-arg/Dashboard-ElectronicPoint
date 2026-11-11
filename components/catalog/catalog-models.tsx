import { CatalogModelCarousel } from "@/components/catalog/catalog-model-carousel";
import { VARIED_OPPORTUNITIES_LABEL } from "@/lib/constants";
import type { CatalogModelGroup, PublicCatalogProduct } from "@/lib/public-catalog";

export function CatalogModels({
  groups,
  opportunities,
  variedOpportunities = [],
}: {
  groups: CatalogModelGroup[];
  opportunities: PublicCatalogProduct[];
  variedOpportunities?: PublicCatalogProduct[];
}) {
  if (
    groups.length === 0 &&
    opportunities.length === 0 &&
    variedOpportunities.length === 0
  ) {
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
      {groups.map((group) => (
        <div key={group.model} className="min-w-0">
          <CatalogModelCarousel
            model={group.model}
            products={group.products}
          />
        </div>
      ))}
      {variedOpportunities.length > 0 ? (
        <div className="min-w-0">
          <CatalogModelCarousel
            model={VARIED_OPPORTUNITIES_LABEL}
            products={variedOpportunities}
          />
        </div>
      ) : null}
    </div>
  );
}
