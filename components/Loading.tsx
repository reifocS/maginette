import styles from "../styles/loading.module.css";
export default function Loading() {
  return (
    <div className={styles.loadingScreen}>
      <div className={styles.spinner}></div>
      <div className={styles.loadingText}>Preparing deck...</div>
    </div>
  );
}
