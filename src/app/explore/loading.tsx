import { getExplorePageCopy } from "@/lib/i18n/explore-page-copy";
import { getRequestLocale } from "@/lib/i18n/request-locale.server";

export default async function Loading() {
  const locale = await getRequestLocale();
  const copy = getExplorePageCopy(locale);
  return (
    <div className="scene-loading scene-loading--route" role="status">
      <span>{copy.loading}</span>
    </div>
  );
}
