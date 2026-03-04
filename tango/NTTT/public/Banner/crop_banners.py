#!/usr/bin/env python3
"""
Crop Type1 banners to remove gold corner frames.
Outputs Type2__ versions (cropped, same dimensions).
"""

from PIL import Image
import os

# === CONFIGURATION ===
# Adjust these values to fine-tune the crop
# AGGRESSIVE CROP - thin title strip only
CROP_LEFT = 70      # pixels to remove from left
CROP_RIGHT = 70     # pixels to remove from right
CROP_TOP = 40       # pixels to remove from top
CROP_BOTTOM = 700   # aggressive - removes most bottom imagery

# Input/output
INPUT_PREFIX = "Type1__"
OUTPUT_PREFIX = "Type2__"
BANNER_DIR = os.path.dirname(os.path.abspath(__file__))

# === PROCESSING ===
def crop_banner(input_path, output_path):
    """Crop a single banner image."""
    img = Image.open(input_path)
    width, height = img.size

    # Calculate crop box (left, top, right, bottom)
    crop_box = (
        CROP_LEFT,
        CROP_TOP,
        width - CROP_RIGHT,
        height - CROP_BOTTOM
    )

    cropped = img.crop(crop_box)
    cropped.save(output_path, quality=95)

    return cropped.size

def main():
    # Find all Type1__ banners
    banners = [f for f in os.listdir(BANNER_DIR)
               if f.startswith(INPUT_PREFIX) and f.endswith('.png')]

    if not banners:
        print(f"No {INPUT_PREFIX}*.png files found in {BANNER_DIR}")
        return

    print(f"Found {len(banners)} banners to crop")
    print(f"Crop margins: L={CROP_LEFT}, R={CROP_RIGHT}, T={CROP_TOP}, B={CROP_BOTTOM}")
    print("-" * 50)

    output_sizes = []

    for banner in sorted(banners):
        input_path = os.path.join(BANNER_DIR, banner)
        output_name = banner.replace(INPUT_PREFIX, OUTPUT_PREFIX)
        output_path = os.path.join(BANNER_DIR, output_name)

        new_size = crop_banner(input_path, output_path)
        output_sizes.append(new_size)

        print(f"✓ {banner} → {output_name} ({new_size[0]}x{new_size[1]})")

    # Verify all same size
    if len(set(output_sizes)) == 1:
        print("-" * 50)
        print(f"✓ All outputs: {output_sizes[0][0]}x{output_sizes[0][1]}")
    else:
        print("-" * 50)
        print("⚠ WARNING: Output sizes vary!")
        for banner, size in zip(sorted(banners), output_sizes):
            print(f"  {banner}: {size}")

if __name__ == "__main__":
    main()
