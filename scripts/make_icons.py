from PIL import Image, ImageDraw, ImageFont
import os

OUT = os.path.join(os.path.dirname(__file__), "..", "icons")
os.makedirs(OUT, exist_ok=True)

BG = (15, 17, 21, 255)
ACCENT = (255, 107, 53, 255)

def dumbbell(draw, cx, cy, scale, color):
    bar_w = scale * 1.6
    bar_h = scale * 0.16
    plate_w = scale * 0.22
    plate_h = scale * 0.6
    draw.rounded_rectangle(
        [cx - bar_w / 2, cy - bar_h / 2, cx + bar_w / 2, cy + bar_h / 2],
        radius=bar_h / 2, fill=color,
    )
    for sign in (-1, 1):
        x = cx + sign * bar_w / 2
        draw.rounded_rectangle(
            [x - plate_w / 2, cy - plate_h / 2, x + plate_w / 2, cy + plate_h / 2],
            radius=plate_w / 2, fill=color,
        )

def make(size, maskable=False):
    img = Image.new("RGBA", (size, size), BG)
    d = ImageDraw.Draw(img)
    if maskable:
        pad = size * 0.30
        d.rounded_rectangle([0, 0, size, size], radius=size * 0.18, fill=BG)
        scale = size - pad * 2
        dumbbell(d, size / 2, size / 2, scale, ACCENT)
    else:
        d.rounded_rectangle([0, 0, size, size], radius=size * 0.22, fill=BG)
        scale = size * 0.62
        dumbbell(d, size / 2, size / 2, scale, ACCENT)
    return img

for size in (192, 512):
    make(size, maskable=False).save(os.path.join(OUT, f"icon-{size}.png"))
    make(size, maskable=True).save(os.path.join(OUT, f"icon-maskable-{size}.png"))

print("icons written to", OUT)
