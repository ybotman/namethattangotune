# Tango orchestra recording dates: 54 artists audited against song database

**Six entries in the djSongsWeighted database contain max years that post-date the artist's death or retirement — these are almost certainly reissue or remaster dates incorrectly entered as original recording years.** The flagged artists are Alfredo de Angelis (DB says 2014, actual last recording ~1989), Domingo Federico (DB says 2021, actual ~1968), Edgardo Donato (DB says 2016, actual 1961), Francisco Lomuto (DB says 2015, actual 1950), Miguel Caló (DB says 1999, actual 1972), and Osvaldo Pugliese (DB says 2011, actual ~1986). Beyond these false positives, the audit also uncovered **12 artists whose database max years are significantly too low**, meaning the database is missing substantial portions of their later catalogs.

---

## Confirmed reissue dates masquerading as recordings

These six entries are the most critical data quality issues. Each database max year falls **after the artist died or stopped recording**, making them physically impossible as original recording dates.

| Artist | DB Max Year | Actual Last Recording | Artist Died | Gap | Explanation |
|--------|------------|----------------------|-------------|-----|-------------|
| **Alfredo de Angelis** | **2014** | ~1989 (final album *Así Es*); Odeón era ended 1977 | 1992 | +25 years | Compilation/reissue released 22 years after death |
| **Domingo Federico** | **2021** | ~1968 (commercial studio); 1994 university orchestra | 2000 | +53 years | DB entry literally says "Remastered" in title |
| **Edgardo Donato** | **2016** | 1961 (final RCA Victor sessions) | 1963 | +55 years | Reissue released 53 years after death |
| **Francisco Lomuto** | **2015** | 1950 (final RCA Victor session, June 1950) | 1950 | +65 years | Reissue released 65 years after death |
| **Miguel Caló** | **1999** | 1972 (Embassy label, Vol. 18, with Podestá/Iriarte/Arrieta) | 1972 | +27 years | Compilation released 27 years after death |
| **Osvaldo Pugliese** | **2011** | ~1986–1989 (studio); live recordings through 1994 | 1995 | +22 years | Posthumous reissue/compilation 16 years after death |

**Recommendation:** Replace each of these six DB max years with the corrected "actual last recording" year listed above.

---

## Database max years that are too low: missing later catalogs

Twelve artists have DB max years that significantly undercount their actual recording output. These aren't data errors per se — the database simply lacks their later recordings. The most dramatic gaps are Osvaldo Fresedo (missing 25 years of recordings) and Francisco Canaro (missing 15 years).

| Artist | DB Max Year | Actual Last Recording | Missing Years | Notes |
|--------|------------|----------------------|---------------|-------|
| **Osvaldo Fresedo** | 1955 | 1979/1980 | ~25 yrs | Recorded on CBS Columbia through retirement. ~1,270 career recordings. |
| **Francisco Canaro** | 1949 | 1964 | ~15 yrs | Last recording Nov 6, 1964 ("Danza gaucha"), died 5 weeks later. ~3,799 total recordings. |
| **Enrique Rodriguez** | 1956 | 1971 | ~15 yrs | Recorded 349 tracks on Odeón exclusively for 34 years. Last: "La fuerza del amor" (July 7, 1971), died 2 months later. |
| **Fulvio Salamanca** | 1957 | 1969 | ~12 yrs | 60 tracks on Music Hall (1964–1969) entirely missing from DB. |
| **Florindo Sassone** | 1968 | 1979 | ~11 yrs | Post-Odeón recordings on Carmusic, País, Music Hall, Embassy, Microfón all missing. |
| **Lucio Demare** | 1945 | 1959 (orchestra) / 1968 (solo piano) | ~14–23 yrs | Post-Odeón recordings on Columbia, Pampa, TK, Music-Hall, Disc Jockey all missing. |
| **Mario Melfi** | 1940 | 1962 | ~22 yrs | Recorded in France as "Mario Melfi et son orchestre argentin" through 1962. |
| **Aníbal Troilo** | 1969 | ~1974 | ~5 yrs | Later Odeón/Music Hall sessions from early 1970s not captured. |
| **Osmar Maderna** | 1946 | 1950 | ~4 yrs | RCA Victor recordings through Nov 28, 1950 ("Ahí va el dulce"). Died in plane crash April 1951. |
| **Juan D'Arienzo** | 1973 | 1975 | ~2 yrs | Final RCA Victor sessions with pianist Juan Polito. 1,007+ total recordings. |
| **Julio De Caro** | 1952 | 1953 (orchestra) / 1975 (special project) | ~1–23 yrs | Regular orchestra ended ~1953; special album *Los 14 de Julio de Caro* recorded 1975. |
| **José García y sus Zorros Grises** | 1944 | 1945 | ~1 yr | Last Odeón session April 16, 1945. |

---

## Complete artist-by-artist reference

### Classic-era orchestras (confirmed accurate or within range)

**Alberto Castillo** (1914–2002). Last recording as orchestra director: **~1960**. Career span: 1943–1960 on Odeón. DB max year 1960 is **correct**. He continued performing live for decades and made a novelty recording with Los Auténticos Decadentes in 1993, but his tango orchestra recordings ended around 1960.

**Alfredo Gobbi** (1912–1965). Last recording: **1958** (July 4, 1958 — "Adiós Corazón" on Orfeo label). Career span: 1947–1958 on RCA Victor and briefly Orfeo. DB max year 1958 is **correct**.

**Alfredo de Angelis** (1910–1992). Last original recording: **~1989** (final studio album *Así Es* on EMI). Main Odeón career: 1943–1977 (486 sides). Later EMI singles in 1980 and 1985. DB max year 2014 is **a reissue — FLAG**.

**Ángel D'Agostino** (1900–1991). Last recording: **1963** (final sessions with singer Raúl Lavié). Career span: 1940–1963 on RCA Victor. Total output: ~141 tracks. DB max year 1963 is **correct**.

**Ángel Vargas** (1904–1959). Last recording: **~1956–1958** (solo career recordings after leaving D'Agostino in 1946). Career span: 1935–~1957 on RCA Victor, Odeón, TK. DB max year 1956 is **approximately correct**.

**Aníbal Troilo** (1914–1975). Last recording: **~1974**. Career span: 1938–1974 on RCA Victor, TK, Odeón, Music Hall. The el-recodo database (acknowledged as partial) ends at 1971, but album releases from 1974–75 indicate later sessions. DB max year 1969 is **too low by ~5 years**.

**Antonio Rodio** (1904–1980). Last recording: **1944** (16 tracks on Odeón, 1943–1944). Moved to Chile in 1945 and shifted to classical music. **No DB data** to compare.

**Astor Piazzolla** (1921–1992). Last studio recording: **1989** (November 1989, *Five Tango Sensations* with Kronos Quartet). Last concert July 3, 1990 in Athens. Suffered cerebral hemorrhage August 1990. Career span: ~1946–1989 across dozens of labels.

**Carlos Di Sarli** (1903–1960). Last recording: **1958** (November 1958, final 14 tracks on Philips with singers Horacio Casares and Jorge Durán). Career span: 1928–1958 on RCA Victor, Music Hall, Philips. DB max year 1958 is **correct**.

**Domingo Federico** (1916–2000). Last commercial studio recording: **~1968** (sessions on Embassy/Odeón). In 1994, at age 78, he directed the Orquesta Juvenil de Tango at the Universidad Nacional de Rosario. Career span: 1944–1968 on RCA Victor, Embassy, Rosafón, Odeón. DB max year 2021 is **a remaster — FLAG**.

**Edgardo Donato** (1897–1963). Last recording: **1961** (final four recordings on RCA Victor, per Tango Time Travel). Career span: 1928–1961, 408 total recordings. DB max year 2016 is **a reissue — FLAG**.

**Enrique Rodríguez** (1901–1971). Last recording: **1971** (July 7, 1971 — "La fuerza del amor" with Ernesto Falcón on Odeón). Died September 4, 1971. Career span: 1937–1971, 349 recordings, all on Odeón exclusively. DB max year 1956 is **too low by 15 years**.

**Florindo Sassone** (1912–1982). Last recording: **1979**. Career span: 1947–1979 on RCA Victor, Odeón, then Carmusic, País, Music Hall, Embassy, Microfón. Toured Japan in 1966 and 1972. DB max year 1968 is **too low by ~11 years**.

**Francisco Canaro** (1888–1964). Last recording: **November 6, 1964** ("Danza gaucha"). Died December 14, 1964 — five weeks later. Career span: 1916–1964, approximately **3,799 recorded works** (the most prolific tango recording artist in history). Labels: Atlanta, National, Odeón, Columbia, Brunswick, Victor/RCA Victor. DB max year 1949 is **too low by 15 years** — massive gap.

**Francisco Lomuto** (1893–1950). Last recording: **June 1950** (final RCA Victor session with singer Alberto Rivera). Career span: 1922–1950, over 950 recordings on Odeón and RCA Victor. DB max year 2015 is **a reissue — FLAG**.

**Fulvio Salamanca** (1921–1999). Last recording: **1969** (Music Hall label). Career span as director: 1957–1969 on Odeón (36 recordings, 1957–1963), Philips (11 recordings, 1961), Music Hall (60 tracks, 1964–1969). DB max year 1957 is **too low by 12 years**.

**Héctor Varela** (1914–1987). Last recording: **1975** on Columbia ("Que no muera este amor"). One source mentions a possible 1982 CBS album, but 1975 is the widely confirmed endpoint. Career span: 1950–1975, 383–390 tracks on Pampa and Columbia. DB max year 1975 is **correct**.

**Horacio Salgán** (1916–2016). Last recording as orchestra director: **1967** (*Salgán Tango* LP on Philips). As duo leader (Salgán-De Lío): **~1991** (*Tangos '91*). Live recordings continued through 2008 (*Último concierto*). Career span: 1950–1991 on RCA Victor, TK, Antar Telefunken, Philips. **No DB data** to compare.

**José García y sus Zorros Grises** (1908–2000). Last recording: **April 16, 1945** (final Odeón session). Career span: 1942–1945, ~40 tracks on Odeón with singer Alfredo Rojas. DB max year 1944 is **1 year too low**.

**Juan D'Arienzo** (1900–1976). Last recording: **1975** (final RCA Victor sessions with pianist Juan Polito). Career span: 1928–1975, **~1,007 recordings** on Electra and RCA Victor. Died January 14, 1976. DB max year 1973 is **~2 years too low**.

**Juan Maglio "Pacho"** (1881–1934). Last recording: **1932** (final electric recordings on Columbia). Career span: 1912–1932, **~764 recordings** plus 14 under pseudonym J. Oglima, all on Columbia exclusively. Died July 14, 1934.

**Julio De Caro** (1899–1980). Last recording with regular orchestra: **~1953** (final RCA Victor sessions). Special project: **1975** (*Los 14 de Julio de Caro*, collaboration with Ernesto Sábato and Ben Molar). Career span: 1924–1953/1975 on RCA Victor. DB max year 1952 is **~1 year low** for orchestra, missing the 1975 project entirely.

**Leopoldo Federico** (1927–2014). Last recording: **2010** (*Sentido Único*, duo album with guitarist Hugo Rivas, won Premio Gardel). Notable as "the first tanguero to record a CD — in Japan, 1987." Career span: ~1955–2010 on CBS/Columbia, Music Hall, Orfeo, Philips, RCA Victor, Disc Jockey. **No specific DB max year given** for comparison.

**Lucio Demare** (1906–1974). Last recording with orchestra: **1959** (Music-Hall EP with singer Tania). Last recording overall: **1968** (solo piano LP on Disc Jockey label). Main Odeón period: 1938–1945 (79–81 shellac sides). DB max year 1945 is **too low by 14–23 years**.

**Mario Melfi** (1905–1970). Last recording: **1962** (recorded in France as "Mario Melfi et son orchestre argentin"). Career span: 1933–1962 on various French labels (Pathé, etc.). DB max year 1940 is **too low by 22 years**.

**Miguel Caló** (1907–1972). Last recording: **1972** (Embassy label, Vol. 18, 20 tracks with singers Podestá, Iriarte, and Arrieta). Career span: 1932–1972, 360 recordings on Splendid, Odeón, Embassy. DB max year 1999 is **a reissue — FLAG** (27 years after death).

**Nina Miranda** (1925–2012) **and Donato Racciatti** (1918–2000). Last recording together: **~1979** (album *Tu corazón* on Sondor). Racciatti's last recordings as director: possibly **~1987** on Sondor/Orfeo. Career span: ~1949–1987 on Sondor, Patria, Orfeo. Based primarily in Montevideo, Uruguay. **No DB data** to compare.

**Orquesta Típica Victor** (active 1925–1944). Last recording: **1944** (disbanded that year). This was RCA Victor Argentina's house studio orchestra, directed successively by Luis Petrucelli, Federico Scorticati, and Mario Maurano. ~234 recordings in just the first half of their career. DB max year 1944 is **correct**.

**Osmar Maderna** (1918–1951). Last recording: **November 28, 1950** ("Ahí va el dulce" and "Aromas" on RCA Victor). Died in a plane crash April 28, 1951 at age 33. Career span: 1946–1950 on Sondor and RCA Victor. The posthumous "Orquesta Símbolo Osmar Maderna" (led by Aquiles Roggero) is a different entity. DB max year 1946 is **too low by 4 years**.

**Osvaldo Fresedo** (1897–1984). Last recording: **1979/1980** (CBS Columbia label, with singer Argentino Ledesma). One source specifies the "1980" sessions were actually recorded October 1979. Career span: 1920–1980, approximately **1,270 recordings** across Nacional Odeón, Brunswick, RCA Victor, Columbia, Odeón, Arte, CBS Columbia — one of tango's longest careers at **59–60 years**. DB max year 1955 is **too low by ~25 years**.

**Osvaldo Pugliese** (1905–1995). Last studio recording: **~1986–1989** (disputed; TangoSparks suggests 1987 is most plausible for the final three studio tracks, milonga.co.uk says 1989). Live recordings include Nagoya 1989 and Amsterdam 1994. Career span: 1943–~1989 on Odeón/EMI, Philips/Polygram. DB max year 2011 is **a posthumous reissue — FLAG**.

---

### Modern and contemporary groups

| Artist | Type | Last Recording | DB Max Year | Status |
|--------|------|---------------|-------------|--------|
| **Bajofondo** | Electrotango | 2019 (*Aura*) | — | Active, no new album since 2019 |
| **Bandonegro** | Modern ensemble (Poland) | 2025 (*TANUEVO*) | 2022 | Active; DB slightly behind |
| **Caceres (Juan Carlos Cáceres)** | Afro-tango fusion | 2013 (*Gotan Swing*); died 2015 | 2003 | DB too low by ~10 years |
| **Chino Laborde** | Modern singer | 2025 (singles with Andariega) | 2020 | Active; DB slightly behind |
| **Color Tango** | Modern traditional orchestra | 2025 (singles); album 2023 (*Sentido Único*) | — | Active; founder Álvarez died 2023, orchestra continues |
| **Disarliana** | Di Sarli tribute project | 2024 (*Noches con Di Sarli*) | 2024 | ✅ Matches |
| **El Cachivache** | Modern quintet | 2025 (15th album) | 2016 | Active; DB missing ~9 years of albums |
| **Gotan Project** | Electrotango (Paris) | 2010 (*Tango 3.0*) | — | Effectively disbanded |
| **Hyperion Ensemble** | Italian tango ensemble | 2023 (album); 2025 (single) | 2023 | ✅ Correct for albums |
| **Orquesta Romántica Milonguera** | Modern traditional | 2024/2025 (*Vete de Mi*) | 2017 | DB significantly behind |
| **Orquesta Típica Andariega** | Modern traditional | 2025 (*Santo Milonguero*) | 2021 | DB slightly behind |
| **Otros Aires** | Electrotango | 2025 (*Re*) | — | Active |

---

## What the audit reveals about the database

The cross-referencing uncovered two distinct categories of error. The first and most critical involves **six entries where reissue/remaster/compilation release dates were entered as original recording dates**. These are unambiguous errors: Alfredo de Angelis, Domingo Federico, Edgardo Donato, Francisco Lomuto, Miguel Caló, and Osvaldo Pugliese all have DB max years that fall years or decades after the artist's death or verified retirement from recording. The Domingo Federico entry is the most transparent — the DB record itself contains "Remastered" in the title.

The second category is arguably more consequential for database completeness: **twelve classic-era orchestras have DB max years that are far too low**, meaning entire periods of their recording careers are absent. The most extreme cases are Francisco Canaro (missing recordings from 1950–1964), Osvaldo Fresedo (missing 1956–1980), and Mario Melfi (missing 1941–1962). In Enrique Rodríguez's case, the DB captures only his first 19 years on Odeón while missing the final 15 years of a 34-year exclusive relationship with that label.

For the modern/active groups, database max years generally trail the artists' actual output by 1–5 years, which is expected for a database that may not be continuously updated. The notable exception is **El Cachivache**, where the DB shows 2016 but the group has released approximately nine additional albums since then.

**Priority corrections (reissue dates to fix):** Alfredo de Angelis → 1989, Domingo Federico → 1968, Edgardo Donato → 1961, Francisco Lomuto → 1950, Miguel Caló → 1972, Osvaldo Pugliese → ~1986. **Priority additions (missing late catalogs):** Francisco Canaro through 1964, Osvaldo Fresedo through 1980, Enrique Rodríguez through 1971, Florindo Sassone through 1979, Fulvio Salamanca through 1969, Lucio Demare through 1968.