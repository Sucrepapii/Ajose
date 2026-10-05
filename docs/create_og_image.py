import os
from PIL import Image, ImageDraw, ImageFont

def generate_og_image():
    width = 1200
    height = 630
    
    # 1. Base Image with Gradient Background (#061B13 to #0B3022)
    img = Image.new("RGBA", (width, height), (6, 27, 19, 255))
    draw = ImageDraw.Draw(img)
    
    top_color = (6, 27, 19)
    bottom_color = (11, 48, 34)
    for y in range(height):
        factor = y / height
        r = int(top_color[0] + factor * (bottom_color[0] - top_color[0]))
        g = int(top_color[1] + factor * (bottom_color[1] - top_color[1]))
        b = int(top_color[2] + factor * (bottom_color[2] - top_color[2]))
        draw.line([(0, y), (width, y)], fill=(r, g, b, 255))
        
    # Decorative Golden Border & Corner Accents
    gold = (197, 160, 89, 255) # #C5A059
    gold_dim = (197, 160, 89, 70)
    
    # Outer border
    draw.rounded_rectangle([(30, 30), (width - 30, height - 30)], radius=24, outline=gold_dim, width=2)
    # Inner border
    draw.rounded_rectangle([(36, 36), (width - 36, height - 36)], radius=20, outline=(197, 160, 89, 30), width=1)
    
    # Fonts using Segoe UI (Supports full Nigerian Yoruba diacritics natively)
    font_bold = "C:/Windows/Fonts/segoeuib.ttf"
    font_regular = "C:/Windows/Fonts/segoeui.ttf"
    
    font_title = ImageFont.truetype(font_bold, 86)
    font_tagline = ImageFont.truetype(font_bold, 36)
    font_subtitle = ImageFont.truetype(font_regular, 26)
    font_pill = ImageFont.truetype(font_bold, 16)
    font_badge = ImageFont.truetype(font_bold, 20)
    
    # Load and place brand pot logo
    logo_path = "public/ajose-brand-pot.png"
    if os.path.exists(logo_path):
        pot = Image.open(logo_path).convert("RGBA")
        pot_size = 290
        pot = pot.resize((pot_size, pot_size), Image.Resampling.LANCZOS)
        
        logo_x = width - pot_size - 90
        logo_y = (height - pot_size) // 2 - 10
        
        # Soft golden glow behind logo
        glow_radius = 170
        glow = Image.new("RGBA", (glow_radius * 2, glow_radius * 2), (0, 0, 0, 0))
        glow_draw = ImageDraw.Draw(glow)
        for r in range(glow_radius, 0, -5):
            alpha = int(50 * (1 - r / glow_radius))
            glow_draw.ellipse([glow_radius - r, glow_radius - r, glow_radius + r, glow_radius + r], fill=(197, 160, 89, alpha))
        img.paste(glow, (logo_x + pot_size//2 - glow_radius, logo_y + pot_size//2 - glow_radius), glow)
        
        # Paste pot logo
        img.paste(pot, (logo_x, logo_y), pot)
        
    left_x = 90
    
    # 1. Category Pill
    pill_text = "NIGERIA'S AUTOMATED AJO PLATFORM"
    pill_bbox = draw.textbbox((0, 0), pill_text, font=font_pill)
    pw = (pill_bbox[2] - pill_bbox[0]) + 36
    ph = 38
    draw.rounded_rectangle([(left_x, 85), (left_x + pw, 85 + ph)], radius=19, fill=(197, 160, 89, 40), outline=(197, 160, 89, 130), width=1)
    draw.text((left_x + 18, 93), pill_text, font=font_pill, fill=(245, 220, 160, 255))
    
    # 2. Brand Name "Àjọṣe"
    # Draw "Àjọ" in white, "ṣe" in gold
    draw.text((left_x, 140), "Àjọ", font=font_title, fill=(255, 255, 255, 255))
    ajo_bbox = draw.textbbox((left_x, 140), "Àjọ", font=font_title)
    draw.text((ajo_bbox[2] + 4, 140), "ṣe", font=font_title, fill=gold)
    
    # 3. Motto
    draw.text((left_x, 248), "Turn by turn, no wahala.", font=font_tagline, fill=(243, 229, 200, 255))
    
    # 4. Value Propositions
    sub1 = "Run your Ajo. Track every round. Trust every naira."
    sub2 = "Automated Open-Banking Sweeps • Guaranteed Turn Payouts"
    draw.text((left_x, 310), sub1, font=font_subtitle, fill=(220, 235, 228, 255))
    draw.text((left_x, 350), sub2, font=font_subtitle, fill=(160, 185, 175, 255))
    
    # 5. Three Trust Badges at Bottom
    badges = [
        "100% Non-Custodial",
        "Mono Open-Banking",
        "Direct Bank-to-Bank"
    ]
    badge_x = left_x
    badge_y = 445
    for b_text in badges:
        bbox = draw.textbbox((0, 0), b_text, font=font_badge)
        bw = (bbox[2] - bbox[0]) + 38
        bh = 46
        draw.rounded_rectangle([(badge_x, badge_y), (badge_x + bw, badge_y + bh)], radius=14, fill=(14, 40, 30, 230), outline=(197, 160, 89, 80), width=1)
        # Gold Dot
        draw.ellipse([(badge_x + 14, badge_y + 19), (badge_x + 22, badge_y + 27)], fill=gold)
        draw.text((badge_x + 30, badge_y + 11), b_text, font=font_badge, fill=(240, 245, 242, 255))
        badge_x += bw + 18
            
    # Save optimized PNG
    output_path = "public/og-image.png"
    rgb_img = img.convert("RGB")
    rgb_img.save(output_path, "PNG", optimize=True)
    size_kb = os.path.getsize(output_path) / 1024
    print(f"Generated {output_path} ({size_kb:.1f} KB)")

if __name__ == "__main__":
    generate_og_image()
