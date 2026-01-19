import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <nav className={styles.nav}>
        <span className={styles.brand}>Presently</span>
      </nav>
      <div className={styles.hero}>
        <div className={styles.blob} />
        <h1 className={styles.title}>
          Gift Giving, <span className={styles.gradientText}>Perfected.</span>
        </h1>
        <p className={styles.subtitle}>
          Create wishlists, share with friends, and never get a duplicate gift again.
          Surprises stay surprising.
        </p>

        <div className={styles.ctaGroup}>
          <Link href="/dashboard" className="btn btn-primary">
            Start Your List
          </Link>
          <Link href="/login" className="btn btn-ghost">
            Login
          </Link>
        </div>
      </div>

      <div className={`container ${styles.features}`}>
        <div className={`glass-panel ${styles.featureCard}`}>
          <h3>For You</h3>
          <p>Create lists for any occasion. Add links, prices, and notes. We keep track of what's bought, but keep it a secret from you.</p>
        </div>
        <div className={`glass-panel ${styles.featureCard}`}>
          <h3>For Them</h3>
          <p>Friends and family can view your list without signing up. They mark gifts as bought so others know, avoiding duplicates.</p>
        </div>
      </div>
    </main>
  );
}
