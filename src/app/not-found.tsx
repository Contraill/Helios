import Link from "next/link";

import { uiStrings } from "@/lib/i18n/ui-strings";

const copy = uiStrings.pages.notFound;

export default function NotFound() {
  return (
    <article className="flex flex-col gap-4">
      <h1 className="font-display text-3xl">{copy.title}</h1>
      <p className="text-muted">{copy.body}</p>
      <p>
        <Link href="/" className="underline underline-offset-4">
          {copy.backHome}
        </Link>
      </p>
    </article>
  );
}
