"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { hasDashboardPassword, passwordMatches } from "@/lib/auth/password";
import { safeNextPath } from "@/lib/auth/routes";
import {
  SESSION_COOKIE,
  createSessionToken,
  sessionCookieOptions,
} from "@/lib/auth/session-token";

export type SignInState = { message: string } | null;

export async function signIn(
  _previous: SignInState,
  formData: FormData,
): Promise<SignInState> {
  if (!hasDashboardPassword()) {
    return { message: "El inicio de sesión no está configurado en el servidor." };
  }

  const password = String(formData.get("password") ?? "");
  if (!password) {
    return { message: "Ingresá la contraseña." };
  }
  if (!passwordMatches(password)) {
    return { message: "Contraseña incorrecta." };
  }

  const token = await createSessionToken();
  if (!token) {
    return { message: "No se pudo iniciar sesión." };
  }

  const store = await cookies();
  store.set(SESSION_COOKIE, token, sessionCookieOptions());
  redirect(safeNextPath(String(formData.get("next") ?? "")));
}

export async function signOut() {
  const store = await cookies();
  store.set(SESSION_COOKIE, "", sessionCookieOptions(0));
  redirect("/ingresar");
}
