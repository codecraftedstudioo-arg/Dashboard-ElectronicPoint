import { Card, PageHeader } from "@/components/ui";

export default function ConfiguracionPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <PageHeader
        title="Configuración"
        subtitle="Ajustes generales del dashboard"
      />
      <Card>
        <h2 className="text-base font-semibold text-white">Moneda</h2>
        <p className="mt-2 text-sm text-muted">
          El sistema trabaja internamente en <strong className="text-white">USD</strong>.
          La arquitectura está preparada para agregar otras monedas más adelante
          sin cambiar los cálculos actuales.
        </p>
      </Card>
      <Card>
        <h2 className="text-base font-semibold text-white">Almacenamiento de imágenes</h2>
        <p className="mt-2 text-sm text-muted">
          Configurá <code className="text-accent">NEXT_PUBLIC_SUPABASE_URL</code> y{" "}
          <code className="text-accent">SUPABASE_SERVICE_ROLE_KEY</code> en{" "}
          <code className="text-zinc-300">.env</code> para subir imágenes a Supabase
          Storage. Sin esas variables, las imágenes se guardan en{" "}
          <code className="text-zinc-300">/public/uploads</code>.
        </p>
      </Card>
      <Card>
        <h2 className="text-base font-semibold text-white">Base de datos</h2>
        <p className="mt-2 text-sm text-muted">
          Desarrollo local usa SQLite vía Prisma. Para producción con Supabase,
          cambiá el provider a <code className="text-zinc-300">postgresql</code> y
          apuntá <code className="text-zinc-300">DATABASE_URL</code> a tu proyecto.
        </p>
      </Card>
    </div>
  );
}
