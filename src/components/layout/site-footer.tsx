import { uiStrings } from "@/lib/i18n/ui-strings";

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto w-full max-w-3xl px-6 py-6">
        <p className="max-w-prose text-sm text-muted">
          {uiStrings.footer.line}
        </p>
      </div>
    </footer>
  );
}
