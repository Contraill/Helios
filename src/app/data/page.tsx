import type { Metadata } from "next";

import { PhasePlaceholder } from "@/components/ui/phase-placeholder";
import { uiStrings } from "@/lib/i18n/ui-strings";

const copy = uiStrings.pages.data;

export const metadata: Metadata = {
  title: copy.title,
  description: copy.description,
};

export default function Page() {
  return (
    <article className="mx-auto grid min-h-[60vh] max-w-4xl content-center gap-5 px-5 py-16">
      <h1 className="font-display text-3xl">{copy.title}</h1>
      <p className="max-w-prose text-muted">{copy.description}</p>
      <PhasePlaceholder description={copy.placeholder} />
    </article>
  );
}
