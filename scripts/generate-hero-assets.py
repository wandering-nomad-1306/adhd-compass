import os
import shutil
from PIL import Image

def generate_hero_assets():
    base_dir = r"c:\Users\parth\adhd-compass_revised"
    img_dir = os.path.join(base_dir, "client", "public", "images")
    dist_img_dir = os.path.join(base_dir, "dist", "public", "images")
    src_png = os.path.join(img_dir, "hero-background.png")

    if not os.path.exists(src_png):
        raise FileNotFoundError(f"Source image not found: {src_png}")

    print(f"Loading source: {src_png}")
    im = Image.open(src_png)
    if im.mode != "RGB":
        im = im.convert("RGB")
    orig_w, orig_h = im.size
    print(f"Source dimensions: {orig_w}x{orig_h}")

    widths = [480, 960, 1920]
    generated_files = []

    # 1. Generate AVIF & WebP for 480, 960, 1920
    for w in widths:
        h = round(w * orig_h / orig_w)
        resized = im.resize((w, h), Image.Resampling.LANCZOS)

        # AVIF (quality 78)
        avif_name = f"hero-bg-{w}w.avif"
        avif_path = os.path.join(img_dir, avif_name)
        resized.save(avif_path, quality=78)
        size_avif = os.path.getsize(avif_path)
        print(f"Generated {avif_name}: {size_avif} bytes ({size_avif / 1024:.1f} KB)")
        generated_files.append((avif_path, size_avif))

        # WebP (quality 84)
        webp_name = f"hero-bg-{w}w.webp"
        webp_path = os.path.join(img_dir, webp_name)
        resized.save(webp_path, quality=84, method=6)
        size_webp = os.path.getsize(webp_path)
        print(f"Generated {webp_name}: {size_webp} bytes ({size_webp / 1024:.1f} KB)")
        generated_files.append((webp_path, size_webp))

    # 2. Generate JPG 1920w (progressive, quality 85)
    h1920 = round(1920 * orig_h / orig_w)
    resized1920 = im.resize((1920, h1920), Image.Resampling.LANCZOS)
    jpg_name = "hero-bg-1920w.jpg"
    jpg_path = os.path.join(img_dir, jpg_name)
    resized1920.save(jpg_path, quality=85, progressive=True, optimize=True)
    size_jpg = os.path.getsize(jpg_path)
    print(f"Generated {jpg_name}: {size_jpg} bytes ({size_jpg / 1024:.1f} KB)")
    generated_files.append((jpg_path, size_jpg))

    # 3. Optimize fallback PNG hero-background.png (< 250 KB)
    # Quantize to 80 colors with Floyd-Steinberg dithering for clean gradients
    quantized_png = im.quantize(colors=80, method=Image.Resampling.LANCZOS)
    opt_png_path = os.path.join(img_dir, "hero-background.png")
    quantized_png.save(opt_png_path, optimize=True)
    size_png = os.path.getsize(opt_png_path)
    print(f"Optimized hero-background.png: {size_png} bytes ({size_png / 1024:.1f} KB)")
    generated_files.append((opt_png_path, size_png))

    # 4. Copy to dist/public/images if dist directory exists
    if os.path.exists(dist_img_dir):
        for file_path, _ in generated_files:
            dest = os.path.join(dist_img_dir, os.path.basename(file_path))
            shutil.copy2(file_path, dest)
            print(f"Copied to dist: {dest}")

    # 5. Verify all files < 250 KB
    all_under_target = True
    for file_path, sz in generated_files:
        kb = sz / 1024
        if sz >= 250 * 1024:
            print(f"WARNING: {os.path.basename(file_path)} is {kb:.1f} KB (>= 250 KB target!)")
            all_under_target = False
        else:
            print(f"OK: {os.path.basename(file_path)} is {kb:.1f} KB (< 250 KB)")

    print(f"Success: {all_under_target}")

if __name__ == "__main__":
    generate_hero_assets()
