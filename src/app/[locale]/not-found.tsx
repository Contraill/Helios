"use client";

import { NotFoundGame } from "@/features/not-found-game/not-found-game";
import { siteCopy } from "@/lib/i18n/site-copy";
import { useLocaleStore } from "@/stores/locale-store";

// not-found receives no route params; the [locale] layout's provider supplies the locale.
export default function NotFound() {
  const locale = useLocaleStore((state) => state.locale);
  const copy = siteCopy[locale].errors;

  return (
    <article data-route-state="not-found-game">
      <NotFoundGame
        body={copy.notFoundBody}
        homeLabel={copy.backHome}
        locale={locale}
        title={copy.notFoundTitle}
      />
    </article>
  );
}
