import { redirect } from "next/navigation";
import { Smartphone } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";
import { Card } from "@/components/ui";
import { hasDashboardPassword } from "@/lib/auth/password";
import { safeNextPath } from "@/lib/auth/routes";
import { getVerifiedAdmin } from "@/lib/auth/session";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ingresar — Stock Apple",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const admin = await getVerifiedAdmin();
  const { next } = await searchParams;
  const nextPath = safeNextPath(next);
  if (admin) redirect(nextPath);

  const setupMessage = hasDashboardPassword()
    ? null
    : "El inicio de sesión no está configurado en el servidor.";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10 text-foreground">
      <Card className="w-full max-w-md">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-card-border bg-card text-accent">
            <Smartphone className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Stock Apple</h1>
            <p className="text-[11px] font-medium tracking-[0.18em] text-muted">
              USADOS
            </p>
          </div>
        </div>
        <p className="mb-5 text-sm text-muted">
          Ingresá la contraseña del panel para administrar el inventario.
        </p>
        <LoginForm nextPath={nextPath} setupMessage={setupMessage} />
      </Card>
    </div>
  );
}
