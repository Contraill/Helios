import { uiStrings } from "@/lib/i18n/ui-strings";

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto max-w-7xl px-5 py-6 text-sm text-muted">
        <p>{uiStrings.footer.line}</p>
      </div>
    </footer>
  );
}
