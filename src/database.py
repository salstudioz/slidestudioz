import sqlite3
import json
from datetime import datetime
from typing import List, Dict, Any, Optional
from src.config import DB_PATH

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    
    # Projects table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS projects (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            company_name TEXT DEFAULT 'Enterprise Solutions',
            logo_path TEXT DEFAULT '',
            knowledge_base TEXT DEFAULT '',
            input_type TEXT NOT NULL,
            raw_input TEXT NOT NULL,
            slide_count INTEGER DEFAULT 0,
            duration INTEGER DEFAULT 15,
            presenter TEXT DEFAULT 'Presales Specialist',
            audience TEXT DEFAULT 'Eksekutif',
            language TEXT DEFAULT 'id',
            tone TEXT DEFAULT 'formal',
            status TEXT DEFAULT 'draft',
            pptx_path TEXT,
            pdf_path TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Auto-migration for new columns
    cursor.execute("PRAGMA table_info(projects)")
    columns = [col[1] for col in cursor.fetchall()]
    if 'company_name' not in columns:
        cursor.execute("ALTER TABLE projects ADD COLUMN company_name TEXT DEFAULT 'Enterprise Solutions'")
    if 'logo_path' not in columns:
        cursor.execute("ALTER TABLE projects ADD COLUMN logo_path TEXT DEFAULT ''")
    if 'knowledge_base' not in columns:
        cursor.execute("ALTER TABLE projects ADD COLUMN knowledge_base TEXT DEFAULT ''")
    
    # Slides table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS slides (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id TEXT NOT NULL,
            slide_number INTEGER NOT NULL,
            layout_type TEXT NOT NULL, -- 'cover', 'divider', 'content', 'two_column', 'stats', 'cards', 'closing'
            title TEXT NOT NULL,
            subtitle TEXT,
            content TEXT,
            image_prompt TEXT,
            image_path TEXT,
            created_at TEXT NOT NULL,
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        )
    """)
    
    conn.commit()
    conn.close()

def create_project(
    project_id: str,
    name: str,
    input_type: str,
    raw_input: str,
    company_name: str = "Enterprise Solutions",
    logo_path: str = "",
    slide_count: int = 8,
    duration: str = "30 Menit",
    presenter: str = "Solutions Specialist",
    audience: str = "C-Level Executives & VP",
    language: str = "Bahasa Indonesia",
    tone: str = "Formal Enterprise"
) -> str:
    now = datetime.now().isoformat()
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO projects (id, name, company_name, logo_path, input_type, raw_input, slide_count, duration, presenter, audience, language, tone, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?)
    """, (project_id, name, company_name, logo_path, input_type, raw_input, slide_count, duration, presenter, audience, language, tone, now, now))
    conn.commit()
    conn.close()
    return project_id

def update_project_metadata(
    project_id: str,
    name: str,
    company_name: str,
    logo_path: str,
    duration: str,
    presenter: str,
    audience: str,
    language: str,
    tone: str,
    slide_count: int
):
    now = datetime.now().isoformat()
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE projects
        SET name = ?, company_name = ?, logo_path = ?, duration = ?, presenter = ?, audience = ?, language = ?, tone = ?, slide_count = ?, updated_at = ?
        WHERE id = ?
    """, (name, company_name, logo_path, duration, presenter, audience, language, tone, slide_count, now, project_id))
    conn.commit()
    conn.close()

def save_slides(project_id: str, slides_data: List[Dict[str, Any]]):
    now = datetime.now().isoformat()
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("DELETE FROM slides WHERE project_id = ?", (project_id,))
    
    for s in slides_data:
        content_str = json.dumps(s.get("content", [])) if isinstance(s.get("content"), (list, dict)) else str(s.get("content", ""))
        cursor.execute("""
            INSERT INTO slides (project_id, slide_number, layout_type, title, subtitle, content, image_prompt, image_path, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            project_id,
            s.get("slide_number", 1),
            s.get("layout_type", "content"),
            s.get("title", ""),
            s.get("subtitle", ""),
            content_str,
            s.get("image_prompt", ""),
            s.get("image_path", ""),
            now
        ))
    
    cursor.execute("UPDATE projects SET updated_at = ? WHERE id = ?", (now, project_id))
    conn.commit()
    conn.close()

def get_project(project_id: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM projects WHERE id = ?", (project_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return dict(row)
    return None

def list_projects() -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM projects ORDER BY datetime(updated_at) DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_slides(project_id: str) -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM slides WHERE project_id = ? ORDER BY slide_number ASC", (project_id,))
    rows = cursor.fetchall()
    conn.close()
    
    result = []
    for r in rows:
        d = dict(r)
        try:
            d["content"] = json.loads(d["content"]) if d["content"] else []
        except Exception:
            pass
        result.append(d)
    return result

def update_slide(slide_id: int, title: str, subtitle: str, content: Any, layout_type: str, image_prompt: str = "", image_path: str = ""):
    conn = get_connection()
    cursor = conn.cursor()
    content_str = json.dumps(content) if isinstance(content, (list, dict)) else str(content)
    
    cursor.execute("""
        UPDATE slides
        SET title = ?, subtitle = ?, content = ?, layout_type = ?, image_prompt = ?, image_path = ?
        WHERE id = ?
    """, (title, subtitle, content_str, layout_type, image_prompt, image_path, slide_id))
    
    conn.commit()
    conn.close()

def update_project_status(project_id: str, status: str, pptx_path: str = None, pdf_path: str = None):
    now = datetime.now().isoformat()
    conn = get_connection()
    cursor = conn.cursor()
    
    if pptx_path and pdf_path:
        cursor.execute("""
            UPDATE projects SET status = ?, pptx_path = ?, pdf_path = ?, updated_at = ? WHERE id = ?
        """, (status, pptx_path, pdf_path, now, project_id))
    else:
        cursor.execute("""
            UPDATE projects SET status = ?, updated_at = ? WHERE id = ?
        """, (status, now, project_id))
        
    conn.commit()
    conn.close()

def delete_project(project_id: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM slides WHERE project_id = ?", (project_id,))
    cursor.execute("DELETE FROM projects WHERE id = ?", (project_id,))
    conn.commit()
    conn.close()

# Auto-initialize database schema on module load
init_db()
