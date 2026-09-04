import { Card, PageHeader } from "@/components/ui";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export default function ConfiguracionPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <PageHeader
        title="Configuración"
        subtitle="Ajustes generales del dashboard"
      />
      <Card className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">Apariencia</h2>
          <p className="mt-2 text-sm text-muted">
            Cambiá entre modo oscuro y modo claro. La preferencia se guarda en este dispositivo.
          </p>
        </div>
        <ThemeToggle />
      </Card>
      <Card>
        <h2 className="text-base font-semibold text-foreground">Moneda</h2>
        <p className="mt-2 text-sm text-muted">
          El sistema trabaja y almacena precios en{" "}
          <strong className="text-foreground">USD</strong>. Podés visualizar
          equivalentes en <strong className="text-foreground">ARS</strong> con
          el selector USD/ARS, usando el dólar blue venta (DolarHoy) de forma
          dinámica. Los cálculos de costo, venta y ganancia siguen en dólares.
        </p>
      </Card>
      <Card>
        <h2 className="text-base font-semibold text-foreground">Almacenamiento de imágenes</h2>
        <p className="mt-2 text-sm text-muted">
          Configurá <code className="text-accent">NEXT_PUBLIC_SUPABASE_URL</code> y{" "}
          <code className="text-accent">SUPABASE_SERVICE_ROLE_KEY</code> en{" "}
          <code className="text-muted">.env</code> para subir imágenes a Supabase
          Storage. Sin esas variables, las imágenes se guardan en{" "}
          <code className="text-muted">/public/uploads</code>.
        </p>
      </Card>
      <Card>
        <h2 className="text-base font-semibold text-foreground">Base de datos</h2>
        <p className="mt-2 text-sm text-muted">
          Desarrollo local usa SQLite vía Prisma. Para producción con Supabase,
          cambiá el provider a <code className="text-muted">postgresql</code> y
          apuntá <code className="text-muted">DATABASE_URL</code> a tu proyecto.
        </p>
      </Card>
    </div>
  );
}
