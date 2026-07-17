import { uiStrings } from "@/lib/i18n/ui-strings";

export function SceneFallback() {
  const copy = uiStrings.pages.explore;

  return (
    <div className="scene-fallback" role="status">
      <strong>{copy.fallbackTitle}</strong>
      <span>{copy.fallbackBody}</span>
    </div>
  );
}
