import type { Metadata } from "next";

import { PhasePlaceholder } from "@/components/ui/phase-placeholder";
import { uiStrings } from "@/lib/i18n/ui-strings";

const copy = uiStrings.pages.compare;

export const metadata: Metadata = {
  title: copy.title,
  description: copy.description,
};

export default function Page() {
  return (
    <article className="flex flex-col gap-6">
      <h1 className="font-display text-3xl">{copy.title}</h1>
      <p className="max-w-prose text-muted">{copy.description}</p>
      <PhasePlaceholder description={copy.placeholder} />
    </article>
  );
}
