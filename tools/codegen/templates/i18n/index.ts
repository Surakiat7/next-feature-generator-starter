export interface I18nConfig {
  locales: string[];
  defaultLocale: string;
  localePrefix: "always" | "as-needed" | "never";
  /** Import path alias, e.g. "@". */
  pathAlias: string;
  /** Relative path from src/i18n to the messages dir, e.g. "../../locales". */
  messagesRelDir: string;
}

export function routingFile(cfg: I18nConfig): string {
  const localesList = cfg.locales.map((l) => JSON.stringify(l)).join(", ");
  return `import { defineRouting } from "next-intl/routing";

/**
 * i18n routing configuration (next-intl). This is the source of truth for the
 * available locales, the default locale, and how the locale prefix appears in
 * the URL.
 */
export const routing = defineRouting({
  locales: [${localesList}],
  defaultLocale: ${JSON.stringify(cfg.defaultLocale)},
  localePrefix: ${JSON.stringify(cfg.localePrefix)},
});

export type Locale = (typeof routing.locales)[number];
`;
}

export function navigationFile(): string {
  return `import { createNavigation } from "next-intl/navigation";

import { routing } from "./routing";

/**
 * Locale-aware navigation helpers. Prefer these over \`next/link\` and
 * \`next/navigation\` so locale prefixes are handled automatically. Use them
 * together with the semantic paths from \`@/routes/paths\`.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
`;
}

export function requestFile(cfg: I18nConfig): string {
  return `import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";

import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(\`${cfg.messagesRelDir}/\${locale}.json\`)).default,
  };
});
`;
}

export function proxyFile(cfg: I18nConfig): string {
  return `import createMiddleware from "next-intl/middleware";

import { routing } from "${cfg.pathAlias}/i18n/routing";

/**
 * Next.js 16 Proxy (formerly Middleware). next-intl handles locale detection
 * and prefixing here.
 */
export default createMiddleware(routing);

export const config = {
  // Skip API routes, Next internals, and files with an extension.
  matcher: ["/((?!api|_next|_vercel|.*\\\\..*).*)"],
};
`;
}

export function localeLayoutFile(cfg: I18nConfig): string {
  return `import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";

import { routing } from "${cfg.pathAlias}/i18n/routing";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Next Feature Starter",
  description: "Feature-based Next.js starter with built-in code generation.",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={\`\${geistSans.variable} \${geistMono.variable} h-full antialiased\`}
    >
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
`;
}

export function localeHomePageFile(cfg: I18nConfig): string {
  return `import { useTranslations } from "next-intl";

import { LocaleSwitcher } from "${cfg.pathAlias}/components/locale-switcher";

export default function Home() {
  const t = useTranslations("Home");
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
      <p className="max-w-md text-zinc-600 dark:text-zinc-400">
        {t("description")}
      </p>
      <LocaleSwitcher />
    </main>
  );
}
`;
}

export function localeSwitcherFile(cfg: I18nConfig): string {
  return `"use client";

import { useLocale } from "next-intl";

import { routing } from "${cfg.pathAlias}/i18n/routing";
import { usePathname, useRouter } from "${cfg.pathAlias}/i18n/navigation";

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div role="group" aria-label="Language" className="inline-flex gap-1 rounded-md border p-1">
      {routing.locales.map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={option === locale}
          onClick={() => router.replace(pathname, { locale: option })}
          className="rounded px-2 py-1 text-sm uppercase aria-pressed:bg-zinc-200 dark:aria-pressed:bg-zinc-700"
        >
          {option}
        </button>
      ))}
    </div>
  );
}
`;
}

const SAMPLE_MESSAGES: Record<string, { title: string; description: string }> = {
  en: {
    title: "Next Feature Starter",
    description: "Feature-based Next.js starter with built-in code generation.",
  },
  th: {
    title: "Next Feature Starter",
    description: "สตาร์ทเตอร์ Next.js แบบอิงฟีเจอร์ พร้อมตัวสร้างโค้ดในตัว",
  },
};

export function messagesFile(locale: string): string {
  const sample = SAMPLE_MESSAGES[locale] ?? {
    title: "Next Feature Starter",
    description: `Home description (${locale})`,
  };
  return `${JSON.stringify({ Home: sample }, null, 2)}\n`;
}
