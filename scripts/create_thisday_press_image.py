import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

# Output paths
downloads_dir = r"C:\Users\icmas\Downloads"
out_press_img = os.path.join(downloads_dir, "ajose-thisday-press-image.png")
marketing_out = os.path.join("public", "marketing", "ajose-thisday-press-image.png")

# Dimensions for standard online news header banner (16:9 ratio)
W, H = 1200, 675

# Create base canvas with deep brand forest green gradient
canvas = Image.new("RGBA", (W, H), (11, 48, 34, 255))
draw = ImageDraw.Draw(canvas)

# Radial / subtle gradient lighting
for y in range(H):
    for x in range(W):
        # Subtle light center-left
        dx = (x - 400) / 700
        dy = (y - 300) / 400
        dist = (dx**2 + dy**2)**0.5
        if dist < 1.4:
            alpha = int(45 * (1.4 - dist))
            draw.point((x, y), fill=(212, 168, 67, alpha))

# Incorporate mobile-app-showcase mockup on the right side
showcase_path = os.path.join("public", "mobile-app-showcase.jpg")
if os.path.exists(showcase_path):
    showcase = Image.open(showcase_path).convert("RGBA")
    # Resize to fit right side
    target_h = 580
    target_w = int(showcase.width * (target_h / showcase.height))
    showcase = showcase.resize((target_w, target_h), Image.Resampling.LANCZOS)
    
    # Create soft alpha mask to blend the left edge smoothly into our background
    mask = Image.new("L", (target_w, target_h), 255)
    mask_draw = ImageDraw.Draw(mask)
    blend_width = int(target_w * 0.40)
    for x in range(blend_width):
        val = int(255 * (x / blend_width)**1.4)
        mask_draw.line([(x, 0), (x, target_h)], fill=val)
        
    canvas.paste(showcase, (W - target_w + 40, (H - target_h) // 2), mask)

# Left Side Editorial Branding & Typography
font_dir = r"C:\Windows\Fonts"
f_badge = ImageFont.truetype(os.path.join(font_dir, "segoeuib.ttf"), 14)
f_title_main = ImageFont.truetype(os.path.join(font_dir, "segoeuib.ttf"), 54)
f_title_sub = ImageFont.truetype(os.path.join(font_dir, "georgiab.ttf"), 46)
f_desc = ImageFont.truetype(os.path.join(font_dir, "segoeui.ttf"), 20)
f_tagline = ImageFont.truetype(os.path.join(font_dir, "segoeuib.ttf"), 18)
f_url = ImageFont.truetype(os.path.join(font_dir, "segoeuib.ttf"), 16)

# Overlay subtle dark tint on left side for text clarity
overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
ov_draw = ImageDraw.Draw(overlay)
for x in range(680):
    a = int(220 * (1.0 - (x / 680)**1.3))
    ov_draw.line([(x, 0), (x, H)], fill=(7, 24, 16, a))
canvas = Image.alpha_composite(canvas, overlay)
draw = ImageDraw.Draw(canvas)

# Paste Brand Logo
logo_path = os.path.join("public", "ajose-rings-logo.png")
if os.path.exists(logo_path):
    logo = Image.open(logo_path).convert("RGBA")
    logo = logo.resize((64, 64), Image.Resampling.LANCZOS)
    canvas.paste(logo, (75, 75), logo)

# Brand Name next to logo
draw.text((150, 80), "Àjọṣe", font=ImageFont.truetype(os.path.join(font_dir, "segoeuib.ttf"), 30), fill=(243, 238, 227, 255))
draw.text((150, 118), "AJOSE TECHNOLOGIES • NIGERIA", font=f_badge, fill=(212, 168, 67, 255))

# Category Badge
badge_y = 180
draw.rounded_rectangle([(75, badge_y), (365, badge_y + 32)], radius=16, fill=(212, 168, 67, 40), outline=(212, 168, 67, 120), width=1)
draw.text((92, badge_y + 7), "FINANCIAL COOPERATIVE PLATFORM", font=ImageFont.truetype(os.path.join(font_dir, "segoeuib.ttf"), 11), fill=(212, 168, 67, 255))

# Main Headline
y = 230
draw.text((75, y), "Digitising Rotational", font=f_title_main, fill=(255, 255, 255, 255))
y += 62
draw.text((75, y), "Ajo & Esusu Circles", font=f_title_sub, fill=(212, 168, 67, 255))

# Description
y += 68
desc_lines = [
    "Eliminating default risks, manual tracking, and payment disputes",
    "with automated bank direct debits and bank-grade BVN verification."
]
for line in desc_lines:
    draw.text((75, y), line, font=f_desc, fill=(216, 226, 220, 240))
    y += 28

# Bottom Tagline & URL
bottom_y = H - 90
draw.text((75, bottom_y), "“Turn by Turn, No Wahala”", font=f_tagline, fill=(243, 238, 227, 240))
draw.text((75, bottom_y + 30), "Official Web: https://ajose.ng  •  Built for Nigeria", font=f_url, fill=(212, 168, 67, 240))

# Save
canvas = canvas.convert("RGB")
canvas.save(out_press_img, quality=98)
canvas.save(marketing_out, quality=98)
print(f"Press Image Generated Successfully!")
print(f"Saved to: {out_press_img}")
print(f"Saved to: {marketing_out}")
