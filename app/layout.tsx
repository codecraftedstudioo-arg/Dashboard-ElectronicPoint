import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies, headers } from "next/headers";
import { CatalogSiteProvider } from "@/components/catalog/catalog-site-context";
import { AppShell } from "@/components/layout/app-shell";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { hostFromHeaders, isCatalogHost } from "@/lib/domains";
import { parseTheme, THEME_COOKIE } from "@/lib/theme";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Stock Apple USADOS",
  description: "Dashboard interno de inventario de equipos Apple usados",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const theme = parseTheme(cookieStore.get(THEME_COOKIE)?.value);
  const isCatalogSite =
    headerStore.get("x-catalog-site") === "1" ||
    isCatalogHost(hostFromHeaders(headerStore));

  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased${theme === "light" ? " light" : ""}`}
      style={{ colorScheme: theme }}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-background font-sans text-foreground">
        <ThemeProvider initialTheme={theme}>
          <CatalogSiteProvider isCatalogSite={isCatalogSite}>
            <AppShell isCatalogSite={isCatalogSite}>{children}</AppShell>
          </CatalogSiteProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
