import { NotFoundGame } from "@/features/not-found-game/not-found-game";
import { getRequestLocale } from "@/lib/i18n/request-locale.server";
import { siteCopy } from "@/lib/i18n/site-copy";

export default async function NotFound() {
  const locale = await getRequestLocale();
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
