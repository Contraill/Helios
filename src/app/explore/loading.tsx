import { uiStrings } from "@/lib/i18n/ui-strings";

export default function Loading() {
  return (
    <div className="scene-loading scene-loading--route" role="status">
      <span>{uiStrings.pages.explore.loading}</span>
    </div>
  );
}
