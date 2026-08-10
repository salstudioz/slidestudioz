import os
from pathlib import Path
from dotenv import load_dotenv

# Base directory for GetSlideZ
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

APP_NAME = "SlideStudioZ"
APP_DESCRIPTION = "AI-Powered Executive Presentation & Document Generator"

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
DEFAULT_MODEL = os.getenv("OPENROUTER_MODEL", "openrouter/free")

# Available LLM Models on OpenRouter
LLM_MODELS = {
    "openrouter-auto-free": "openrouter/free",
    "gemma-4-26b-free": "google/gemma-4-26b-a4b-it:free",
    "gemma-4-31b-free": "google/gemma-4-31b-it:free"
}

# Tesseract Executable Paths
DEFAULT_TESSERACT_PATHS = [
    os.getenv("TESSERACT_CMD", r"D:\Tesseract-OCR\tesseract.exe"),
    r"D:\Tesseract-OCR\tesseract.exe",
    r"C:\Program Files\Tesseract-OCR\tesseract.exe",
    r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
]

# Assets & Storage Directories
ASSETS_DIR = BASE_DIR / "assets"
GENERATED_IMAGES_DIR = ASSETS_DIR / "generated_images"
OUTPUTS_DIR = BASE_DIR / "outputs"
TEMP_UPLOADS_DIR = BASE_DIR / "temp_uploads"
DB_PATH = BASE_DIR / "slidestudioz.db"

KNOWLEDGEBASE_PATH = BASE_DIR / "src" / "knowledgebase.md"
DEFAULT_LOGO_PATH = ASSETS_DIR / "slidestudioz_logo.png"

# Ensure directories exist
GENERATED_IMAGES_DIR.mkdir(parents=True, exist_ok=True)
OUTPUTS_DIR.mkdir(parents=True, exist_ok=True)
TEMP_UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
