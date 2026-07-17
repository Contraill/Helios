import { uiStrings } from "@/lib/i18n/ui-strings";

export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-4 focus-visible:left-4 focus-visible:z-50 focus-visible:rounded-md focus-visible:border focus-visible:border-line focus-visible:bg-surface focus-visible:px-4 focus-visible:py-2"
    >
      {uiStrings.a11y.skipToContent}
    </a>
  );
}
