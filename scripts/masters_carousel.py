#!/usr/bin/env python3
"""Generate 3-slide Instagram carousel (1080x1080) for Masters WHOOP data."""

from PIL import Image, ImageDraw, ImageFont
import os

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "social-posts")
os.makedirs(OUT_DIR, exist_ok=True)

W, H = 1080, 1080

# Colors
BG = "#0D0D0D"
WHITE = "#FFFFFF"
GREEN = "#00D46A"
RED = "#FF3B3B"
GRAY = "#888888"
DARK_CARD = "#1A1A1A"
ACCENT_GREEN = "#00D46A"

def get_font(size, bold=False):
    """Try to load a clean sans-serif font."""
    paths = [
        "/System/Library/Fonts/SFProDisplay-Bold.otf" if bold else "/System/Library/Fonts/SFProDisplay-Regular.otf",
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
    ]
    for p in paths:
        try:
            return ImageFont.truetype(p, size)
        except (OSError, IOError):
            continue
    return ImageFont.load_default()


def draw_rounded_rect(draw, xy, radius, fill):
    x0, y0, x1, y1 = xy
    draw.rounded_rectangle(xy, radius=radius, fill=fill)


def draw_bar(draw, x, y, w, h, pct, color, label, font_sm, font_lg):
    """Draw a single recovery bar."""
    bar_h = int(h * (pct / 100))
    bar_y = y + h - bar_h

    # Bar background
    draw_rounded_rect(draw, (x, y, x + w, y + h), 12, "#2A2A2A")
    # Bar fill
    if bar_h > 24:
        draw_rounded_rect(draw, (x, bar_y, x + w, y + h), 12, color)

    # Percentage text centered in bar
    pct_text = f"{pct}%"
    bbox = draw.textbbox((0, 0), pct_text, font=font_lg)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    tx = x + (w - tw) // 2
    ty = bar_y + (bar_h - th) // 2 if bar_h > 40 else y + h - 50
    draw.text((tx, ty), pct_text, fill=WHITE, font=font_lg)

    # Day label below
    bbox = draw.textbbox((0, 0), label, font=font_sm)
    tw = bbox[2] - bbox[0]
    draw.text((x + (w - tw) // 2, y + h + 16), label, fill=GRAY, font=font_sm)


# ─── SLIDE 1: Recovery Timeline ───

img1 = Image.new("RGB", (W, H), BG)
d1 = ImageDraw.Draw(img1)

font_title = get_font(52, bold=True)
font_sub = get_font(28)
font_sm = get_font(22)
font_bar_pct = get_font(30, bold=True)
font_label = get_font(20)
font_big = get_font(72, bold=True)
font_source = get_font(16)

# Top section
d1.text((80, 80), "THE BODY BEHIND", fill=GRAY, font=font_sub)
d1.text((80, 120), "THE GREEN JACKET", fill=WHITE, font=font_title)

# Subtitle
d1.text((80, 200), "WHOOP Recovery Scores  |  Masters Week 2026", fill=GRAY, font=font_sm)

# Recovery bars
days = [
    ("THU", 89, GREEN),
    ("FRI", 79, GREEN),
    ("SAT", 94, GREEN),
    ("SUN", 87, GREEN),
    ("MON", 7, RED),
]

bar_w = 130
bar_h = 420
start_x = 100
start_y = 300
gap = 50

for i, (day, pct, color) in enumerate(days):
    x = start_x + i * (bar_w + gap)
    draw_bar(d1, x, start_y, bar_w, bar_h, pct, color, day, font_label, font_bar_pct)

# Bottom label
d1.text((80, 820), "RECOVERY SCORE", fill=GRAY, font=font_label)
d1.line((80, 810, 80, 720), fill="#333333", width=2)

# Source
d1.text((80, 990), "Data: Will Ahmed, CEO WHOOP  •  April 2026", fill="#555555", font=font_source)

# Slide indicator dots
for i in range(3):
    cx = W // 2 - 30 + i * 30
    cy = 950
    fill = WHITE if i == 0 else "#333333"
    d1.ellipse((cx - 5, cy - 5, cx + 5, cy + 5), fill=fill)

img1.save(os.path.join(OUT_DIR, "slide_1_recovery.png"), "PNG")
print("✓ Slide 1 saved")


# ─── SLIDE 2: Heart Rate Story ───

img2 = Image.new("RGB", (W, H), BG)
d2 = ImageDraw.Draw(img2)

font_metric = get_font(64, bold=True)
font_unit = get_font(24)
font_metric_label = get_font(22, bold=True)

d2.text((80, 80), "FINAL ROUND", fill=GRAY, font=font_sub)
d2.text((80, 120), "HEART RATE", fill=WHITE, font=font_title)
d2.text((80, 200), "What his body went through on Sunday", fill=GRAY, font=font_sm)

# HR stat cards - 2x2 grid
cards = [
    ("RESTING HR", "47–49", "bpm", GREEN),
    ("18TH TEE", "135", "bpm", "#FFB800"),
    ("TAP IN", "105", "bpm", GREEN),
    ("CELEBRATION", "150", "bpm", RED),
]

card_w = 420
card_h = 220
margin = 40
grid_x = 80
grid_y = 310

for i, (label, value, unit, accent) in enumerate(cards):
    col = i % 2
    row = i // 2
    x = grid_x + col * (card_w + margin)
    y = grid_y + row * (card_h + margin)

    draw_rounded_rect(d2, (x, y, x + card_w, y + card_h), 16, DARK_CARD)

    # Accent line at top of card
    d2.rounded_rectangle((x, y, x + card_w, y + 4), radius=2, fill=accent)

    # Label
    d2.text((x + 30, y + 28), label, fill=GRAY, font=font_metric_label)

    # Value
    d2.text((x + 30, y + 70), value, fill=WHITE, font=font_metric)

    # Unit
    bbox = d2.textbbox((0, 0), value, font=font_metric)
    val_w = bbox[2] - bbox[0]
    d2.text((x + 30 + val_w + 12, y + 100), unit, fill=GRAY, font=font_unit)

# Source
d2.text((80, 990), "Data: Will Ahmed, CEO WHOOP  •  April 2026", fill="#555555", font=font_source)

# Slide indicator dots
for i in range(3):
    cx = W // 2 - 30 + i * 30
    cy = 950
    fill = WHITE if i == 1 else "#333333"
    d2.ellipse((cx - 5, cy - 5, cx + 5, cy + 5), fill=fill)

img2.save(os.path.join(OUT_DIR, "slide_2_heartrate.png"), "PNG")
print("✓ Slide 2 saved")


# ─── SLIDE 3: The Aftermath ───

img3 = Image.new("RGB", (W, H), BG)
d3 = ImageDraw.Draw(img3)

d3.text((80, 80), "THE AFTERMATH", fill=GRAY, font=font_sub)
d3.text((80, 120), "MONDAY MORNING", fill=WHITE, font=font_title)
d3.text((80, 200), "What winning the Masters does to your body", fill=GRAY, font=font_sm)

# Big center stat
big_val = "7%"
bbox = d3.textbbox((0, 0), big_val, font=get_font(180, bold=True))
tw = bbox[2] - bbox[0]
th = bbox[3] - bbox[1]
d3.text(((W - tw) // 2, 340), big_val, fill=RED, font=get_font(180, bold=True))

d3.text(((W - 280) // 2, 540), "RECOVERY SCORE", fill=GRAY, font=font_metric_label)

# Red line accent
line_w = 200
d3.rounded_rectangle(((W - line_w) // 2, 590, (W + line_w) // 2, 596), radius=3, fill=RED)

# Bottom stats row
bottom_stats = [
    ("STEPS", "24K", "Sunday total"),
    ("PEAK HR", "150", "bpm celebrating"),
    ("STATUS", "RED", "day"),
]

stat_w = 280
stat_start_x = (W - stat_w * 3 - 40 * 2) // 2
stat_y = 680

for i, (label, val, sub) in enumerate(bottom_stats):
    x = stat_start_x + i * (stat_w + 40)
    cx = x + stat_w // 2

    draw_rounded_rect(d3, (x, stat_y, x + stat_w, stat_y + 160), 16, DARK_CARD)

    # Label
    bbox = d3.textbbox((0, 0), label, font=font_label)
    d3.text((cx - (bbox[2] - bbox[0]) // 2, stat_y + 18), label, fill=GRAY, font=font_label)

    # Value
    bbox = d3.textbbox((0, 0), val, font=get_font(48, bold=True))
    d3.text((cx - (bbox[2] - bbox[0]) // 2, stat_y + 52), val, fill=WHITE, font=get_font(48, bold=True))

    # Sub
    bbox = d3.textbbox((0, 0), sub, font=font_source)
    d3.text((cx - (bbox[2] - bbox[0]) // 2, stat_y + 118), sub, fill=GRAY, font=font_source)

# Source
d3.text((80, 990), "Data: Will Ahmed, CEO WHOOP  •  April 2026", fill="#555555", font=font_source)

# Slide indicator dots
for i in range(3):
    cx = W // 2 - 30 + i * 30
    cy = 950
    fill = WHITE if i == 2 else "#333333"
    d3.ellipse((cx - 5, cy - 5, cx + 5, cy + 5), fill=fill)

img3.save(os.path.join(OUT_DIR, "slide_3_aftermath.png"), "PNG")
print("✓ Slide 3 saved")

print(f"\nAll slides saved to: {OUT_DIR}")
