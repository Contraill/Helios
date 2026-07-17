import type { PlanetDetailMission } from "@/content/planet-details";

import styles from "./planet-detail.module.css";

export function PlanetMissionList({
  missions,
}: {
  readonly missions: readonly PlanetDetailMission[];
}) {
  return (
    <ol className={styles.missionList}>
      {missions.map((mission, index) => (
        <li className={styles.missionItem} key={mission.name}>
          <span className={styles.missionIndex}>
            {(index + 1).toString().padStart(2, "0")}
          </span>
          <div>
            <p className={styles.microLabel}>{mission.status}</p>
            <h3>{mission.name}</h3>
            <p>{mission.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
