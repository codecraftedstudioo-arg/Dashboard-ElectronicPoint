"use client";

import { useState, useActionState } from "react";
import { Button, Input } from "@/components/ui";
import { signIn, type SignInState } from "@/lib/auth/actions";

export function LoginForm({
  nextPath,
  setupMessage,
}: {
  nextPath: string;
  setupMessage: string | null;
}) {
  const [state, action, pending] = useActionState<SignInState, FormData>(
    signIn,
    null,
  );
  const [visible, setVisible] = useState(false);
  const disabled = Boolean(setupMessage) || pending;

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={nextPath} />
      <label className="block text-sm font-medium text-foreground">
        Contraseña
        <span className="relative mt-1.5 block">
          <Input
            name="password"
            type={visible ? "text" : "password"}
            autoComplete="current-password"
            required
            className="pr-24"
            disabled={disabled}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted"
            onClick={() => setVisible((current) => !current)}
            aria-pressed={visible}
            disabled={disabled}
          >
            {visible ? "Ocultar" : "Mostrar"}
          </button>
        </span>
      </label>
      {setupMessage ? (
        <p className="text-sm text-amber-300 light:text-amber-800">{setupMessage}</p>
      ) : null}
      {state?.message ? (
        <p className="text-sm text-red-500">{state.message}</p>
      ) : null}
      <Button type="submit" className="w-full" disabled={disabled}>
        {pending ? "Ingresando…" : "Ingresar"}
      </Button>
    </form>
  );
}
