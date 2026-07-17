import { uiStrings } from "@/lib/i18n/ui-strings";

interface PhasePlaceholderProps {
  /** Honest description of what will exist here and in which phase. */
  description: string;
}

/**
 * Marks intentionally-empty Phase 1 sections. Per 00_START_HERE §5.5 / §8,
 * unfinished features must never look finished — this component is the visual
 * contract for that rule.
 */
export function PhasePlaceholder({ description }: PhasePlaceholderProps) {
  return (
    <p className="max-w-prose rounded-md border border-line bg-surface px-4 py-3 text-sm text-muted">
      <span className="font-medium text-foreground">
        {uiStrings.placeholder.label}:{" "}
      </span>
      {description}
    </p>
  );
}
