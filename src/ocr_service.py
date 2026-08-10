import os
import pytesseract
from PIL import Image, ImageEnhance
from src.config import DEFAULT_TESSERACT_PATHS

# Auto-configure pytesseract cmd path
for t_path in DEFAULT_TESSERACT_PATHS:
    if os.path.exists(t_path):
        pytesseract.pytesseract.tesseract_cmd = t_path
        break

def preprocess_image(image: Image.Image) -> Image.Image:
    """Preprocess image for better OCR accuracy."""
    try:
        gray = image.convert('L')
        enhancer = ImageEnhance.Contrast(gray)
        enhanced = enhancer.enhance(1.8)
        return enhanced
    except Exception:
        return image

def extract_text_from_image(image_path: str) -> str:
    """Extract text from an image file using Tesseract OCR."""
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image file not found: {image_path}")
    
    img = Image.open(image_path)
    processed_img = preprocess_image(img)
    
    try:
        text = pytesseract.image_to_string(processed_img, lang='ind+eng')
    except Exception:
        text = pytesseract.image_to_string(processed_img)
        
    return text.strip()

def extract_text_from_file(file_path: str) -> str:
    """Extract text from supported document/image files (PNG, JPG, WEBP, TXT, MD, PDF)."""
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")
    
    ext = os.path.splitext(file_path)[1].lower()
    
    if ext in ['.png', '.jpg', '.jpeg', '.webp', '.bmp', '.tiff', '.tif']:
        return extract_text_from_image(file_path)
    
    elif ext in ['.txt', '.md', '.log', '.csv', '.json']:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            return f.read().strip()
            
    elif ext == '.pdf':
        try:
            import fitz  # PyMuPDF
            doc = fitz.open(file_path)
            text_pages = [page.get_text() for page in doc]
            return "\n\n".join(text_pages).strip()
        except ImportError:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                return f.read().strip()
    else:
        raise ValueError(f"Unsupported file format: {ext}. Supported: PNG, JPG, WEBP, TXT, MD, PDF")
