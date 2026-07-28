import Link from "next/link";

import { getRequestLocale } from "@/lib/i18n/request-locale.server";
import { siteCopy } from "@/lib/i18n/site-copy";

export default async function NotFound() {
  const locale = await getRequestLocale();
  const copy = siteCopy[locale].errors;
  return (
    <article className="mx-auto grid min-h-[60vh] max-w-3xl content-center gap-4 px-5 py-16">
      <h1 className="font-display text-3xl">{copy.notFoundTitle}</h1>
      <p className="text-muted">{copy.notFoundBody}</p>
      <p>
        <Link href="/">{copy.backHome}</Link>
      </p>
    </article>
  );
}
