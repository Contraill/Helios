"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { create } from "zustand";

import { DEFAULT_LOCALE, localeTag, type Locale } from "@/lib/i18n/locale";

interface LocaleState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const useFallbackLocaleStore = create<LocaleState>((set) => ({
  locale: DEFAULT_LOCALE,
  setLocale: (locale) =>
    set((state) => (state.locale === locale ? state : { locale })),
}));

const LocaleContext = createContext<LocaleState | null>(null);

export function LocaleProvider({
  children,
  initialLocale,
}: {
  readonly children: ReactNode;
  readonly initialLocale: Locale;
}) {
  const [providerLocale, setProviderLocale] = useState(() => ({
    locale: initialLocale,
    requestLocale: initialLocale,
  }));
  const locale =
    providerLocale.requestLocale === initialLocale
      ? providerLocale.locale
      : initialLocale;

  useEffect(() => {
    useFallbackLocaleStore.getState().setLocale(locale);
    document.documentElement.lang = localeTag(locale);
  }, [locale]);

  useEffect(
    () => () => {
      useFallbackLocaleStore.getState().setLocale(DEFAULT_LOCALE);
    },
    [],
  );

  const setLocale = useCallback(
    (nextLocale: Locale) => {
      setProviderLocale({
        locale: nextLocale,
        requestLocale: initialLocale,
      });
    },
    [initialLocale],
  );

  const value = useMemo(() => ({ locale, setLocale }), [locale, setLocale]);

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

function useLocaleSelector<T>(selector: (state: LocaleState) => T): T {
  const contextState = useContext(LocaleContext);
  const fallbackValue = useFallbackLocaleStore(selector);
  return contextState ? selector(contextState) : fallbackValue;
}

export const useLocaleStore = Object.assign(useLocaleSelector, {
  getState: useFallbackLocaleStore.getState,
  setState: useFallbackLocaleStore.setState,
  subscribe: useFallbackLocaleStore.subscribe,
});

export function resetLocaleStore(): void {
  useFallbackLocaleStore.setState({ locale: DEFAULT_LOCALE });
}
