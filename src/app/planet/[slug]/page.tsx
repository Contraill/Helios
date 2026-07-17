import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PhasePlaceholder } from "@/components/ui/phase-placeholder";
import { uiStrings } from "@/lib/i18n/ui-strings";

/**
 * TEMPORARY (Phase 1) — route allowlist only.
 *
 * The Phase 2 domain model (PlanetData + PlanetId, 03 §6.1) replaces this
 * list. It exists so unknown slugs 404 correctly; it deliberately carries no
 * planet data — no scientific value is shown before it is sourced (00 §5.1).
 */
const KNOWN_PLANET_SLUGS = [
  "mercury",
  "venus",
  "earth",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
] as const;

type PlanetSlug = (typeof KNOWN_PLANET_SLUGS)[number];

function resolvePlanetSlug(slug: string): PlanetSlug | null {
  return (KNOWN_PLANET_SLUGS as readonly string[]).includes(slug)
    ? (slug as PlanetSlug)
    : null;
}

function displayName(slug: PlanetSlug): string {
  return slug.charAt(0).toUpperCase() + slug.slice(1);
}

interface PlanetPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PlanetPageProps): Promise<Metadata> {
  const { slug } = await params;
  const known = resolvePlanetSlug(slug);
  if (!known) {
    return { title: uiStrings.pages.notFound.title };
  }
  const name = displayName(known);
  return {
    title: name,
    description: uiStrings.pages.planet.descriptionFor(name),
  };
}

export default async function PlanetPage({ params }: PlanetPageProps) {
  const { slug } = await params;
  const known = resolvePlanetSlug(slug);
  if (!known) {
    notFound();
  }
  const name = displayName(known);

  return (
    <article className="flex flex-col gap-6">
      <h1 className="font-display text-3xl">{name}</h1>
      <PhasePlaceholder
        description={uiStrings.pages.planet.placeholderFor(name)}
      />
      <p>
        <Link
          href="/explore"
          className="text-muted underline-offset-4 hover:underline"
        >
          {uiStrings.pages.planet.backToExplore}
        </Link>
      </p>
    </article>
  );
}
