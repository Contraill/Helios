import Link from "next/link";

import { uiStrings } from "@/lib/i18n/ui-strings";

const copy = uiStrings.pages.notFound;

export default function NotFound() {
  return (
    <article className="mx-auto grid min-h-[60vh] max-w-3xl content-center gap-4 px-5 py-16">
      <h1 className="font-display text-3xl">{copy.title}</h1>
      <p className="text-muted">{copy.body}</p>
      <p>
        <Link href="/">{copy.backHome}</Link>
      </p>
    </article>
  );
}
