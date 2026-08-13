import json
import re
from datetime import datetime
from typing import Dict, Any, List, Optional
from openai import OpenAI
from src.config import OPENROUTER_API_KEY, DEFAULT_MODEL, KNOWLEDGEBASE_PATH
from src.web_search_service import search_and_format_context

def load_knowledgebase() -> str:
    """Membaca isi file knowledgebase.md secara otomatis untuk diinjeksikan sebagai acuan ke LLM."""
    try:
        if KNOWLEDGEBASE_PATH.exists():
            with open(KNOWLEDGEBASE_PATH, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read().strip()
                if content:
                    return f"BASIS PENGETAHUAN & ATURAN PRESENTASI (KNOWLEDGE BASE):\n{content}"
    except Exception as e:
        print(f"[KnowledgeBase Warning]: Gagal membaca knowledgebase.md ({e})")
    return ""

def get_device_time_context() -> str:
    """Mendapatkan konteks tanggal dan waktu sistem device saat ini."""
    now = datetime.now()
    return (
        f"KONTEKS WAKTU DEVICE SAAT INI:\n"
        f"- Tanggal & Waktu Lokal Device : {now.strftime('%d-%m-%Y %H:%M:%S')}\n"
        f"- Tahun Berjalan               : {now.year}\n"
        f"- Catatan Ref Waktu            : Waktu di atas diambil secara real-time dari device pengguna. Gunakan tahun {now.year} sebagai acuan waktu saat ini."
    )

def get_openrouter_client() -> OpenAI:
    if not OPENROUTER_API_KEY:
        raise ValueError("OPENROUTER_API_KEY is not set.")
    return OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=OPENROUTER_API_KEY,
        timeout=15.0,
        default_headers={
            "HTTP-Referer": "https://slidestudioz.ai",
            "X-Title": "SlideStudioZ Presentation Generator"
        }
    )

SYSTEM_PROMPT = """Anda adalah Senior Executive Presentation Architect & Solution Strategist untuk SlideStudioZ.
Tugas Anda adalah menghasilkan materi presentasi profesional kelas dunia yang berdampak tinggi, akurat, dan dirancang khusus sesuai profil perusahaan/instansi yang ditentukan.

PRINSIP UTAMA PENYUSUNAN PRESENTASI:
1. PENYESUAIAN PROFIL PERUSAHAAN/INSTANSI: Sesuaikan isi presentasi dengan Nama Perusahaan/Instansi yang diberikan oleh pengguna.
2. KELENGKAPAN SEKSI (COMPREHENSIVE COVERAGE): Jika dokumen/PDF input memiliki seksi/slide bernomor, Anda WAJIB membuat slide untuk SETIAP SEKSI tersebut tanpa memotong, melewatkan, atau menghilangkan topik penting apapun!
3. KESUAIAN ISI DOKUMEN: Gunakan data, poin-poin, istilah teknis, dan judul spesifik yang ada pada dokumen input secara akurat.
4. CLARITY FIRST: Maksimal 5 bullet points per slide. Setiap slide berfokus pada 1 ide utama yang jelas.
5. TRUST BY PROOF: Sertakan data, angka konkret, dan bukti keunggulan dari dokumen atau topik input.

METADATA PRESENTASI YANG DIGUNAKAN:
- NAMA PERUSAHAAN / INSTANSI
- WAKTU PRESENTASI
- PRESENTER
- TARGET AUDIENCE
- BAHASA
- GAYA BAHASA / TONE

PILIHAN LAYOUT PER SLIDE:
- "cover": Slide Judul Utama (Hero Title, Subtitle, Presenter & Audience info)
- "divider": Slide Transisi Section (Judul Section & Overview ringkas)
- "content": Slide Title + Bullet Points utama (Maksimal 5 bullet)
- "two_column": Slide Komparasi / Fitur 2 kolom
- "stats": Slide KPI / Big Numbers (data statistik, perbandingan angka)
- "cards": Slide Fitur Utama / Solution Cards
- "closing": Slide Call-to-Action & Kontak Presenter

FORMAT OUTPUT HARUS PASTI VALID JSON (Tanpa teks lain di luar JSON):
{
  "presentation_title": "Judul Presentasi Utama",
  "presentation_subtitle": "Sub-judul / Tagline Presentasi",
  "slides": [
    {
      "slide_number": 1,
      "layout_type": "cover",
      "title": "Judul Slide 1",
      "subtitle": "Subtitle Slide 1",
      "content": ["Poin 1", "Poin 2"],
      "image_prompt": "Prompt visual gambar latar/teknologi profesional (dalam Bahasa Inggris)"
    }
  ]
}
"""

def clean_json_response(response_text: str) -> str:
    """Extract JSON string from LLM response text."""
    response_text = response_text.strip()
    match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", response_text)
    if match:
        return match.group(1).strip()
    return response_text

def parse_sections_from_text(raw_input: str) -> List[Dict[str, Any]]:
    """Smartly parse sections, headings, and bullet points from uploaded text/PDF."""
    if not raw_input or not raw_input.strip():
        return []

    split_pattern = r'\n(?=\d{2}\s*-\s*|\d{1,2}\.\s+|[Ss]ection\s+\d+|[Ss]lide\s+\d+)'
    raw_sections = re.split(split_pattern, raw_input.strip())
    
    if len(raw_sections) <= 1:
        raw_sections = [block for block in raw_input.split("\n\n") if block.strip()]

    parsed_sections = []
    
    for idx, sec in enumerate(raw_sections, 1):
        sec_clean = sec.strip()
        if not sec_clean:
            continue
            
        lines = [line.strip() for line in sec_clean.split("\n") if line.strip()]
        if not lines:
            continue

        first_line = lines[0]
        title = re.sub(r'^(?:\d{2}\s*-\s*|\d{1,2}\.\s*|[Ss]ection\s+\d+:?\s*)', '', first_line).strip()
        if not title:
            title = f"Section {idx}"

        subtitle = ""
        bullets = []

        for line in lines[1:]:
            clean_line = re.sub(r'^[•●\-\*\d+\.\)]\s*', '', line).strip()
            if not clean_line:
                continue

            if not subtitle and not line.startswith(('•', '●', '-', '*')) and len(clean_line) < 120:
                subtitle = clean_line
            else:
                if clean_line not in bullets and clean_line != title and clean_line != subtitle:
                    bullets.append(clean_line)

        title_lower = title.lower()
        if "closing" in title_lower or "thank" in title_lower or (idx == len(raw_sections) and "contact" in title_lower):
            layout_type = "closing"
        elif "overview" in title_lower or "challenge" in title_lower or "vision" in title_lower:
            layout_type = "divider" if idx <= 2 else "content"
        elif any(char.isdigit() for char in sec_clean) and any(kw in sec_clean.lower() for kw in ["%", "kpi", "scale", "stat", "uptime", "metric", "increased"]):
            layout_type = "stats"
        elif len(bullets) >= 3 and any(":" in b for b in bullets[:3]):
            layout_type = "cards"
        else:
            layout_type = "content"

        parsed_sections.append({
            "slide_number": idx,
            "layout_type": layout_type,
            "title": title,
            "subtitle": subtitle or f"Rincian operasional untuk {title}",
            "content": bullets[:5] if bullets else [subtitle or f"Informasi utama mengenai {title}"],
            "image_prompt": f"Professional clean enterprise presentation illustration for {title}"
        })

    return parsed_sections

def generate_presales_draft(
    raw_input: str,
    company_name: str = "Enterprise Solutions",
    knowledge_base: str = "",
    slide_count: int = 8,
    input_type: str = "prompt",
    duration: str = "30 Menit",
    presenter: str = "Solutions Specialist",
    audience: str = "C-Level Executives & VP",
    language: str = "Bahasa Indonesia",
    tone: str = "Formal Enterprise",
    use_web_search: bool = True,
    model: str = DEFAULT_MODEL
) -> Dict[str, Any]:
    """Generate structured presentation slide draft via OpenRouter LLM with metadata & grounding context."""
    detected_sections = parse_sections_from_text(raw_input) if input_type == "upload" else []
    
    if detected_sections and len(detected_sections) > 3:
        if not slide_count or slide_count <= 0 or slide_count == 8:
            slide_count = len(detected_sections)
            
    if not slide_count or slide_count <= 0:
        slide_count = len(detected_sections) if detected_sections else 8
        slide_instruction = f"Susunlah slide secara komprehensif meng-cover seluruh {slide_count} seksi dokumen."
    else:
        slide_instruction = f"Susunlah slide sebanyak PERSIS {slide_count} slide dan pastikan SEMUA seksi dari dokumen ter-cover."

    try:
        client = get_openrouter_client()
    except Exception as e:
        print(f"[LLM Notice]: OpenRouter client not initialized ({e}). Using fallback section parser.")
        return generate_fallback_draft(raw_input, company_name, slide_count, duration, presenter, audience, language, tone, detected_sections)

    search_context = ""
    if use_web_search and raw_input:
        search_query = f"{company_name} {raw_input[:60]}"
        search_context, _ = search_and_format_context(search_query, max_results=3)

    device_time_info = get_device_time_context()

    kb_company_section = f"\n[KNOWLEDGE BASE PERUSAHAAN / INSTANSI (Informasi Dasar/Produk/Profil)]:\n{knowledge_base}\n" if knowledge_base and knowledge_base.strip() else ""

    user_message = f"""Buatkan draft presentasi eksekutif profesional untuk {company_name}. {slide_instruction}

[METADATA PRESENTASI & DEVICE TIME]:
{device_time_info}
- Nama Perusahaan / Instansi : {company_name}
- Waktu Presentasi          : {duration}
- Presenter                 : {presenter}
- Target Audience           : {audience}
- Bahasa                    : {language}
- Gaya Bahasa / Tone        : {tone}
- Input Type                : {input_type.upper()}
{kb_company_section}
{search_context}

[DOKUMEN / PROMPT INPUT]:
{raw_input}

INSTRUKSI KHUSUS:
- Gunakan fakta, layanan, produk, dan profil instansi dari Knowledge Base Perusahaan (jika ada) sebagai acuan dasar materi.
- Baca seluruh seksi dari dokumen input di atas secara cermat.
- Pastikan SETIAP SEKSI dibuatkan slidenya tanpa ada seksi penting yang ditinggalkan!
- Sesuaikan narasi slide agar selaras dengan nama perusahaan/instansi: {company_name}.
- Kembalikan HANYA format JSON persis sesuai spesifikasi instruksi."""

    raw_candidates = [
        model,
        "openrouter/free",
        "google/gemma-4-26b-a4b-it:free",
        "google/gemma-4-31b-it:free"
    ]
    candidate_models = list(dict.fromkeys([m for m in raw_candidates if m]))
    
    kb_info = load_knowledgebase()
    full_system_prompt = f"{SYSTEM_PROMPT}\n\n{kb_info}\n\n{device_time_info}" if kb_info else f"{SYSTEM_PROMPT}\n\n{device_time_info}"

    for candidate in candidate_models:
        try:
            response = client.chat.completions.create(
                model=candidate,
                messages=[
                    {"role": "system", "content": full_system_prompt},
                    {"role": "user", "content": user_message}
                ],
                temperature=0.7,
                max_tokens=4000
            )
            content = response.choices[0].message.content or ""
            json_str = clean_json_response(content)
            data = json.loads(json_str)
            if data and "slides" in data and len(data["slides"]) > 0:
                return data
        except Exception as e:
            print(f"[LLM Warning]: Candidate model {candidate} notice ({e}). Trying next fallback...")
            continue

    print("[LLM Info]: Using document-driven section parser engine.")
    return generate_fallback_draft(raw_input, company_name, slide_count, duration, presenter, audience, language, tone, detected_sections)

def generate_fallback_draft(
    raw_input: str,
    company_name: str = "Enterprise Solutions",
    slide_count: int = 8,
    duration: str = "30 Menit",
    presenter: str = "Solutions Specialist",
    audience: str = "C-Level Executives & VP",
    language: str = "Bahasa Indonesia",
    tone: str = "Formal Enterprise",
    preparsed_sections: Optional[List[Dict[str, Any]]] = None
) -> Dict[str, Any]:
    """Generate structured draft directly parsing uploaded document sections."""
    sections = preparsed_sections or parse_sections_from_text(raw_input)
    
    if sections and len(sections) > 0:
        slides = []
        for i, sec in enumerate(sections, 1):
            sec["slide_number"] = i
            slides.append(sec)
            
        doc_title = sections[0]["title"] if sections else "Executive Presentation"
        return {
            "presentation_title": f"{company_name} - {doc_title}",
            "presentation_subtitle": f"Presentasi Eksekutif ({duration}) • Target: {audience}",
            "slides": slides
        }

    topic = raw_input[:40].replace('\n', ' ') if raw_input else "Strategi & Solusi Enterprise"
    slides = []
    
    slides.append({
        "slide_number": 1,
        "layout_type": "cover",
        "title": f"{company_name} - {topic}",
        "subtitle": f"Presentasi Strategis ({duration}) • Target: {audience}",
        "content": [f"Presenter: {presenter}", f"Perusahaan: {company_name}", f"Bahasa: {language}"],
        "image_prompt": "Clean professional corporate digital workspace, white theme with light blue accents"
    })
    
    if slide_count > 1:
        slides.append({
            "slide_number": 2,
            "layout_type": "divider",
            "title": "Ringkasan Eksekutif & Tantangan Utama",
            "subtitle": f"Gambaran strategis mengenai peluang dan tantangan operasional ({duration}).",
            "content": ["Tantangan Operasional Utama", "Pendekatan Solusi Terpadu"],
            "image_prompt": "Executive business dashboard clean light background"
        })
        
    if slide_count > 2:
        slides.append({
            "slide_number": 3,
            "layout_type": "stats",
            "title": "Dampak & Pencapaian Terukur",
            "subtitle": "Metrik keberhasilan dan efisiensi operasional",
            "content": [
                "10x Efisiensi Workflow Alur Kerja",
                "99.9% Reliabilitas System Uptime",
                "50% Penghematan Biaya Operasional"
            ],
            "image_prompt": "Clean corporate growth chart data visualization"
        })

    if slide_count > 3:
        slides.append({
            "slide_number": 4,
            "layout_type": "cards",
            "title": "Pilar Utama Solusi",
            "subtitle": "Solusi terpadu untuk kebutuhan enterprise",
            "content": [
                "Otomatisasi Alur Kerja: Efisiensi tinggi pada tugas berulang.",
                "Integrasi Sistem: Konektivitas cepat ke infrastruktur eksisting.",
                "Keamanan & Kepatuhan: Perlindungan data tingkat enterprise."
            ],
            "image_prompt": "Modern enterprise software interface cards"
        })
        
    for i in range(len(slides) + 1, slide_count):
        slides.append({
            "slide_number": i,
            "layout_type": "content" if i % 2 == 0 else "two_column",
            "title": f"Fokus Solusi: Modul {i - 3}",
            "subtitle": f"Implementasi spesifik untuk kebutuhan {topic}",
            "content": [
                f"Penerapan fitur unggulan {company_name} untuk {topic}",
                "Standar keamanan tinggi dengan akses kontrol berbasis peran",
                "Integrasi langsung ke ekosistem operasional",
                "Peningkatan produktivitas tim secara terukur"
            ],
            "image_prompt": "Enterprise team collaboration clean office light blue theme"
        })
        
    if len(slides) < slide_count:
        slides.append({
            "slide_number": slide_count,
            "layout_type": "closing",
            "title": f"Siap Bertransformasi Bersama {company_name}?",
            "subtitle": f"Jadwalkan sesi diskusi lanjutan dan konsultasi bersama tim {presenter}.",
            "content": [f"Presenter: {presenter}", f"Perusahaan: {company_name}"],
            "image_prompt": "Professional corporate clean closing slide banner"
        })
        
    return {
        "presentation_title": f"{company_name} - {topic}",
        "presentation_subtitle": f"Presentasi Eksekutif ({duration})",
        "slides": slides[:slide_count]
    }
