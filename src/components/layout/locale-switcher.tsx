"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

import {
  LOCALE_COOKIE_KEY,
  localeTag,
  localizedPath,
  stripLocalePrefix,
  type Locale,
} from "@/lib/i18n/locale";
import { siteCopy } from "@/lib/i18n/site-copy";
import { useLocaleStore } from "@/stores/locale-store";

const OPTIONS: readonly { label: string; locale: Locale }[] = [
  { locale: "en", label: "EN" },
  { locale: "tr", label: "TR" },
];

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

// Switching locale navigates into the other [locale] layout, which remounts this control;
// carry the keyboard focus and the status announcement over to the new instance.
let carriedSwitch: { locale: Locale; focused: boolean } | null = null;

function carrySwitch(next: typeof carriedSwitch) {
  carriedSwitch = next;
}

function carriedSwitchFor(locale: Locale) {
  return carriedSwitch?.locale === locale ? carriedSwitch : null;
}

function persistLocalePreference(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE_KEY}=${locale}; Path=/; Max-Age=${ONE_YEAR_SECONDS}; SameSite=Lax`;
  document.documentElement.lang = localeTag(locale);
}

export function LocaleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocaleStore((state) => state.locale);
  const setLocale = useLocaleStore((state) => state.setLocale);
  const [isPending, startTransition] = useTransition();
  const [carried] = useState(() => carriedSwitchFor(locale));
  const [announcedLocale, setAnnouncedLocale] = useState<Locale | null>(
    carried?.locale ?? null,
  );
  const buttons = useRef<Partial<Record<Locale, HTMLButtonElement | null>>>({});

  useEffect(() => {
    if (!carried) return;
    carrySwitch(null);
    if (carried.focused) buttons.current[carried.locale]?.focus();
  }, [carried]);
  const copy = siteCopy[locale];

  const chooseLocale = (nextLocale: Locale) => {
    if (nextLocale === locale || isPending) return;
    persistLocalePreference(nextLocale);
    setLocale(nextLocale);
    setAnnouncedLocale(nextLocale);
    carrySwitch({
      locale: nextLocale,
      focused: document.activeElement === buttons.current[nextLocale],
    });
    const { hash, search } = window.location;
    const target = localizedPath(stripLocalePrefix(pathname), nextLocale);
    startTransition(() =>
      router.replace(`${target}${search}${hash}`, { scroll: false }),
    );
  };

  return (
    <div
      aria-busy={isPending || undefined}
      aria-label={copy.a11y.localeLabel}
      className="flex items-center rounded-full border border-line p-px text-[0.7rem]"
      role="group"
      title={copy.a11y.localeScope}
    >
      <span className="hidden px-2 text-[0.65rem] tracking-[0.08em] text-muted lg:inline">
        {copy.a11y.localeCoverage}
      </span>
      {OPTIONS.map((option) => (
        <button
          aria-pressed={locale === option.locale}
          className="min-h-9 min-w-10 rounded-full px-1.5 font-medium tracking-[0.1em] transition-colors aria-pressed:bg-foreground aria-pressed:text-background"
          aria-disabled={isPending || undefined}
          key={option.locale}
          onClick={() => chooseLocale(option.locale)}
          ref={(button) => {
            buttons.current[option.locale] = button;
          }}
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
