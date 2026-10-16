"use client";

import { signOut } from "@/lib/auth/actions";

export function SignOutButton() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-muted transition-colors hover:bg-hover hover:text-foreground"
      >
        Cerrar sesión
      </button>
    </form>
  );
}
