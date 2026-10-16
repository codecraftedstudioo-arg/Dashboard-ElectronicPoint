/** Server-only allowlist. Never read this from a NEXT_PUBLIC_ variable. */
export function parseAdminEmails(raw: string | undefined): string[] {
  if (!raw) return [];
  const seen = new Set<string>();
  for (const part of raw.split(",")) {
    const email = part.trim().toLowerCase();
    if (!email.includes("@") || email.includes(" ")) continue;
    seen.add(email);
  }
  return [...seen];
}

export function isAllowedAdminEmail(
  email: string,
  allowlist = parseAdminEmails(process.env.ADMIN_EMAILS),
): boolean {
  const normalized = email.trim().toLowerCase();
  if (!normalized.includes("@")) return false;
  return allowlist.includes(normalized);
}

export function hasSupabaseAuthConfig(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export type AuthSetup = "ready" | "missing-auth" | "missing-allowlist";

export function authSetupState(): AuthSetup {
  if (!hasSupabaseAuthConfig()) return "missing-auth";
  if (parseAdminEmails(process.env.ADMIN_EMAILS).length === 0) {
    return "missing-allowlist";
  }
  return "ready";
}
