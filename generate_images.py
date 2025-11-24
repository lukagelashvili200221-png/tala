#!/usr/bin/env python3
"""
Gold Trading App - Image Generation Script
Generates 4 high-quality design images using PIL and design principles
"""

from PIL import Image, ImageDraw, ImageFilter
import math
import random
from pathlib import Path

# Output directory
OUTPUT_DIR = Path("client/public/assets")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

def create_hero_gradient_background():
    """
    Create a modern gradient background with gold/amber tones for hero section (1920x1080)
    """
    width, height = 1920, 1080
    image = Image.new('RGB', (width, height))
    pixels = image.load()
    
    # Create gradient from dark navy to gold
    for y in range(height):
        # Top: deep navy blue
        r1, g1, b1 = 15, 25, 50
        # Middle: gold/amber
        r2, g2, b2 = 184, 134, 11
        # Bottom: deeper gold
        r3, g3, b3 = 139, 90, 10
        
        ratio = y / height
        if ratio < 0.5:
            # Top half: navy to gold
            t = ratio * 2
            r = int(r1 * (1 - t) + r2 * t)
            g = int(g1 * (1 - t) + g2 * t)
            b = int(b1 * (1 - t) + b2 * t)
        else:
            # Bottom half: gold to deeper gold
            t = (ratio - 0.5) * 2
            r = int(r2 * (1 - t) + r3 * t)
            g = int(g2 * (1 - t) + g3 * t)
            b = int(b2 * (1 - t) + b3 * t)
        
        for x in range(width):
            # Add subtle horizontal variation
            variation = int(10 * math.sin(x / 300))
            pixels[x, y] = (
                max(0, min(255, r + variation)),
                max(0, min(255, g + variation)),
                max(0, min(255, b + variation))
            )
    
    # Add diagonal light rays/streaks for modern effect
    draw = ImageDraw.Draw(image, 'RGBA')
    for i in range(0, width, 200):
        points = [(i, 0), (i + 400, height)]
        draw.line(points, fill=(255, 255, 255, 15), width=3)
    
    image.save(OUTPUT_DIR / "hero_gradient_background.png")
    print("✓ Generated: hero_gradient_background.png")

def create_gold_pattern_mobile_background():
    """
    Create subtle geometric pattern with gold theme for mobile background (1080x1920)
    """
    width, height = 1080, 1920
    image = Image.new('RGB', (width, height), color=(20, 30, 60))
    draw = ImageDraw.Draw(image, 'RGBA')
    
    # Gold colors
    gold_light = (218, 165, 32, 40)
    gold_medium = (184, 134, 11, 50)
    gold_dark = (139, 90, 10, 60)
    
    # Create geometric hexagonal pattern
    hex_size = 80
    for row in range(0, height + hex_size * 2, hex_size * 2):
        offset = hex_size if (row // (hex_size * 2)) % 2 == 1 else 0
        for col in range(-hex_size, width + hex_size * 2, hex_size * 3):
            x = col + offset
            y = row
            
            # Draw hexagon
            angle_offset = random.choice([0, 60, 120])
            points = []
            for i in range(6):
                angle = (i * 60 + angle_offset) * math.pi / 180
                px = x + hex_size * math.cos(angle)
                py = y + hex_size * math.sin(angle)
                points.append((px, py))
            
            color = random.choice([gold_light, gold_medium, gold_dark])
            draw.polygon(points, fill=color)
    
    # Add subtle vertical gradient overlay
    overlay = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    overlay_draw = ImageDraw.Draw(overlay)
    for y in range(height):
        alpha = int(100 * (1 - (y / height)))
        overlay_draw.line([(0, y), (width, y)], fill=(0, 0, 0, alpha // 10))
    
    image.paste(overlay, (0, 0), overlay)
    image.save(OUTPUT_DIR / "gold_pattern_mobile_background.png")
    print("✓ Generated: gold_pattern_mobile_background.png")

def create_lucky_wheel_centerpiece_icon():
    """
    Create modern decorative icon for lucky wheel center (500x500)
    """
    size = 500
    image = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    
    center = (size // 2, size // 2)
    
    # Outer circle with gradient effect (gold)
    outer_radius = 230
    for r in range(outer_radius, 0, -5):
        alpha = int(255 * (1 - r / outer_radius) * 0.8)
        color = (218, 165, 32, alpha)
        draw.ellipse(
            [center[0] - r, center[1] - r, center[0] + r, center[1] + r],
            outline=color,
            width=3
        )
    
    # Inner circle (darker gold)
    draw.ellipse(
        [center[0] - 100, center[1] - 100, center[0] + 100, center[1] + 100],
        fill=(184, 134, 11, 255),
        outline=(218, 165, 32, 255),
        width=3
    )
    
    # Star pattern in center
    star_points = []
    for i in range(10):
        angle = (i * 36) * math.pi / 180
        if i % 2 == 0:
            radius = 40
        else:
            radius = 20
        x = center[0] + radius * math.cos(angle - math.pi / 2)
        y = center[1] + radius * math.sin(angle - math.pi / 2)
        star_points.append((x, y))
    
    draw.polygon(star_points, fill=(255, 255, 255, 255), outline=(218, 165, 32, 255))
    
    # Decorative rings
    for ring_radius in [150, 170, 190]:
        draw.ellipse(
            [center[0] - ring_radius, center[1] - ring_radius,
             center[0] + ring_radius, center[1] + ring_radius],
            outline=(218, 165, 32, 150),
            width=2
        )
    
    image.save(OUTPUT_DIR / "lucky_wheel_centerpiece_icon.png")
    print("✓ Generated: lucky_wheel_centerpiece_icon.png")

def create_success_celebration_graphic():
    """
    Create celebration/success graphic with confetti and modern design (800x600)
    """
    width, height = 800, 600
    image = Image.new('RGBA', (width, height), (255, 255, 255, 0))
    draw = ImageDraw.Draw(image)
    
    # Gradient background
    for y in range(height):
        ratio = y / height
        r = int(20 + (50 * ratio))
        g = int(35 + (80 * ratio))
        b = int(70 + (100 * ratio))
        draw.line([(0, y), (width, y)], fill=(r, g, b, 255))
    
    # Central success circle with shine
    center = (width // 2, height // 2)
    
    # Outer glow
    for r in range(150, 50, -10):
        alpha = int(255 * (1 - (r - 50) / 100) * 0.3)
        draw.ellipse(
            [center[0] - r, center[1] - r, center[0] + r, center[1] + r],
            outline=(218, 165, 32, alpha),
            width=2
        )
    
    # Main success circle
    draw.ellipse(
        [center[0] - 80, center[1] - 80, center[0] + 80, center[1] + 80],
        fill=(76, 175, 80, 255),
        outline=(218, 165, 32, 255),
        width=4
    )
    
    # Checkmark
    check_points = [
        (center[0] - 30, center[1] + 10),
        (center[0] - 5, center[1] + 35),
        (center[0] + 40, center[1] - 20),
    ]
    draw.line(check_points, fill=(255, 255, 255, 255), width=6)
    
    # Confetti pieces
    random.seed(42)
    for _ in range(100):
        x = random.randint(0, width)
        y = random.randint(0, height)
        size = random.randint(5, 15)
        angle = random.choice([0, 45, 90, 135])
        
        colors = [
            (218, 165, 32, 200),  # Gold
            (255, 193, 7, 200),   # Amber
            (255, 235, 59, 200),  # Yellow
            (76, 175, 80, 200),   # Green
        ]
        color = random.choice(colors)
        
        if angle == 0:
            draw.rectangle([x, y, x + size, y + size], fill=color)
        elif angle == 45:
            draw.ellipse([x, y, x + size, y + size], fill=color)
        else:
            draw.polygon([
                (x, y),
                (x + size, y),
                (x + size // 2, y + size)
            ], fill=color)
    
    image.save(OUTPUT_DIR / "success_celebration_graphic.png")
    print("✓ Generated: success_celebration_graphic.png")

def main():
    print("🎨 Generating Gold Trading App Images...\n")
    
    try:
        create_hero_gradient_background()
        create_gold_pattern_mobile_background()
        create_lucky_wheel_centerpiece_icon()
        create_success_celebration_graphic()
        
        print("\n✅ All images generated successfully!")
        print(f"\n📁 Images saved to: {OUTPUT_DIR.absolute()}")
        print("\nGenerated files:")
        for file in sorted(OUTPUT_DIR.glob("*.png")):
            print(f"  • {file.name}")
    except Exception as e:
        print(f"❌ Error: {e}")
        raise

if __name__ == "__main__":
    main()
