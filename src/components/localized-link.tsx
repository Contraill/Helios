"use client";

import NextLink from "next/link";
import type { ComponentProps } from "react";

import { localizedPath } from "@/lib/i18n/locale";
import { useLocaleStore } from "@/stores/locale-store";

/** Drop-in for next/link that keeps internal links inside the active locale's URL space. */
export default function Link({
  href,
  ...props
}: ComponentProps<typeof NextLink>) {
  const locale = useLocaleStore((state) => state.locale);
  return (
    <NextLink
      href={typeof href === "string" ? localizedPath(href, locale) : href}
      {...props}
    />
  );
}
