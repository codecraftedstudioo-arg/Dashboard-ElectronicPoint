import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySessionToken } from "@/lib/auth/session-token";

export type VerifiedAdmin = { role: "dashboard" };

/** Confirms the signed HttpOnly session. It does not read a password or an email. */
export async function getVerifiedAdmin(): Promise<VerifiedAdmin | null> {
  try {
    const store = await cookies();
    const token = store.get("dashboard_session")?.value;
    if (!(await verifySessionToken(token))) return null;
    return { role: "dashboard" };
  } catch {
    return null;
  }
}

export async function requireAdmin(): Promise<VerifiedAdmin> {
  const admin = await getVerifiedAdmin();
  if (!admin) {
    throw new Error("No tenés permiso para hacer este cambio.");
  }
  return admin;
}

export async function requireDashboardPage(): Promise<VerifiedAdmin> {
  const admin = await getVerifiedAdmin();
  if (!admin) redirect("/ingresar");
  return admin;
}
