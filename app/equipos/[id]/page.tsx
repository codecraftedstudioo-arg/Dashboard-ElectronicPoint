import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, Button, Card, PageHeader } from "@/components/ui";
import { ProductGallery } from "@/components/products/product-gallery";
import { SellModal } from "@/components/products/sell-modal";
import { formatUSD } from "@/lib/currency";
import { calcProfit, formatMargin } from "@/lib/calculations";
import {
  CONDITION_COLORS,
  PHYSICAL_CONDITION_LABELS,
  PRODUCT_TYPE_LABELS,
  CHANNEL_COLORS,
  SALE_CHANNEL_LABELS,
} from "@/lib/constants";
import { getProductById } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  const profit = calcProfit(product.salePrice, product.cost);
  const realProfit = product.sale
    ? calcProfit(product.sale.soldPrice, product.cost)
    : null;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title={product.name}
        subtitle={`${product.internalCode} · ${PRODUCT_TYPE_LABELS[product.type]}`}
        actions={
          product.status === "AVAILABLE" ? (
            <>
              <Link href={`/equipos/${product.id}/editar`}>
                <Button variant="secondary">Editar</Button>
              </Link>
              <SellModal productId={product.id} defaultPrice={product.salePrice} />
            </>
          ) : (
            <Badge className="border-violet-500/30 bg-violet-500/15 text-violet-300">
              Vendido
            </Badge>
          )
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <ProductGallery
            images={product.images.map((img) => ({
              id: img.id,
              url: img.url,
              isPrimary: img.isPrimary,
            }))}
            productName={product.name}
          />
        </Card>

        <div className="space-y-4">
          <Card className="space-y-3">
            <Row label="Capacidad" value={product.storage} />
            <Row label="Color" value={product.color} />
            <Row label="IMEI" value={product.imei || "—"} />
            <Row
              label="Batería"
              value={
                product.batteryCondition != null
                  ? `${product.batteryCondition}%`
                  : "N/A"
              }
            />
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-muted">Estado físico</span>
              <Badge className={CONDITION_COLORS[product.physicalCondition]}>
                {PHYSICAL_CONDITION_LABELS[product.physicalCondition]}
              </Badge>
            </div>
            <Row
              label="Ingreso"
              value={product.createdAt.toLocaleDateString("es-AR")}
            />
            {product.description ? (
              <div>
                <div className="text-sm text-muted">Descripción</div>
                <p className="mt-1 text-sm text-foreground">{product.description}</p>
              </div>
            ) : null}
          </Card>

          <Card className="grid grid-cols-2 gap-4">
            <Metric label="Costo" value={formatUSD(product.cost)} />
            <Metric label="Precio venta" value={formatUSD(product.salePrice)} />
            <Metric
              label="Ganancia potencial"
              value={formatUSD(profit)}
              accent
            />
            <Metric
              label="Margen"
              value={formatMargin(product.salePrice, product.cost)}
            />
          </Card>

          {product.sale ? (
            <Card className="space-y-3">
              <h3 className="font-semibold text-foreground">Venta registrada</h3>
              <Row label="Precio final" value={formatUSD(product.sale.soldPrice)} />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Canal</span>
                <Badge className={CHANNEL_COLORS[product.sale.channel]}>
                  {SALE_CHANNEL_LABELS[product.sale.channel]}
                </Badge>
              </div>
              <Row
                label="Fecha"
                value={product.sale.soldAt.toLocaleDateString("es-AR")}
              />
              {realProfit != null ? (
                <Row label="Ganancia real" value={formatUSD(realProfit)} accent />
              ) : null}
              {product.sale.notes ? (
                <p className="text-sm text-muted">{product.sale.notes}</p>
              ) : null}
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-muted">{label}</span>
      <span className={accent ? "font-medium text-accent" : "font-medium text-foreground"}>
        {value}
      </span>
    </div>
  );
}

function Metric({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div>
      <div className="text-xs text-muted">{label}</div>
      <div className={`mt-1 text-lg font-semibold ${accent ? "text-accent" : "text-foreground"}`}>
        {value}
      </div>
    </div>
  );
}
