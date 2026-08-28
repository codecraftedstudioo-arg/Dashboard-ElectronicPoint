import { CatalogModelCarousel } from "@/components/catalog/catalog-model-carousel";
import type { CatalogModelGroup } from "@/lib/public-catalog";

export function CatalogModels({ groups }: { groups: CatalogModelGroup[] }) {
  if (groups.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-card-border bg-card/50 px-6 py-16 text-center">
        <h3 className="text-lg font-semibold text-foreground">
          No hay equipos publicados en este momento.
        </h3>
        <p className="mt-2 text-sm text-muted">Volvé más tarde para ver el catálogo.</p>
      </div>
    );
  }

  return (
    <div className="flex w-full min-w-0 max-w-full flex-col gap-7 sm:gap-8">
      {groups.map((group, index) => (
        <div
          key={group.model}
          className={
            index === 0
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
