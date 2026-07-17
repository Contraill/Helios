import Link from "next/link";

import { uiStrings } from "@/lib/i18n/ui-strings";

const copy = uiStrings.pages.home;

export default function HomePage() {
  return (
    <article className="mx-auto grid min-h-[70vh] max-w-5xl content-center gap-6 px-5 py-16">
      <p className="text-sm tracking-[0.22em] text-muted uppercase">
        Solar System
      </p>
      <h1 className="font-display text-display">Helios</h1>
      <p className="max-w-2xl text-lg leading-8 text-muted">{copy.intro}</p>
      <p className="max-w-2xl text-muted">{copy.status}</p>
      <p>
        <Link
          href="/explore"
          className="inline-flex rounded-full border border-line px-5 py-3 transition-colors hover:bg-surface"
        >
          {copy.cta}
        </Link>
      </p>
    </article>
  );
}
