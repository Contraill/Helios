"use client";

import { siteCopy } from "@/lib/i18n/site-copy";
import { useLocaleStore } from "@/stores/locale-store";

export default function ErrorPage({ reset }: { reset: () => void }) {
  const locale = useLocaleStore((state) => state.locale);
  const copy = siteCopy[locale].errors;
  return (
    <article
      className="mx-auto grid min-h-[60vh] max-w-3xl content-center gap-4 px-5 py-16"
      data-route-state="error"
    >
      <h1 className="font-display text-3xl">{copy.errorTitle}</h1>
      <p className="text-muted">{copy.errorBody}</p>
      <p>
        <button data-route-state-action type="button" onClick={reset}>
          {copy.retry}
        </button>
      </p>
    </article>
  );
}
