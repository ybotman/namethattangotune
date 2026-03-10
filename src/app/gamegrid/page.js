//------------------------------------------------------------
// src/app/gamegrid/page.js
// Game Grid Page - Always accessible (no redirect)
// Direct access to the 3x3 game grid for any user
//------------------------------------------------------------
import Image from "next/image";
import Link from "next/link";
import styles from "../landing.module.css";

// Next.js Metadata
export const metadata = {
  title: "Game Grid - Name That Tango Tune",
  description: "Choose your tango music game mode. Orchestra quiz, singer quiz, song quiz, and more.",
};

// Game tiles data - 9 tiles for 3x3 grid
const gameTiles = [
  {
    id: "orchestra",
    title: "Orchestra Quiz",
    description: "Identify D'Arienzo, Di Sarli, Troilo, Pugliese and 50+ more orchestras by ear",
    image: "/Banner/Type1__ORCHESTRA.png",
    href: "/games/orchestra-quiz",
    featured: true,
  },
  {
    id: "singer",
    title: "Singer Quiz",
    description: "Recognize legendary voices like Fiorentino, Vargas, Podestá, and Goyeneche",
    image: "/Banner/Type1__SINGER.png",
    href: "/games/singer-quiz",
  },
  {
    id: "songs",
    title: "Song Quiz",
    description: "Test your knowledge of tango classics from La Cumparsita to modern favorites",
    image: "/Banner/Type1__SONGS.png",
    href: "/games/song-quiz",
  },
  {
    id: "listen",
    title: "Listen Mode",
    description: "Explore 4,700+ songs freely. Browse by orchestra, era, or style",
    image: "/Banner/Type1__LISTEN.png",
    href: "/games/listen",
  },
  {
    id: "stats",
    title: "Your Stats",
    description: "Track your progress. See your accuracy across orchestras and difficulty levels",
    image: "/Banner/Type1__STATS.png",
    href: "/games/gamehub?page=5",
  },
  {
    id: "daily",
    title: "Daily Challenge",
    description: "Coming soon: Daily tanda quiz with streaks and shareable results",
    image: "/Banner/Type1__DAILY.png",
    href: "/games/gamehub?page=6",
  },
  {
    id: "contest",
    title: "Competition",
    description: "Coming soon: Weekly tournaments, leaderboards, and ranked competition",
    image: "/Banner/Type1__CONTEST.png",
    href: "/games/gamehub?page=7",
  },
  {
    id: "setup",
    title: "Setup & Reports",
    description: "Orchestra heatmaps, singer analysis, and data quality tools",
    image: "/Banner/Type1__SETUP.png",
    href: "/games/gamehub?page=8",
  },
  {
    id: "about",
    title: "About NTTT",
    description: "Built by Toby Balsley for the tango community. Learn how the app works",
    image: "/Banner/Type1__NTTT.png",
    href: "/games/gamehub?page=9",
  },
];

export default function GameGridPage() {
  return (
    <main className={styles.container}>
      {/* NO REDIRECT - This page is always accessible */}

      {/* Top Banner - Type2 */}
      <div className={styles.topBanner}>
        <Image
          src="/Banner/Type2__NTTT.png"
          alt="NTTT"
          width={400}
          height={100}
          priority
          className={styles.bannerImage}
        />
      </div>

      {/* Tagline */}
      <h1 className={styles.title}>Name That Tango Tune</h1>
      <p className={styles.subtitle}>
        Learn to identify tango orchestras, singers, and songs by ear
      </p>

      {/* 3x3 Game Grid */}
      <section className={styles.gameGrid}>
        {gameTiles.map((tile) => (
          <Link
            key={tile.id}
            href={tile.href}
            className={`${styles.gameTile} ${tile.featured ? styles.featuredTile : ""}`}
          >
            {tile.featured && (
              <div className={styles.startHereBadge}>
                <span className={styles.startHereArrow}>→</span> START HERE
              </div>
            )}
            <div className={styles.tileImageWrapper}>
              <Image
                src={tile.image}
                alt={tile.title}
                width={300}
                height={200}
                className={styles.tileImage}
              />
            </div>
            <h2 className={styles.tileTitle}>{tile.title}</h2>
            <p className={styles.tileDescription}>{tile.description}</p>
          </Link>
        ))}
      </section>

      {/* Back to App Link */}
      <div style={{ marginTop: "20px", marginBottom: "40px" }}>
        <Link
          href="/games/gamehub"
          style={{
            color: "var(--accent)",
            fontSize: "0.9rem",
            textDecoration: "none",
          }}
        >
          ← Back to App
        </Link>
      </div>

      {/* Footer Links */}
      <footer className={styles.footer}>
        <div className={styles.footerLinks}>
          <Link href="/games/gamehub">Games</Link>
          <span className={styles.separator}>•</span>
          <Link href="/auth/login">Sign In</Link>
          <span className={styles.separator}>•</span>
          <Link href="/auth/signup">Sign Up</Link>
          <span className={styles.separator}>•</span>
          <Link href="/fairuse">Fair Use</Link>
        </div>
        <p className={styles.copyright}>
          Built by{" "}
          <a href="https://www.tobytango.com" target="_blank" rel="noopener noreferrer">
            Toby Balsley
          </a>{" "}
          for the tango community
        </p>
      </footer>
    </main>
  );
}
