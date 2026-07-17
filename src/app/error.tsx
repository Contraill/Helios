"use client";

import { uiStrings } from "@/lib/i18n/ui-strings";

const copy = uiStrings.pages.error;

/**
 * Root error boundary. Error reporting/observability is a Phase 11 concern
 * (03 §21); until then this deliberately renders a calm recovery UI and
 * nothing else — no console noise (06 §1).
 */
export default function RootError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <article className="flex flex-col gap-4">
      <h1 className="font-display text-3xl">{copy.title}</h1>
      <p className="text-muted">{copy.body}</p>
      <p>
        <button
          type="button"
          onClick={reset}
          className="rounded-md border border-line px-4 py-2 hover:border-focus"
        >
          {copy.retry}
        </button>
      </p>
    </article>
  );
}
