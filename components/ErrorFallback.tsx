import Link from "next/link";
import styles from "../styles/error.module.css";

export default function ErrorFallback() {
  return (
    <div className={styles.errorPage}>
      <div className={styles.errorMessage}>
        <h1 className={styles.errorHeading}>Error</h1>
        <p className={styles.errorText}>
          Something went wrong. Please try again later.
        </p>
        <Link href="/" className={styles.errorButton}>
          Return to Home
        </Link>
      </div>
    </div>
  );
}
