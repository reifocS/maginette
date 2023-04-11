import styles from "../styles/loading.module.css";
export default function Loading({ message = "Preparing deck..." }) {
  return (
    <div className={styles.loadingScreen}>
      <div className={styles.spinner}></div>
      <div className={styles.loadingText}>{message}</div>
    </div>
  );
}
