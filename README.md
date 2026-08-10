# SlideStudioZ 🚀
> **AI-Powered Executive Presentation Deck & Document Generator**  
> *Transform prompts, proposal briefs, company knowledgebase files (.txt/.md), and document files (PDF/Images) into widescreen PowerPoint (`.pptx`) and PDF (`.pdf`) presentations with custom corporate branding.*

---

## 🌟 Overview

**SlideStudioZ** is a modern, full-stack AI presentation generator designed to craft executive-ready slide decks in seconds. It supports custom **Company/Instansi Branding**, **Company Knowledgebase Upload (.txt/.md)**, **Custom Logo Uploads**, **Live Web Search Grounding**, and **Document OCR Extraction**.

You can run SlideStudioZ using either:
1. **Modern React Web Studio (Web App)**: Interactive slide preview canvas, real-time editing, drag-and-drop document OCR file upload, knowledgebase uploader, and custom logo manager.
2. **Interactive Terminal CLI (Console App)**: Fast, keyboard-driven terminal dashboard built with Python `rich`.

---

## ✨ Key Features

- 💡 **Dual Generation Modes**:
  - **Prompt Mode**: Write a short topic description, company name, presenter details, and audience parameters.
  - **Document OCR Mode**: Upload PDF reports, Word documents, text files, or image screenshots. SlideStudioZ automatically extracts text via PyTesseract OCR / PyMuPDF and parses every section into structured slides.
- 📚 **Company Knowledgebase Grounding (.txt / .md)**:
  - Upload or paste baseline company context (company background, product specs, mission, figures).
  - The AI generator grounds all slide outlines directly on your company's factual baseline knowledge.
- 🎨 **Dynamic Corporate Branding & Logo Upload**:
  - Customize **Company/Instansi Name**, **Presenter Name**, **Target Audience**, **Duration**, **Language**, and **Tone**.
  - Upload custom company logo files (PNG/JPG/WEBP) or rely on default branding. Logotypes and headers dynamically adapt on every generated slide.
- 🤖 **Universal LLM Engine**:
  - Powered by **OpenRouter API** (Google Gemma 4, DeepSeek, Claude, Llama models).
  - Grounded with live factual web search results via **DuckDuckGo Search API (`DDGS`)**.
  - Real-time device clock synchronization for accurate temporal context.
- 🖼️ **AI Visual Generation**:
  - Automatically generates 3D corporate visual illustrations for slides using Pollinations.ai API.
  - Applies smooth antialiased rounded corners via Pillow (PIL).
- 📊 **7 Enterprise Slide Layouts**:
  - `cover`: Hero title, subtitle, presenter, audience, & logo header.
  - `divider`: Section overview transition.
  - `content`: Clean bullet points with dynamic scaling.
  - `two_column`: Comparison & capability grid.
  - `stats`: Key KPI & big number callouts.
  - `cards`: Solution module cards.
  - `closing`: Contact CTA & book demo slide.
- 📥 **Precision Exporting**:
  - Generates 16:9 Widescreen `.pptx` (Microsoft PowerPoint) files with exact text margin padding.
  - Automatic conversion to `.pdf` via Windows PowerPoint COM Automation (`win32com`) or ReportLab engine.

---

## 📁 Repository Structure

```
final/
├── main.py                     # Entry point for SlideStudioZ Interactive CLI UI
├── server.py                   # FastAPI REST Backend server
├── run_app.py                  # Launcher for FastAPI Backend + React Frontend
├── requirements.txt            # Python dependencies
├── .env.example                # Template for OPENROUTER_API_KEY and configs
├── .gitignore                  # Git ignore rules
├── README.md                   # Repository documentation
├── assets/                     # Default branding assets & custom logos
│   ├── slidestudioz_logo.png   # Default SlideStudioZ branding logo
│   └── generated_images/       # Generated slide AI image assets
├── outputs/                    # Output directory for PPTX & PDF files
├── temp_uploads/               # Temporary file uploads directory
├── src/                        # Core Python service modules
│   ├── config.py               # Application configuration & paths
│   ├── database.py             # SQLite database layer (Projects & Slides)
│   ├── llm_service.py          # LLM prompt engine & document section parser
│   ├── generator_service.py    # PowerPoint (.pptx) & PDF renderer
│   ├── ocr_service.py          # Tesseract OCR & PDF text extractor
│   ├── image_service.py        # Pollinations.ai image generator with rounded corners
│   ├── web_search_service.py   # DuckDuckGo search integration
│   ├── cli_ui.py               # Rich CLI interface
│   └── knowledgebase.md        # Presentation design guidelines & knowledge base
└── frontend/                   # React 18 + Vite SPA Application
    ├── package.json            # Node.js dependencies
    ├── vite.config.js          # Vite config
    ├── index.html              # Web entry HTML
    └── src/                    # React components & pages
```

---

## 🛠️ Prerequisites

Before running SlideStudioZ, ensure you have installed:
1. **Python 3.10+**
2. **Node.js 18+ & npm**
3. **Tesseract OCR Binary** *(Optional for image OCR extraction)*:
   - Download Tesseract OCR for Windows (e.g. `C:\Program Files\Tesseract-OCR\tesseract.exe` or `D:\Tesseract-OCR\tesseract.exe`).
4. **OpenRouter API Key**:
   - Get a key from [OpenRouter.ai](https://openrouter.ai/).

---

## 🚀 Quick Start Guide

### 1. Environment Configuration

Clone the repository and set up environment variables:

```bash
# Copy template environment file
cp .env.example .env
```

Edit `.env` and paste your `OPENROUTER_API_KEY`:

```env
OPENROUTER_API_KEY=sk-or-v1-your-api-key-here
OPENROUTER_MODEL=openrouter/free
TESSERACT_CMD=D:\Tesseract-OCR\tesseract.exe
```

### 2. Install Dependencies

**Python Backend:**
```bash
pip install -r requirements.txt
```

**React Frontend:**
```bash
cd frontend
npm install
cd ..
```

---

## 🖥️ Running SlideStudioZ

### Option A: Web Application (React + FastAPI)

Run the dual launcher script:

```bash
python run_app.py
```

This will automatically:
- Start the FastAPI Backend on `http://127.0.0.1:8000`
- Start the React Vite Frontend on `http://localhost:5173`
- Open your default web browser to `http://localhost:5173`

### Option B: Interactive Terminal CLI

Run the terminal app directly:

```bash
python main.py
```

---

## 📡 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status check |
| `GET` | `/api/projects` | List all presentation projects |
| `POST` | `/api/projects` | Create a new presentation project |
| `GET` | `/api/projects/{id}` | Get project details & slide items |
| `DELETE` | `/api/projects/{id}` | Delete a project and its slides |
| `POST` | `/api/projects/{id}/draft` | Generate/regenerate slide draft via LLM |
| `PUT` | `/api/projects/{id}/draft` | Update slide content / order |
| `POST` | `/api/projects/{id}/generate` | Export deck to `.pptx` and `.pdf` |
| `GET` | `/api/projects/{id}/download` | Download generated `.pptx` or `.pdf` file |
| `POST` | `/api/upload` | Extract text from PDF/Images via OCR |
| `POST` | `/api/upload-logo` | Upload custom corporate logo (PNG/JPG/WEBP) |
| `POST` | `/api/upload-knowledgebase` | Upload company baseline knowledge file (.txt/.md) |

---

## 📄 License

Distributed under the **MIT License**. Free for commercial and non-commercial use.
