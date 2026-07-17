"use client";

import { uiStrings } from "@/lib/i18n/ui-strings";

export default function ErrorPage({ reset }: { reset: () => void }) {
  const copy = uiStrings.pages.error;
  return (
    <article className="mx-auto grid min-h-[60vh] max-w-3xl content-center gap-4 px-5 py-16">
      <h1 className="font-display text-3xl">{copy.title}</h1>
      <p className="text-muted">{copy.body}</p>
      <p>
        <button type="button" onClick={reset}>
          {copy.retry}
        </button>
      </p>
    </article>
  );
}
