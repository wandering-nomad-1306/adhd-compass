import math
import os
import shutil
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def draw_star(draw, cx, cy, r_outer, r_inner, fill):
    points = []
    for i in range(8):
        angle = i * (math.pi / 4) - math.pi / 2
        r = r_outer if i % 2 == 0 else r_inner
        points.append((cx + r * math.cos(angle), cy + r * math.sin(angle)))
    draw.polygon(points, fill=fill)

def create_og_preview():
    # 2x supersampling canvas: 2400x1260 -> downsampled to 1200x630
    w2, h2 = 2400, 1260
    final_w, final_h = 1200, 630

    base_dir = r"c:\Users\parth\adhd-compass_revised"
    out_path = os.path.join(base_dir, "client", "public", "og-preview.png")
    dist_out_path = os.path.join(base_dir, "dist", "public", "og-preview.png")

    # 1. Base dark forest green canvas
    img = Image.new("RGBA", (w2, h2), (18, 36, 29, 255))

    # Create smooth atmospheric lighting layer
    glow_bg = Image.new("RGBA", (w2, h2), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_bg)

    # Ambient light behind compass (cx=1850, cy=630)
    glow_draw.ellipse([1350, 130, 2350, 1130], fill=(42, 85, 66, 180))
    glow_draw.ellipse([1550, 330, 2150, 930], fill=(68, 125, 96, 140))
    glow_draw.ellipse([1700, 480, 2000, 780], fill=(110, 175, 138, 90))

    # Ambient soft light behind title on left
    glow_draw.ellipse([100, 200, 900, 900], fill=(30, 62, 48, 120))

    # Apply heavy Gaussian blur for ultra-smooth gradient (no banding!)
    glow_bg = glow_bg.filter(ImageFilter.GaussianBlur(120))
    img = Image.alpha_composite(img, glow_bg)

    draw = ImageDraw.Draw(img)

    # 2. Subtle cartographic navigation grid
    grid_color = (255, 255, 255, 12)
    for x in range(120, w2, 160):
        draw.line([(x, 60), (x, h2 - 60)], fill=grid_color, width=1)
    for y in range(80, h2, 160):
        draw.line([(60, y), (w2 - 60, y)], fill=grid_color, width=1)

    # 3. Framing borders with technical cartographic corner brackets
    border_color = (163, 195, 175, 55)
    margin = 54
    draw.rectangle([margin, margin, w2 - margin, h2 - margin], outline=border_color, width=2)

    # Corner brackets (reinforcements)
    c_len = 40
    bracket_col = (215, 238, 220, 200)
    # Top-left
    draw.line([(margin, margin + c_len), (margin, margin), (margin + c_len, margin)], fill=bracket_col, width=4)
    # Top-right
    draw.line([(w2 - margin - c_len, margin), (w2 - margin, margin), (w2 - margin, margin + c_len)], fill=bracket_col, width=4)
    # Bottom-left
    draw.line([(margin, h2 - margin - c_len), (margin, h2 - margin), (margin + c_len, h2 - margin)], fill=bracket_col, width=4)
    # Bottom-right
    draw.line([(w2 - margin - c_len, h2 - margin), (w2 - margin, h2 - margin), (w2 - margin, h2 - margin - c_len)], fill=bracket_col, width=4)

    # 4. Right Side: Compass & Brain Motif
    # Shifted to x=1840 to provide ample breathing room for text on left
    cx, cy = 1840, 630

    # Concentric rings of the compass plate
    ring_specs = [
        (390, (130, 180, 150, 45), 2),
        (370, (170, 215, 185, 95), 3),
        (350, (225, 200, 140, 75), 2),  # gold accent ring
        (310, (140, 185, 160, 50), 2),
        (260, (160, 205, 180, 55), 1),
        (160, (180, 215, 195, 65), 2),
        (100, (230, 205, 150, 110), 2), # inner gold ring
    ]
    for r, col, wid in ring_specs:
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], outline=col, width=wid)

    # Compass degree tick marks
    for deg in range(0, 360, 5):
        rad = math.radians(deg)
        cos_a = math.cos(rad)
        sin_a = math.sin(rad)
        if deg % 90 == 0:
            # Cardinal major marks
            r_in = 340
            r_out = 370
            draw.line([(cx + r_in * cos_a, cy + r_in * sin_a), (cx + r_out * cos_a, cy + r_out * sin_a)], fill=(240, 215, 150, 240), width=4)
        elif deg % 45 == 0:
            r_in = 348
            r_out = 370
            draw.line([(cx + r_in * cos_a, cy + r_in * sin_a), (cx + r_out * cos_a, cy + r_out * sin_a)], fill=(205, 235, 215, 180), width=3)
        elif deg % 15 == 0:
            r_in = 356
            r_out = 370
            draw.line([(cx + r_in * cos_a, cy + r_in * sin_a), (cx + r_out * cos_a, cy + r_out * sin_a)], fill=(160, 200, 180, 120), width=2)
        else:
            r_in = 362
            r_out = 370
            draw.line([(cx + r_in * cos_a, cy + r_in * sin_a), (cx + r_out * cos_a, cy + r_out * sin_a)], fill=(140, 180, 160, 70), width=1)

    # Cardinal labels: N at top, S at bottom, E at right, W at left
    cardinal_font = ImageFont.truetype(r"C:\Windows\Fonts\georgiab.ttf", 34)
    cardinals = [
        ("N", cx, cy - 295, (245, 225, 175, 240)),
        ("S", cx, cy + 295, (200, 225, 210, 180)),
        ("E", cx + 295, cy, (200, 225, 210, 180)),
        ("W", cx - 295, cy, (200, 225, 210, 180)),
    ]
    for text, px, py, col in cardinals:
        draw.text((px, py), text, font=cardinal_font, fill=col, anchor="mm")

    # Brain / Neural Constellation Nodes integrated into compass plate
    # Arranged in a stylized human brain lateral silhouette inside the compass
    neural_nodes = [
        # Frontal pole / Prefrontal Cortex (left-top)
        (cx - 200, cy - 80, 8),
        (cx - 180, cy - 160, 7),
        (cx - 120, cy - 210, 9),
        # Superior parietal / Motor strip
        (cx - 40, cy - 230, 8),
        (cx + 60, cy - 220, 9),
        (cx + 140, cy - 180, 7),
        # Occipital pole (back of brain / right)
        (cx + 200, cy - 100, 8),
        (cx + 210, cy - 10, 7),
        # Temporal lobe / Cerebellum
        (cx + 160, cy + 80, 9),
        (cx + 90, cy + 170, 8),
        (cx + 10, cy + 190, 7),
        # Ventral / Brainstem & Anterior Cingulate (inner nodes)
        (cx - 70, cy + 160, 8),
        (cx - 140, cy + 100, 7),
        (cx - 180, cy + 20, 8),
        # Core basal ganglia / Dopamine pathways
        (cx - 70, cy - 70, 7),
        (cx + 10, cy - 80, 8),
        (cx + 80, cy - 40, 7),
        (cx - 10, cy + 30, 8),
        (cx + 70, cy + 50, 7),
    ]

    # Axons connecting brain nodes
    axon_lines = [
        # Outer cortex perimeter
        (0, 1), (1, 2), (2, 3), (3, 4), (4, 5), (5, 6), (6, 7),
        (7, 8), (8, 9), (9, 10), (10, 11), (11, 12), (12, 13), (13, 0),
        # Internal executive & dopamine networks
        (1, 14), (2, 14), (3, 15), (4, 15), (5, 16), (6, 16),
        (14, 15), (15, 16), (14, 17), (15, 17), (16, 18), (17, 18),
        (13, 14), (12, 17), (11, 17), (10, 18), (9, 18), (8, 18),
    ]
    for i1, i2 in axon_lines:
        p1 = neural_nodes[i1]
        p2 = neural_nodes[i2]
        draw.line([(p1[0], p1[1]), (p2[0], p2[1])], fill=(125, 200, 170, 100), width=2)

    # Draw neural nodes with glowing halos
    for nx, ny, nr in neural_nodes:
        # soft outer halo
        draw.ellipse([nx - nr - 5, ny - nr - 5, nx + nr + 5, ny + nr + 5], fill=(110, 215, 170, 50))
        # inner bright core
        draw.ellipse([nx - nr, ny - nr, nx + nr, ny + nr], fill=(225, 252, 238, 240))
        draw.ellipse([nx - 2, ny - 2, nx + 2, ny + 2], fill=(255, 255, 255, 255))

    # Compass Needle: Pointing Northeast (approx 45 degrees up-right: -48 deg in screen coordinates)
    needle_angle = math.radians(-48)
    perp_angle = needle_angle + math.pi / 2

    needle_len_fwd = 260
    needle_len_back = 155
    needle_half_w = 30

    tip_fwd = (cx + needle_len_fwd * math.cos(needle_angle), cy + needle_len_fwd * math.sin(needle_angle))
    tip_back = (cx - needle_len_back * math.cos(needle_angle), cy - needle_len_back * math.sin(needle_angle))
    side_left = (cx + needle_half_w * math.cos(perp_angle), cy + needle_half_w * math.sin(perp_angle))
    side_right = (cx - needle_half_w * math.cos(perp_angle), cy - needle_half_w * math.sin(perp_angle))

    # Forward point: Light gold side & Rich gold side
    draw.polygon([tip_fwd, side_left, (cx, cy)], fill=(248, 226, 165, 250))  # Bright gold
    draw.polygon([tip_fwd, side_right, (cx, cy)], fill=(215, 178, 108, 250)) # Shadowed gold

    # Rear point: Sage cream side & Forest shadow side
    draw.polygon([tip_back, side_left, (cx, cy)], fill=(190, 218, 202, 230)) # Soft sage
    draw.polygon([tip_back, side_right, (cx, cy)], fill=(115, 150, 130, 230)) # Dark sage

    # Subtle needle outline
    draw.line([tip_fwd, side_left, tip_back, side_right, tip_fwd], fill=(255, 248, 215, 190), width=2)

    # Compass Center Bezel (pivot)
    draw.ellipse([cx - 42, cy - 42, cx + 42, cy + 42], fill=(28, 50, 40, 255), outline=(230, 200, 135, 255), width=4)
    draw.ellipse([cx - 24, cy - 24, cx + 24, cy + 24], fill=(230, 200, 135, 255))
    draw.ellipse([cx - 10, cy - 10, cx + 10, cy + 10], fill=(255, 248, 225, 255))

    # 5. Left Side: Typography & Branding
    left_x = 160

    # Eyebrow Pill Badge
    pill_y = 195
    pill_w = 640
    pill_h = 56
    draw.rounded_rectangle([left_x, pill_y, left_x + pill_w, pill_y + pill_h], radius=28, fill=(35, 70, 56, 190), outline=(130, 180, 155, 130), width=2)
    # 4-point gold star icon inside pill
    star_x = left_x + 36
    star_y = pill_y + 28
    draw_star(draw, star_x, star_y, 11, 4, fill=(245, 220, 155, 255))

    # Eyebrow text
    eyebrow_font = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", 23)
    draw.text((star_x + 24, pill_y + 14), "CLINICAL NEUROSCIENCE & LIVED EXPERIENCE", font=eyebrow_font, fill=(220, 242, 228, 255))

    # Main Title: "ADHD Compass"
    title_font = ImageFont.truetype(r"C:\Windows\Fonts\georgiab.ttf", 148)
    title_text = "ADHD Compass"
    draw.text((left_x - 4, 285), title_text, font=title_font, fill=(253, 251, 247, 255))

    # Accent decorative underline below title
    accent_bar_y = 470
    draw.line([(left_x, accent_bar_y), (left_x + 320, accent_bar_y)], fill=(230, 200, 135, 220), width=6)
    draw.line([(left_x + 335, accent_bar_y), (left_x + 375, accent_bar_y)], fill=(160, 210, 185, 180), width=6)

    # Subtitle: "Interactive ADHD Guide & Assessment"
    subtitle_font = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", 56)
    subtitle_text = "Interactive ADHD Guide & Assessment"
    draw.text((left_x, 515), subtitle_text, font=subtitle_font, fill=(225, 242, 230, 255))

    # Description sentence
    desc_font = ImageFont.truetype(r"C:\Windows\Fonts\segoeui.ttf", 36)
    desc_text = "Translating complex neurobiology into calm, evidence-based clarity."
    draw.text((left_x, 605), desc_text, font=desc_font, fill=(185, 210, 195, 230))

    # Feature Badges Row (3 distinct pills with custom drawn gold stars)
    badges = [
        ("8 Interactive Chapters", 390),
        ("Neuroscience & Meds", 380),
        ("DSM-5 Guided Assessment", 420),
    ]
    bx = left_x
    by = 705
    bh = 66
    badge_font = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", 28)

    for btext, bw in badges:
        draw.rounded_rectangle([bx, by, bx + bw, by + bh], radius=16, fill=(28, 56, 44, 210), outline=(105, 155, 130, 130), width=2)
        # Draw clean 4-point gold star inside badge
        bstar_x = bx + 28
        bstar_y = by + 33
        draw_star(draw, bstar_x, bstar_y, 9, 3, fill=(235, 205, 140, 255))
        draw.text((bstar_x + 18, by + 16), btext, font=badge_font, fill=(235, 248, 240, 255))
        bx += bw + 20

    # Bottom Footer Divider
    div_y = 870
    draw.line([(left_x, div_y), (left_x + 920, div_y)], fill=(120, 165, 140, 80), width=2)

    # Domain & Trust badges
    domain_font = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", 44)
    tagline_font = ImageFont.truetype(r"C:\Windows\Fonts\segoeui.ttf", 32)

    # Domain
    draw.text((left_x, 910), "adhdcompass.in", font=domain_font, fill=(245, 222, 160, 255))
    # Trust badges
    trust_text = "Independent  •  Peer-Reviewed Evidence  •  100% Ad-Free"
    draw.text((left_x, 978), trust_text, font=tagline_font, fill=(175, 200, 185, 210))

    # 6. Downsample from 2400x1260 to 1200x630 using LANCZOS
    final_img = img.resize((final_w, final_h), Image.Resampling.LANCZOS)
    final_rgb = final_img.convert("RGB")

    # 7. Test save and optimize
    final_rgb.save(out_path, optimize=True)
    size_24bit = os.path.getsize(out_path)
    print(f"24-bit PNG size: {size_24bit} bytes ({size_24bit / 1024:.1f} KB)")

    # Target is strictly under 200 KB
    if size_24bit > 195 * 1024:
        print("Optimizing palette with Floyd-Steinberg dithering for < 200 KB...")
        q = final_rgb.quantize(colors=256, method=Image.Resampling.LANCZOS, dither=Image.Dither.FLOYDSTEINBERG)
        q.save(out_path, optimize=True)
        final_size = os.path.getsize(out_path)
        print(f"Quantized PNG size: {final_size} bytes ({final_size / 1024:.1f} KB)")
    else:
        final_size = size_24bit

    # Copy to dist if dist exists
    dist_dir = os.path.dirname(dist_out_path)
    if os.path.exists(dist_dir):
        shutil.copy2(out_path, dist_out_path)
        print(f"Copied to dist: {dist_out_path}")

    print(f"Result: {out_path} ({final_size / 1024:.1f} KB) - Target < 200 KB: {final_size < 200 * 1024}")
    return out_path, final_size

if __name__ == "__main__":
    create_og_preview()
