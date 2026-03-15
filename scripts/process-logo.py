#!/usr/bin/env python3
"""
Process the Ålesund Kiteklubb logo:
1. Crop to circular emblem only (remove text)
2. Replace white background with teal ocean color
"""
from PIL import Image

# Teal ocean color - matches Nordic coastal water (#0d9488 = Tailwind teal-600)
TEAL_OCEAN = (13, 148, 136)

def process_logo():
    img = Image.open("public/logo.jpg").convert("RGBA")
    w, h = img.size

    # Crop to top portion - circular emblem is in upper ~45% based on layout
    # 954x954 source: circle occupies roughly top 420-450px
    crop_height = 450
    cropped = img.crop((0, 0, w, crop_height))

    # Convert to array for pixel replacement
    pixels = cropped.load()
    cw, ch = cropped.size

    for y in range(ch):
        for x in range(cw):
            r, g, b, a = pixels[x, y]
            # Replace near-white pixels with teal (within a threshold)
            if r > 240 and g > 240 and b > 240:
                pixels[x, y] = (*TEAL_OCEAN, 255)

    # Save as PNG
    cropped.save("public/logo-emblem-teal.png", "PNG")
    print("Saved: public/logo-emblem-teal.png")

    # Also create transparent version for overlaying on kite-beach-bg
    img2 = Image.open("public/logo.jpg").convert("RGBA")
    cropped2 = img2.crop((0, 0, w, crop_height))
    pixels2 = cropped2.load()
    for y in range(ch):
        for x in range(cw):
            r, g, b, a = pixels2[x, y]
            if r > 240 and g > 240 and b > 240:
                pixels2[x, y] = (0, 0, 0, 0)  # Transparent
    cropped2.save("public/logo-emblem-transparent.png", "PNG")
    print("Saved: public/logo-emblem-transparent.png")

if __name__ == "__main__":
    process_logo()
