import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  EXTENDED_BODIES,
  EXTENDED_BODY_BY_ID,
  isExtendedBodyId,
} from "@/features/solar-system/lib/extended-system";

import styles from "./object.module.css";

interface ObjectPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return EXTENDED_BODIES.map(({ id: slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: ObjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const body = isExtendedBodyId(slug) ? EXTENDED_BODY_BY_ID[slug] : null;
  return body ? { title: body.name, description: body.description } : {};
}

export default async function ObjectPage({ params }: ObjectPageProps) {
  const { slug } = await params;
  if (!isExtendedBodyId(slug)) notFound();
  const body = EXTENDED_BODY_BY_ID[slug];
  const periodYears = Math.pow(body.semiMajorAxisAu, 1.5);
  return (
    <main
      className={styles.page}
      style={{ "--accent": body.color } as CSSProperties}
    >
      <Link className={styles.back} href="/explore">
        ← Return to the system
      </Link>
      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>
            {body.kind.replaceAll("-", " ")} · representative Kepler orbit
          </p>
          <h1>{body.name}</h1>
          <p className={styles.tagline}>{body.tagline}</p>
          <p className={styles.description}>{body.description}</p>
        </div>
        <div aria-hidden="true" className={styles.world} />
      </section>
      <dl className={styles.metrics}>
        <div>
          <dt>Mean radius</dt>
          <dd>{body.meanRadiusKm.toLocaleString("en-GB")} km</dd>
        </div>
        <div>
          <dt>Semi-major axis</dt>
          <dd>{body.semiMajorAxisAu.toLocaleString("en-GB")} AU</dd>
        </div>
        <div>
          <dt>Eccentricity</dt>
          <dd>{body.eccentricity}</dd>
        </div>
        <div>
          <dt>Orbital period</dt>
          <dd>
            {periodYears.toLocaleString("en-GB", { maximumFractionDigits: 1 })}{" "}
            years
          </dd>
        </div>
      </dl>
      <a
        className={styles.source}
        href={body.sourceUrl}
        rel="noreferrer"
        target="_blank"
      >
        Primary science / orbital source ↗
      </a>
    </main>
  );
}
