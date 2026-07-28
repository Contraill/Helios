import "server-only";

import { cookies } from "next/headers";

import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE_KEY,
  resolveLocale,
  type Locale,
} from "./locale";

export async function getRequestLocale(): Promise<Locale> {
  try {
    const cookieStore = await cookies();
    return resolveLocale(cookieStore.get(LOCALE_COOKIE_KEY)?.value);
  } catch {
    return DEFAULT_LOCALE;
  }
}
