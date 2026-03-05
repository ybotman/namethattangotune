//------------------------------------------------------------
// src/app/page.js
// SEO Landing Page - 3x3 Game Grid with Type1 images
// v3.0.0 - Static landing page for Google indexing
//         - Logged in users → gamehub
//         - Returning visitors → gamehub
//         - New visitors / Google → SEO page
//------------------------------------------------------------
import Image from "next/image";
import Link from "next/link";
import styles from "./landing.module.css";
import LandingRedirect from "@/components/LandingRedirect";

// Next.js Metadata for SEO
export const metadata = {
  title: "Name That Tango Tune - Learn Tango Music by Ear",
  description:
    "Free tango music quiz game. Learn to identify tango orchestras, singers, and songs by ear. Test your knowledge of D'Arienzo, Di Sarli, Troilo, Pugliese and more. The Duolingo of tango music recognition.",
  keywords: [
    "tango music quiz",
    "name that tango tune",
    "identify tango orchestra",
    "tango song game",
    "learn tango music",
    "tango ear training",
    "D'Arienzo",
    "Di Sarli",
    "Troilo",
    "Pugliese",
    "golden age tango",
    "tango DJ",
    "milonga music",
  ],
  openGraph: {
    title: "Name That Tango Tune",
    description: "Learn to identify tango orchestras, singers, and songs by ear",
    url: "https://namethattangotune.com",
    siteName: "NTTT",
    images: [
      {
        url: "/Banner/Type1__NTTT.png",
        width: 1200,
        height: 630,
        alt: "Name That Tango Tune",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Name That Tango Tune",
    description: "Learn to identify tango orchestras, singers, and songs by ear",
    images: ["/Banner/Type1__NTTT.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

// Game tiles data - 9 tiles for 3x3 grid
const gameTiles = [
  {
    id: "orchestra",
    title: "Orchestra Quiz",
    description: "Identify D'Arienzo, Di Sarli, Troilo, Pugliese and 50+ more orchestras by ear",
    image: "/Banner/Type1__ORCHESTRA.png",
    href: "/games/orchestra-quiz",
    featured: true, // START HERE highlight
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

export default function LandingPage() {
  return (
    <main className={styles.container}>
      {/* Client-side redirect for logged in / returning users */}
      <LandingRedirect />

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

      {/* SEO Text Block */}
      <section className={styles.seoBlock}>
        <h2>The Duolingo of Tango Music</h2>
        <p>
          NTTT is a free music recognition game for tango dancers and DJs. With over
          4,700 songs from 57 orchestras spanning the Old Guard era through the Golden
          Age to modern tango, you can test and improve your ability to identify tango
          music by ear. Perfect for milonga-goers who want to know what&apos;s playing,
          or DJs building their musical knowledge.
        </p>
        <p>
          Start with the iconic Big 4 orchestras — D&apos;Arienzo, Di Sarli, Troilo, and
          Pugliese — then progress to Canaro, Biagi, Tanturi, Caló, and beyond. Learn to
          recognize legendary singers like Fiorentino, Vargas, Podestá, Echagüe, and
          Goyeneche. Track your progress, compete with friends, and become a true tanguero.
        </p>
      </section>

      {/* The Big 5 Orchestras - SEO */}
      <section className={styles.seoBlock}>
        <h2>The Big 5 Tango Orchestras</h2>
        <div className={styles.orchestraGrid}>
          <div className={styles.orchestraItem}>
            <h3>Juan D&apos;Arienzo — El Rey del Compás</h3>
            <p>Sharp, driving, percussive 2x4 beat. The most recognizable sound in tango. 606 songs including La Cumparsita, El Flete, Nueve de Julio, La Puñalada. Key singers: Alberto Echagüe, Héctor Maure.</p>
          </div>
          <div className={styles.orchestraItem}>
            <h3>Carlos Di Sarli — El Señor del Tango</h3>
            <p>Lush strings, elegant piano, flowing melody. 433 songs including Bahía Blanca, A la Gran Muñeca, Shusheta. Key singers: Roberto Rufino, Alberto Podestá, Jorge Durán.</p>
          </div>
          <div className={styles.orchestraItem}>
            <h3>Aníbal Troilo — Pichuco</h3>
            <p>Lyrical, expressive, deeply emotional. The poet&apos;s orchestra. 253 songs including Malena, Toda Mi Vida, Sur, Gricel. Key singers: Francisco Fiorentino, Floreal Ruiz.</p>
          </div>
          <div className={styles.orchestraItem}>
            <h3>Osvaldo Pugliese — El Rojo</h3>
            <p>Heavy, dramatic, complex. La Yumba rhythm, dramatic builds. 127 songs including Recuerdo, Emancipación, Farol, Negracha. Key singers: Roberto Chanel, Alberto Morán.</p>
          </div>
          <div className={styles.orchestraItem}>
            <h3>Rodolfo Biagi — Manos Brujas</h3>
            <p>Jumpy, syncopated piano, playful and energetic. 214 songs including Racing Club, Todo Te Nombra, Pura Clase. Key singers: Jorge Ortiz, Andrés Falgás.</p>
          </div>
        </div>
        <p className={styles.moreOrchestras}>
          <strong>Also featuring:</strong> Francisco Canaro, Ricardo Tanturi, Miguel Caló,
          Ángel D&apos;Agostino, Alfredo De Angelis, Enrique Rodríguez, Pedro Laurenz,
          Osvaldo Fresedo, Edgardo Donato, Lucio Demare, and 45+ more orchestras.
        </p>
      </section>

      {/* Iconic Tier 1 Songs - SEO */}
      <section className={styles.seoBlock}>
        <h2>Must-Know Tango Songs</h2>
        <p>Played at virtually every milonga worldwide — the songs every dancer should recognize:</p>
        <p className={styles.songList}>
          <strong>La Cumparsita</strong> (D&apos;Arienzo) •
          <strong>Bahía Blanca</strong> (Di Sarli) •
          <strong>La Yumba</strong> (Pugliese) •
          <strong>Malena</strong> (Troilo/Fiorentino) •
          <strong>El Flete</strong> (D&apos;Arienzo) •
          <strong>Recuerdo</strong> (Pugliese) •
          <strong>A la Gran Muñeca</strong> (Di Sarli) •
          <strong>Toda Mi Vida</strong> (Troilo/Fiorentino) •
          <strong>Racing Club</strong> (Biagi) •
          <strong>Nueve de Julio</strong> (D&apos;Arienzo) •
          <strong>Gricel</strong> (Troilo/Fiorentino) •
          <strong>Junto a Tu Corazón</strong> (Di Sarli/Podestá) •
          <strong>Emancipación</strong> (Pugliese) •
          <strong>La Puñalada</strong> (D&apos;Arienzo) •
          <strong>Todo Te Nombra</strong> (Biagi/Ortiz) •
          <strong>Shusheta</strong> (Di Sarli) •
          <strong>Tinta Roja</strong> (Troilo/Fiorentino) •
          <strong>Farol</strong> (Pugliese/Chanel)
        </p>
        <p>4,700+ songs from Old Guard classics to Golden Age masterpieces to modern tango nuevo.</p>
      </section>

      {/* Famous Singers - SEO */}
      <section className={styles.seoBlock}>
        <h2>Legendary Tango Singers</h2>
        <p>Can you identify the voice? Learn to recognize the greatest tango vocalists:</p>
        <p className={styles.singerList}>
          <strong>Francisco Fiorentino</strong> — Troilo&apos;s legendary singer, voice of Malena and Toda Mi Vida •
          <strong>Alberto Echagüe</strong> — D&apos;Arienzo&apos;s distinctive tenor, Mandria, Indiferencia •
          <strong>Alberto Podestá</strong> — elegant Di Sarli vocalist, Junto a Tu Corazón •
          <strong>Roberto Rufino</strong> — Di Sarli&apos;s romantic voice, Cascabelito •
          <strong>Jorge Ortiz</strong> — Biagi&apos;s signature singer, Todo Te Nombra •
          <strong>Héctor Maure</strong> — D&apos;Arienzo&apos;s second great voice, Lilian •
          <strong>Roberto Chanel</strong> — Pugliese&apos;s powerful vocalist, Farol •
          <strong>Carlos Gardel</strong> — the voice that defined tango worldwide •
          <strong>Roberto Goyeneche</strong> — &quot;El Polaco,&quot; emotional and dramatic
        </p>
      </section>

      {/* Tango Universe - Cross Promotion */}
      <section className={styles.tangoUniverse}>
        <h2>The Tango Universe</h2>
        <p className={styles.universeIntro}>
          NTTT is part of a growing ecosystem of free tools for the tango community.
        </p>

        <div className={styles.universeGrid}>
          {/* Tango Tiempo */}
          <a
            href="https://www.tangotiempo.com"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.universeCard}
          >
            <div className={styles.universeIcon}>📅</div>
            <h3>Tango Tiempo</h3>
            <p>
              America&apos;s free national calendar for Argentine tango events. Find milongas,
              practicas, classes, and festivals coast to coast.
            </p>
            <span className={styles.universeLink}>
              tangotiempo.com →
            </span>
          </a>

          {/* Tangology - Coming Soon */}
          <div className={styles.universeCard + " " + styles.universeComingSoon}>
            <div className={styles.universeIcon}>📚</div>
            <h3>Tangology</h3>
            <p>
              Interactive tango history timeline. Explore orchestras, singers, and the
              evolution of tango from 1900 to today.
            </p>
            <span className={styles.universeLink}>
              tangology.org — Coming Soon
            </span>
          </div>
        </div>

        <div className={styles.organizerCta}>
          <p>
            <strong>Are you an event organizer?</strong> List your milongas, practicas,
            and workshops on Tango Tiempo — free for the tango community.
          </p>
          <a
            href="https://www.tangotiempo.com/apply"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.organizerButton}
          >
            List Your Events Free
          </a>
        </div>
      </section>

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
