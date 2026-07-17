import { uiStrings } from "@/lib/i18n/ui-strings";

interface PhasePlaceholderProps {
  description: string;
}

export function PhasePlaceholder({ description }: PhasePlaceholderProps) {
  return (
    <p className="rounded-md border border-line bg-surface p-4 text-muted">
      <span className="font-medium text-foreground">
        {uiStrings.placeholder.label}:{" "}
      </span>
      {description}
    </p>
  );
}
