import Link from "next/link";

import { ApodFeature } from "@/features/space-data/components/apod-feature";
import { loadApodArchive } from "@/lib/data/external/providers/space-data.server";
import { uiStrings } from "@/lib/i18n/ui-strings";

import styles from "./home.module.css";

const copy = uiStrings.pages.home;

export const revalidate = 60;

export default async function HomePage() {
  const apod = await loadApodArchive();
  return (
    <article className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.kicker}>A sourced, cinematic Solar System</p>
          <h1>Helios</h1>
          <p className={styles.intro}>{copy.intro}</p>
          <div className={styles.actions}>
            <Link href="/explore">{copy.cta}</Link>
            <Link href="/compare">Compare two worlds</Link>
          </div>
        </div>
      </section>
      <section className={styles.apodWrap} aria-labelledby="home-apod-title">
        <div className={styles.sectionIntro}>
          <h2 id="home-apod-title">A dated window beyond the planets</h2>
          <p>
            APOD supports the Helios story without replacing it. The record
            keeps its date, media type, credit and official source. When remote
            media is unavailable, the dated record remains readable.
          </p>
        </div>
        <ApodFeature
          metadata={apod.metadata}
          records={apod.data ?? []}
          status={apod.status}
        />
      </section>
    </article>
  );
}
