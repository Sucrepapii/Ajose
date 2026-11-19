import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance

# Paths
brain_dir = r"C:\Users\icmas\.gemini\antigravity\brain\0143c250-4fe0-47e9-972c-42476a8f8a6d"
chess_bg_path = os.path.join(brain_dir, "ajose_mens_day_chess_bg_1795071901381.jpg")
editorial_bg_path = os.path.join(brain_dir, "ajose_international_mens_day_editorial_1795071908358.jpg")
logo_path = os.path.join("public", "ajose-rings-logo.png")

# Fonts
font_dir = r"C:\Windows\Fonts"
font_segoe_bold = os.path.join(font_dir, "segoeuib.ttf")
font_segoe_reg = os.path.join(font_dir, "segoeui.ttf")
font_arial_bold = os.path.join(font_dir, "arialbd.ttf")
font_arial_narrow_bold = os.path.join(font_dir, "ARIALNB.TTF")
font_georgia_bold = os.path.join(font_dir, "georgiab.ttf")

def create_pennant_badge(width=130, height=140):
    """Creates an elegant white pennant badge with Àjọṣe logo inside"""
    badge = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(badge)
    
    # Pennant polygon (flat top, inverted V bottom)
    chevron_indent = 22
    points = [
        (0, 0),
        (width, 0),
        (width, height - chevron_indent),
        (width // 2, height),
        (0, height - chevron_indent)
    ]
    draw.polygon(points, fill=(255, 255, 255, 245))
    
    # Border
    draw.polygon(points, outline=(212, 168, 67, 220), width=2)
    
    # Paste logo if exists
    if os.path.exists(logo_path):
        logo = Image.open(logo_path).convert("RGBA")
        logo_w = 64
        logo_h = int(logo.height * (logo_w / logo.width))
        logo = logo.resize((logo_w, logo_h), Image.Resampling.LANCZOS)
        badge.paste(logo, ((width - logo_w) // 2, 16), logo)
    
    # Text below logo
    try:
        font_badge = ImageFont.truetype(font_segoe_bold, 15)
        font_sub = ImageFont.truetype(font_segoe_reg, 10)
    except:
        font_badge = ImageFont.load_default()
        font_sub = ImageFont.load_default()
        
    text1 = "ÀJỌṢE"
    bbox1 = draw.textbbox((0, 0), text1, font=font_badge)
    tw1 = bbox1[2] - bbox1[0]
    draw.text(((width - tw1) // 2, 78), text1, font=font_badge, fill=(11, 48, 34, 255))
    
    text2 = "ajose.ng"
    bbox2 = draw.textbbox((0, 0), text2, font=font_sub)
    tw2 = bbox2[2] - bbox2[0]
    draw.text(((width - tw2) // 2, 98), text2, font=font_sub, fill=(11, 48, 34, 180))
    
    return badge

def generate_poster_1_chess():
    print("Generating Poster 1 (Chess King / Luxury Gold & Emerald)...")
    base = Image.open(chess_bg_path).convert("RGBA")
    w, h = base.size
    
    # Create dark gradient overlay on the left to ensure maximum text readability
    overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw_ov = ImageDraw.Draw(overlay)
    
    # Vignette / shadow gradient across left side
    for x in range(int(w * 0.70)):
        alpha = int(220 * (1.0 - (x / (w * 0.70)) ** 1.3))
        draw_ov.line([(x, 0), (x, h)], fill=(7, 24, 16, alpha))
        
    base = Image.alpha_composite(base, overlay)
    draw = ImageDraw.Draw(base)
    
    # Fonts
    f_h1 = ImageFont.truetype(font_segoe_bold, 36)
    f_h1_accent = ImageFont.truetype(font_segoe_bold, 48)
    f_sub = ImageFont.truetype(font_segoe_reg, 16)
    f_date = ImageFont.truetype(font_segoe_bold, 18)
    f_cat1 = ImageFont.truetype(font_segoe_bold, 24)
    f_cat2 = ImageFont.truetype(font_segoe_bold, 34)
    f_footer = ImageFont.truetype(font_segoe_reg, 13)
    
    start_x = 65
    start_y = 110
    
    # 1. Headline
    # Line 1
    draw.text((start_x, start_y), "EVEN IF NO ONE", font=f_h1, fill=(245, 245, 245, 255))
    
    # Line 2: MENTIONED IT,
    y2 = start_y + 46
    # Subtle dark shadow for 3D gold pop
    draw.text((start_x + 2, y2 + 2), "MENTIONED IT,", font=f_h1_accent, fill=(0, 0, 0, 200))
    draw.text((start_x, y2), "MENTIONED IT,", font=f_h1_accent, fill=(212, 168, 67, 255))
    
    # Line 3: YOU ARE THE ANCHOR.
    y3 = y2 + 58
    draw.text((start_x, y3), "YOU ARE THE ANCHOR.", font=f_h1, fill=(255, 255, 255, 255))
    
    # 2. Emotional Sub-message
    sub_lines = [
        "To the silent builders, the steady providers,",
        "and the men who show up for their families",
        "and circles without asking for applause."
    ]
    sub_y = y3 + 68
    for line in sub_lines:
        draw.text((start_x, sub_y), line, font=f_sub, fill=(216, 226, 220, 220))
        sub_y += 24
        
    # 3. Date & Occasion
    date_y = sub_y + 36
    draw.text((start_x, date_y), "NOVEMBER 19", font=f_date, fill=(212, 168, 67, 255))
    
    # Dotted separator line
    dot_y = date_y + 26
    dots = "•  •  •  •  •  •  •  •  •  •  •  •  •  •  •  •  •  •  •  •  •"
    draw.text((start_x, dot_y), dots, font=ImageFont.truetype(font_segoe_reg, 12), fill=(255, 255, 255, 120))
    
    # INTERNATIONAL
    int_y = dot_y + 22
    draw.text((start_x, int_y), "INTERNATIONAL", font=f_cat1, fill=(240, 240, 240, 240))
    
    # MEN'S DAY
    mens_y = int_y + 32
    draw.text((start_x, mens_y), "MEN'S DAY", font=f_cat2, fill=(255, 255, 255, 255))
    
    # 4. Top-Right Brand Pennant Badge
    pennant = create_pennant_badge(124, 136)
    base.paste(pennant, (w - 124 - 40, 0), pennant)
    
    # 5. Footer Line
    footer_text = "ÀJỌṢE  •  ajose.ng  •  Rotational Savings, Unshakable Trust"
    draw.text((start_x, h - 50), footer_text, font=f_footer, fill=(255, 255, 255, 140))
    
    out_path = os.path.join(brain_dir, "ajose_mens_day_poster_1_chess.png")
    base.convert("RGB").save(out_path, quality=98)
    print(f"Saved: {out_path}")
    return out_path

def generate_poster_2_editorial():
    print("Generating Poster 2 (Editorial Gentleman / Bold Graphic)...")
    base = Image.open(editorial_bg_path).convert("RGBA")
    w, h = base.size
    
    # Subtle darkening on the top-left area to maximize contrast for the big bold typography
    overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw_ov = ImageDraw.Draw(overlay)
    
    # Gradient overlay for top left quadrant
    for y in range(int(h * 0.65)):
        for x in range(int(w * 0.65)):
            dist = ((x / (w * 0.65))**2 + (y / (h * 0.65))**2)**0.5
            if dist < 1.0:
                alpha = int(190 * (1.0 - dist))
                draw_ov.point((x, y), fill=(5, 18, 12, alpha))
                
    base = Image.alpha_composite(base, overlay)
    draw = ImageDraw.Draw(base)
    
    # Heavy typography
    f_happy = ImageFont.truetype(font_segoe_bold, 32)
    f_inter = ImageFont.truetype(font_segoe_bold, 44)
    f_mens = ImageFont.truetype(font_arial_narrow_bold, 108)
    f_day = ImageFont.truetype(font_arial_narrow_bold, 108)
    f_sub = ImageFont.truetype(font_segoe_reg, 16)
    f_gold_tag = ImageFont.truetype(font_segoe_bold, 14)
    f_date = ImageFont.truetype(font_segoe_bold, 18)
    
    x = 65
    y = 80
    
    # Happy
    draw.text((x, y), "Happy", font=f_happy, fill=(235, 235, 235, 240))
    
    # International
    y += 42
    draw.text((x, y), "International", font=f_inter, fill=(255, 255, 255, 255))
    
    # MEN'S
    y += 54
    # Shadow
    draw.text((x + 3, y + 3), "Men's", font=f_mens, fill=(0, 0, 0, 200))
    draw.text((x, y), "Men's", font=f_mens, fill=(255, 255, 255, 255))
    
    # DAY
    y += 105
    draw.text((x + 3, y + 3), "Day", font=f_day, fill=(0, 0, 0, 200))
    draw.text((x, y), "Day", font=f_day, fill=(212, 168, 67, 255))
    
    # Narrative Quote
    sub_lines = [
        "To the quiet planners, disciplined builders,",
        "and men whose consistency speaks louder",
        "than any spoken word.",
        "",
        "Every turn you take builds the foundation.",
        "Today, we honor you."
    ]
    
    sub_y = y + 130
    for line in sub_lines:
        if line == "":
            sub_y += 10
            continue
        draw.text((x, sub_y), line, font=f_sub, fill=(225, 235, 230, 230))
        sub_y += 24
        
    # Bottom brand signature box
    box_y = h - 100
    if os.path.exists(logo_path):
        logo = Image.open(logo_path).convert("RGBA")
        logo_w = 44
        logo_h = int(logo.height * (logo_w / logo.width))
        logo = logo.resize((logo_w, logo_h), Image.Resampling.LANCZOS)
        base.paste(logo, (x, box_y), logo)
        
    draw.text((x + 56, box_y + 2), "ÀJỌṢE", font=ImageFont.truetype(font_segoe_bold, 18), fill=(255, 255, 255, 255))
    draw.text((x + 56, box_y + 24), "NOVEMBER 19  •  ajose.ng", font=ImageFont.truetype(font_segoe_reg, 13), fill=(212, 168, 67, 240))
    
    out_path = os.path.join(brain_dir, "ajose_mens_day_poster_2_editorial.png")
    base.convert("RGB").save(out_path, quality=98)
    print(f"Saved: {out_path}")
    return out_path

if __name__ == "__main__":
    generate_poster_1_chess()
    generate_poster_2_editorial()
    print("All posters generated successfully!")
