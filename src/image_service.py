import os
import time
import urllib.parse
import requests
from PIL import Image, ImageDraw
from src.config import GENERATED_IMAGES_DIR

def apply_rounded_corners(image_path: str, corner_radius: int = 28) -> str:
    """Applies smooth antialiased rounded corners to an image file."""
    try:
        img = Image.open(image_path).convert("RGBA")
        width, height = img.size

        scale = 2
        mask_size = (width * scale, height * scale)
        mask = Image.new("L", mask_size, 0)
        draw = ImageDraw.Draw(mask)
        draw.rounded_rectangle((0, 0, mask_size[0], mask_size[1]), radius=corner_radius * scale, fill=255)
        
        mask = mask.resize((width, height), Image.Resampling.LANCZOS)

        rounded = Image.new("RGBA", (width, height), (0, 0, 0, 0))
        rounded.paste(img, (0, 0), mask)
        rounded.save(image_path, "PNG")
        return image_path
    except Exception as e:
        print(f"[Image Gen Warning]: Failed to apply rounded corners ({e})")
        return image_path

def generate_slide_image(prompt: str, filename: str = None, corner_radius: int = 28) -> str:
    """Generate image via Pollinations.ai, save locally, and apply rounded corners."""
    if not prompt or not prompt.strip():
        return ""
    
    full_prompt = f"Professional enterprise presentation graphic, clean 3D corporate style, high tech, blue tint: {prompt.strip()}"
    encoded_prompt = urllib.parse.quote(full_prompt)
    
    if not filename:
        filename = f"slide_img_{int(time.time() * 1000)}.png"
    if not filename.endswith((".png", ".jpg", ".jpeg", ".webp")):
        filename += ".png"
        
    output_path = GENERATED_IMAGES_DIR / filename
    
    models = ["flux", "turbo"]
    for model in models:
        url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?model={model}&width=1024&height=576&nologo=true"
        try:
            r = requests.get(url, timeout=45)
            if r.status_code == 200 and len(r.content) > 1000:
                with open(output_path, "wb") as f:
                    f.write(r.content)
                apply_rounded_corners(str(output_path), corner_radius=corner_radius)
                return str(output_path)
        except Exception as e:
            print(f"[Image Gen Warning]: {e} on model {model}")
            continue
            
    print("[Image Gen]: Could not generate image from pollinations.ai.")
    return ""
