import Link from "next/link";

import { uiStrings } from "@/lib/i18n/ui-strings";

const copy = uiStrings.pages.home;

export default function HomePage() {
  return (
    <article className="flex flex-col gap-6">
      <h1 className="font-display text-display">{uiStrings.site.name}</h1>
      <p className="max-w-prose text-lg text-muted">{uiStrings.site.tagline}</p>
      <p className="max-w-prose">{copy.intro}</p>
      <p className="max-w-prose rounded-md border border-line bg-surface px-4 py-3 text-sm text-muted">
        {copy.status}
      </p>
      <p>
        <Link
          href="/explore"
          className="inline-block rounded-md border border-line px-5 py-2.5 hover:border-focus"
        >
          {copy.cta}
        </Link>
      </p>
    </article>
  );
}
