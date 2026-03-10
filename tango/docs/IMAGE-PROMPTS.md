# NTTT Image Prompts

*Swipe menu header banners for Name That Tango Tune*

---

## Context

**App:** Name That Tango Tune (NTTT)
**Use:** Swipe menu headers replacing `< LABEL >` navigation
**Platform:** Mobile-first (vertical screens), also desktop

### Color Palette (from app CSS)

| Color | Hex | Use |
|-------|-----|-----|
| Deep navy | `#000517` | Primary background |
| Silver-blue | `#bbd4de` | Text, accents |
| Bright blue | `#66aaff` | Accent highlights |
| Deep purple | `#1b005a` | Secondary |
| Gold | `#d4af37` | Warm accents |

### Style Direction

- **Era:** 1940s Golden Age Buenos Aires
- **Aesthetic:** Art Deco, vintage tango posters
- **Mood:** Elegant, nostalgic, sophisticated
- **Elements:** Bandoneon, orchestras, microphones, vinyl, sheet music

### Sizing Options

| Ratio | Pixels | Feel |
|-------|--------|------|
| 16:9 | 800x450 | Hero card (prominent) |
| 2:1 | 800x400 | Medium banner |
| 3:1 | 900x300 | Strip header |
| 4:1 | 800x200 | Minimal nav |

**Recommendation:** Start with **2:1 (800x400)** - balanced visibility without dominating screen. Adjust after seeing results.

---

## Shared Style Prefix

Use this prefix for all prompts to maintain consistency:

```
Art deco tango banner, 1940s Buenos Aires Golden Age style, deep navy #000517 background, silver-blue #bbd4de text and accents, subtle gold highlights, elegant vintage poster aesthetic, clean composition, horizontal banner 2:1 aspect ratio,
```

---

## Individual Prompts

### 1. NAME THAT TANGO TUNE (Main Title)

```
Art deco tango banner, 1940s Buenos Aires Golden Age style, deep navy #000517 background, silver-blue #bbd4de text and accents, subtle gold highlights, elegant vintage poster aesthetic, clean composition, horizontal banner 2:1 aspect ratio, "NAME THAT TANGO TUNE" elegant bold typography as focal point, golden bandoneon silhouette, Buenos Aires skyline silhouette at dusk, musical notes floating subtly, sophisticated and inviting
```

---

### 2. ORCHESTRA

```
Art deco tango banner, 1940s Buenos Aires Golden Age style, deep navy #000517 background, silver-blue #bbd4de text and accents, subtle gold highlights, elegant vintage poster aesthetic, clean composition, horizontal banner 2:1 aspect ratio, "ORCHESTRA" bold typography centered, vintage tango orchestra silhouettes with bandoneons violins double bass piano, conductor figure, sheet music motifs, concert hall atmosphere
```

---

### 3. SINGER

```
Art deco tango banner, 1940s Buenos Aires Golden Age style, deep navy #000517 background, silver-blue #bbd4de text and accents, subtle gold highlights, elegant vintage poster aesthetic, clean composition, horizontal banner 2:1 aspect ratio, "SINGER" elegant typography centered, vintage ribbon microphone with warm glow, male tango singer silhouette in suit, spotlight rays, 1940s radio broadcast mood
```

---

### 4. SONGS

```
Art deco tango banner, 1940s Buenos Aires Golden Age style, deep navy #000517 background, silver-blue #bbd4de text and accents, subtle gold highlights, elegant vintage poster aesthetic, clean composition, horizontal banner 2:1 aspect ratio, "SONGS" bold typography centered, vintage vinyl record with golden label, treble clef and musical notes, tango sheet music pages, classic record sleeve aesthetic
```

---

### 5. SETUP

```
Art deco tango banner, 1940s Buenos Aires Golden Age style, deep navy #000517 background, silver-blue #bbd4de text and accents, subtle gold highlights, elegant vintage poster aesthetic, clean composition, horizontal banner 2:1 aspect ratio, "SETUP" clean typography centered, stylized art deco gear icons, slider controls, subtle bandoneon bellows pattern in background, minimal elegant utility feel
```

---

### 6. CONTEST

```
Art deco tango banner, 1940s Buenos Aires Golden Age style, deep navy #000517 background, silver-blue #bbd4de text and accents, subtle gold highlights, elegant vintage poster aesthetic, clean composition, horizontal banner 2:1 aspect ratio, "CONTEST" dramatic bold typography centered, trophy cup with laurel wreath, podium silhouette, stars and competitive flourishes, championship poster energy
```

---

### 7. LISTEN

```
Art deco tango banner, 1940s Buenos Aires Golden Age style, deep navy #000517 background, silver-blue #bbd4de text and accents, subtle gold highlights, elegant vintage poster aesthetic, clean composition, horizontal banner 2:1 aspect ratio, "LISTEN" elegant typography centered, vintage gramophone horn or headphones, sound waves radiating outward, warm golden glow from audio source, contemplative mood
```

---

## Usage

1. Copy the full prompt for the image you want
2. Paste into your image LLM (Midjourney, DALL-E, etc.)
3. To adjust:
   - Change aspect ratio: replace `2:1` with `16:9`, `3:1`, etc.
   - Change colors: swap hex codes
   - Change style: replace "Art deco" with "minimalist modern", etc.
4. Generate, review, iterate

---

## Desktop/Landscape Variants

For desktop hero banners (if needed later), change:
- Aspect ratio: `3:1` or `4:1` (wider)
- Add: `wide panoramic composition, more horizontal space`

Example suffix:
```
, wide panoramic composition for desktop header, 4:1 aspect ratio
```

---

## Python Resize Script (Future)

If you generate at high res and need to batch resize:

```python
# resize_banners.py
from PIL import Image
import os

INPUT_DIR = "originals/"
OUTPUT_DIR = "resized/"
TARGET_WIDTH = 800

os.makedirs(OUTPUT_DIR, exist_ok=True)

for filename in os.listdir(INPUT_DIR):
    if filename.endswith(('.png', '.jpg', '.webp')):
        img = Image.open(os.path.join(INPUT_DIR, filename))
        ratio = TARGET_WIDTH / img.width
        new_size = (TARGET_WIDTH, int(img.height * ratio))
        resized = img.resize(new_size, Image.LANCZOS)
        resized.save(os.path.join(OUTPUT_DIR, filename))
        print(f"Resized: {filename} -> {new_size}")
```

---

*Last updated: 2026-03-01*
*Owner: Gotan*
