import styles from "./village.module.css";

/** Sky only: soft radial cloud banks, no duplicated scenery or image blur. */
export function WorldSky() {
  return <div className={styles.worldSky} aria-hidden="true"><span className={styles.cloudBank}/><span className={styles.cloudBank}/><span className={styles.cloudBank}/><span className={styles.cloudBank}/></div>;
}
