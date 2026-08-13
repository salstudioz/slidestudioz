import os
import uuid
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Body, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

from src import database, config, llm_service, generator_service, ocr_service

app = FastAPI(
    title="SlideStudioZ REST API",
    description="Backend service for SlideStudioZ presentation & document generator.",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static file directories for generated outputs and assets
os.makedirs(config.OUTPUTS_DIR, exist_ok=True)
os.makedirs(config.ASSETS_DIR, exist_ok=True)
app.mount("/outputs", StaticFiles(directory=str(config.OUTPUTS_DIR)), name="outputs")
app.mount("/assets", StaticFiles(directory=str(config.ASSETS_DIR)), name="assets")

# --- Data Transfer Models ---

class CreateProjectPayload(BaseModel):
    topic: Optional[str] = None
    company_name: Optional[str] = "Enterprise Solutions"
    logo_path: Optional[str] = ""
    knowledge_base: Optional[str] = ""
    audience: Optional[str] = "C-Level Executives & VP"
    duration: Optional[Any] = 15
    purpose: Optional[str] = "Proposal"
    tone: Optional[str] = "Formal Enterprise"
    target_slides: Optional[int] = None
    name: Optional[str] = None
    input_type: Optional[str] = "prompt"
    raw_input: Optional[str] = None
    presenter: Optional[str] = "Solutions Specialist"
    language: Optional[str] = "Bahasa Indonesia"

class SlideItem(BaseModel):
    id: Optional[int] = None
    slide_number: Optional[int] = 1
    layout: Optional[str] = "content"
    layout_type: Optional[str] = "content"
    title: str = ""
    subtitle: Optional[str] = ""
    content: Any = []
    visual_request: Optional[str] = ""
    image_prompt: Optional[str] = ""
    image_path: Optional[str] = ""

class DraftPayload(BaseModel):
    slides: List[SlideItem]

# --- Helper Functions ---

def format_project_dict(p: Dict[str, Any]) -> Dict[str, Any]:
    if not p:
        return {}
    res = dict(p)
    res["topic"] = res.get("name", "") or res.get("raw_input", "")
    res["purpose"] = res.get("input_type", "Proposal")
    res["company_name"] = res.get("company_name") or "Enterprise Solutions"
    res["logo_path"] = res.get("logo_path") or ""
    if res.get("status") in ["generated", "approved"]:
        res["status"] = "completed"
    elif not res.get("status"):
        res["status"] = "draft"
    return res

def format_slide_dict(s: Dict[str, Any]) -> Dict[str, Any]:
    res = dict(s)
    res["layout"] = res.get("layout_type", "content")
    res["visual_request"] = res.get("image_prompt", "")
    
    raw_content = res.get("content", [])
    if isinstance(raw_content, str):
        try:
            parsed = json.loads(raw_content)
            res["content"] = parsed if isinstance(parsed, list) else [raw_content]
        except Exception:
            res["content"] = [line.strip() for line in raw_content.split("\n") if line.strip()]
    elif not isinstance(raw_content, list):
        res["content"] = [str(raw_content)]
        
    return res

# --- API Endpoints ---

@app.on_event("startup")
def startup_event():
    database.init_db()

@app.get("/api/health")
def health_check():
    return {"status": "ok", "app": "SlideStudioZ API Server", "version": "1.0.0"}

@app.get("/api/projects")
@app.get("/api/projects/")
def list_projects():
    """List all presentation projects."""
    raw_projects = database.list_projects()
    formatted = [format_project_dict(p) for p in raw_projects]
    return formatted

@app.post("/api/projects")
@app.post("/api/projects/")
def create_project(req: CreateProjectPayload):
    """Create a new presentation project."""
    project_id = f"proj_{uuid.uuid4().hex[:10]}"
    topic_name = req.topic.split("\n")[0][:60] if req.topic else (req.name or "Untitled Presentation")
    raw_text = req.raw_input or req.topic or ""
    slide_cnt = req.target_slides if (req.target_slides and req.target_slides > 0) else 8

    database.create_project(
        project_id=project_id,
        name=topic_name,
        company_name=req.company_name or "Enterprise Solutions",
        logo_path=req.logo_path or "",
        knowledge_base=req.knowledge_base or "",
        input_type=req.purpose or req.input_type or "prompt",
        raw_input=raw_text,
        slide_count=slide_cnt,
        duration=f"{req.duration} Menit" if isinstance(req.duration, int) else str(req.duration or "15 Menit"),
        presenter=req.presenter or "Solutions Specialist",
        audience=req.audience or "C-Level Executives & VP",
        language=req.language or "Bahasa Indonesia",
        tone=req.tone or "Formal Enterprise"
    )
    
    project = database.get_project(project_id)
    return format_project_dict(project)

@app.get("/api/projects/{project_id}")
def get_project_details(project_id: str):
    """Get project metadata and slides."""
    project = database.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    slides = database.get_slides(project_id)
    formatted_project = format_project_dict(project)
    formatted_slides = [format_slide_dict(s) for s in slides]
    
    return {
        "status": "success",
        "data": formatted_project,
        "project": formatted_project,
        "slides": formatted_slides
    }

@app.delete("/api/projects/{project_id}")
def delete_project(project_id: str):
    """Delete a presentation project."""
    project = database.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    database.delete_project(project_id)
    return {"status": "success", "message": f"Project {project_id} deleted"}

# --- Draft Routes ---

@app.post("/api/projects/{project_id}/draft")
@app.post("/api/projects/{project_id}/draft/regenerate")
def generate_or_regenerate_draft(project_id: str):
    """Generate or regenerate draft slides using OpenRouter LLM."""
    project = database.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    try:
        draft = llm_service.generate_presales_draft(
            raw_input=project.get("raw_input", ""),
            company_name=project.get("company_name", "Enterprise Solutions"),
            knowledge_base=project.get("knowledge_base", ""),
            slide_count=project.get("slide_count", 8),
            input_type=project.get("input_type", "prompt"),
            duration=project.get("duration", "15 Menit"),
            presenter=project.get("presenter", "Solutions Specialist"),
            audience=project.get("audience", "C-Level Executives & VP"),
            language=project.get("language", "Bahasa Indonesia"),
            tone=project.get("tone", "Formal Enterprise"),
            use_web_search=True,
            model=config.DEFAULT_MODEL
        )

        slides_data = draft.get("slides", [])
        
        standardized_slides = []
        for i, s in enumerate(slides_data, 1):
            standardized_slides.append({
                "slide_number": i,
                "layout_type": s.get("layout_type") or s.get("layout") or "content",
                "title": s.get("title", ""),
                "subtitle": s.get("subtitle", ""),
                "content": s.get("content", []),
                "image_prompt": s.get("image_prompt") or s.get("visual_request") or "",
                "image_path": s.get("image_path", "")
            })

        database.save_slides(project_id, standardized_slides)
        database.update_project_status(project_id, status="draft")

        slides = database.get_slides(project_id)
        formatted_slides = [format_slide_dict(s) for s in slides]

        return {
            "status": "success",
            "slides": formatted_slides,
            "data": {
                "slides": formatted_slides
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM Slide Draft Generation Failed: {str(e)}")

@app.get("/api/projects/{project_id}/draft")
def get_draft(project_id: str):
    """Get current draft slides for a project."""
    project = database.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    slides = database.get_slides(project_id)
    formatted_slides = [format_slide_dict(s) for s in slides]
    
    return {
        "status": "success",
        "slides": formatted_slides,
        "data": {
            "slides": formatted_slides
        }
    }

@app.put("/api/projects/{project_id}/draft")
@app.put("/api/projects/{project_id}/slides")
def update_draft(project_id: str, payload: DraftPayload):
    """Update draft slides."""
    project = database.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    slides_data = []
    for i, s in enumerate(payload.slides, 1):
        layout_str = s.layout or s.layout_type or "content"
        content_val = s.content
        if isinstance(content_val, str):
            content_val = [line.strip() for line in content_val.split("\n") if line.strip()]

        slides_data.append({
            "slide_number": i,
            "layout_type": layout_str,
            "title": s.title,
            "subtitle": s.subtitle or "",
            "content": content_val,
            "image_prompt": s.visual_request or s.image_prompt or "",
            "image_path": s.image_path or ""
        })

    database.save_slides(project_id, slides_data)
    database.update_project_status(project_id, status="draft")

    slides = database.get_slides(project_id)
    formatted_slides = [format_slide_dict(s) for s in slides]
    
    return {
        "status": "success",
        "slides": formatted_slides,
        "data": {
            "slides": formatted_slides
        }
    }

@app.post("/api/projects/{project_id}/generate")
def generate_final(project_id: str):
    """Generate final PPTX and PDF presentation files."""
    project = database.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    slides = database.get_slides(project_id)
    if not slides:
        raise HTTPException(status_code=400, detail="No slides found in project")

    formatted_slides = [format_slide_dict(s) for s in slides]

    try:
        export_res = generator_service.generate_presentation_and_pdf(
            project_name=project.get("name", "GetSlideZ_Presentation"),
            slides_data=formatted_slides,
            company_name=project.get("company_name", "Enterprise Solutions"),
            logo_path=project.get("logo_path")
        )

        pptx_path = export_res.get("pptx_path")
        pdf_path = export_res.get("pdf_path")

        database.update_project_status(
            project_id=project_id,
            status="completed",
            pptx_path=pptx_path,
            pdf_path=pdf_path
        )

        pptx_filename = os.path.basename(pptx_path) if pptx_path else ""
        pdf_filename = os.path.basename(pdf_path) if pdf_path else ""

        return {
            "status": "success",
            "message": "Presentation generated successfully",
            "data": {
                "pptx_filename": pptx_filename,
                "pdf_filename": pdf_filename,
                "pptx_download_url": f"/api/projects/{project_id}/download?format=pptx",
                "pdf_download_url": f"/api/projects/{project_id}/download?format=pdf"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")

@app.get("/api/projects/{project_id}/download")
def download_presentation(project_id: str, format: str = Query("pptx")):
    """Download generated PPTX or PDF file."""
    project = database.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    file_path = project.get("pdf_path") if format.lower() == "pdf" else project.get("pptx_path")
    
    if not file_path or not os.path.exists(file_path):
        clean_name = "".join(c for c in project.get("name", "") if c.isalnum() or c in (' ', '_', '-')).strip().replace(' ', '_')
        target_ext = ".pdf" if format.lower() == "pdf" else ".pptx"
        fallback_path = config.OUTPUTS_DIR / f"{clean_name}{target_ext}"
        if fallback_path.exists():
            file_path = str(fallback_path)
        else:
            raise HTTPException(status_code=404, detail=f"Generated {format.upper()} file not found for project.")

    media_type = "application/pdf" if format.lower() == "pdf" else "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    filename = os.path.basename(file_path)
    
    return FileResponse(path=file_path, filename=filename, media_type=media_type)

@app.post("/api/upload")
async def upload_document(file: UploadFile = File(...)):
    """Upload PDF/Image/DOCX/TXT file and extract text via OCR."""
    temp_dir = config.TEMP_UPLOADS_DIR
    os.makedirs(temp_dir, exist_ok=True)

    file_path = temp_dir / file.filename
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)

    try:
        extracted_text = ocr_service.extract_text_from_file(str(file_path))
        return {
            "status": "success",
            "filename": file.filename,
            "extracted_text": extracted_text
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process file OCR: {str(e)}")

@app.post("/api/upload-logo")
async def upload_logo(file: UploadFile = File(...)):
    """Upload custom company logo (PNG/JPG/WEBP)."""
    assets_dir = config.ASSETS_DIR
    os.makedirs(assets_dir, exist_ok=True)

    filename = f"custom_logo_{uuid.uuid4().hex[:8]}_{file.filename}"
    file_path = assets_dir / filename
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)

    return {
        "status": "success",
        "logo_path": str(file_path),
        "logo_url": f"/assets/{filename}"
    }

@app.post("/api/upload-knowledgebase")
async def upload_knowledgebase(file: UploadFile = File(...)):
    """Upload company knowledgebase file (.txt or .md) for baseline context."""
    if not (file.filename.endswith(".txt") or file.filename.endswith(".md")):
        raise HTTPException(status_code=400, detail="Standard knowledgebase files must be .txt or .md format.")
        
    try:
        content_bytes = await file.read()
        text_content = content_bytes.decode("utf-8", errors="ignore").strip()
        return {
            "status": "success",
            "filename": file.filename,
            "content": text_content
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read knowledgebase file: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="127.0.0.1", port=8000, reload=True)
