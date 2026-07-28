"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { LOCALE_COOKIE_KEY, localeTag, type Locale } from "@/lib/i18n/locale";
import { siteCopy } from "@/lib/i18n/site-copy";
import { useLocaleStore } from "@/stores/locale-store";

const OPTIONS: readonly { label: string; locale: Locale }[] = [
  { locale: "en", label: "EN" },
  { locale: "tr", label: "TR" },
];

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

function persistLocalePreference(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE_KEY}=${locale}; Path=/; Max-Age=${ONE_YEAR_SECONDS}; SameSite=Lax`;
  document.documentElement.lang = localeTag(locale);
}

export function LocaleSwitcher() {
  const router = useRouter();
  const locale = useLocaleStore((state) => state.locale);
  const setLocale = useLocaleStore((state) => state.setLocale);
  const [isPending, startTransition] = useTransition();
  const [announcedLocale, setAnnouncedLocale] = useState<Locale | null>(null);
  const copy = siteCopy[locale];

  const chooseLocale = (nextLocale: Locale) => {
    if (nextLocale === locale || isPending) return;
    persistLocalePreference(nextLocale);
    setLocale(nextLocale);
    setAnnouncedLocale(nextLocale);
    startTransition(() => router.refresh());
  };

  return (
    <div
      aria-busy={isPending || undefined}
      aria-label={copy.a11y.localeLabel}
      className="flex items-center rounded-full border border-line p-0.5 text-xs"
      role="group"
      title={copy.a11y.localeScope}
    >
      <span className="px-2 text-[0.65rem] tracking-[0.08em] text-muted">
        {copy.a11y.localeCoverage}
      </span>
      {OPTIONS.map((option) => (
        <button
          aria-pressed={locale === option.locale}
          className="min-h-8 min-w-9 rounded-full px-2 font-medium tracking-[0.12em] transition-colors aria-pressed:bg-foreground aria-pressed:text-background"
          aria-disabled={isPending || undefined}
          key={option.locale}
          onClick={() => chooseLocale(option.locale)}
          type="button"
        >
          {option.label}
        </button>
      ))}
      <span aria-atomic="true" className="sr-only" role="status">
        {isPending
          ? copy.a11y.localeChanging
          : announcedLocale
            ? copy.a11y.localeChanged(copy.a11y.languageNames[announcedLocale])
            : ""}
      </span>
    </div>
  );
}
