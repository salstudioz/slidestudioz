import os
import sys
import uuid
from typing import Dict, Any, List, Optional

from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.prompt import Prompt, Confirm, IntPrompt
from rich.text import Text

from src.config import DEFAULT_MODEL, OPENROUTER_API_KEY, APP_NAME
from src.ocr_service import extract_text_from_file
from src.llm_service import generate_presales_draft
from src.image_service import generate_slide_image
from src.generator_service import generate_presentation_and_pdf
from src import database

console = Console()

def display_banner():
    console.print(Panel.fit(
        f"[bold cyan]{APP_NAME} - EXECUTIVE PRESENTATION CLI 🚀[/bold cyan]\n"
        "[dim]Automated AI Presentation & PDF Document Generator[/dim]\n"
        "[yellow]LLM (OpenRouter) • OCR (Tesseract) • Image Gen (Pollinations.ai) • PPTX & PDF[/yellow]",
        title=f"{APP_NAME} Dashboard",
        border_style="cyan"
    ))

def display_menu():
    table = Table(title="Pilih Menu Utama", border_style="cyan", show_header=True)
    table.add_column("Opsi", style="bold green", justify="center", width=8)
    table.add_column("Fitur", style="bold white")
    table.add_column("Deskripsi", style="dim white")

    table.add_row("1", "Upload File (OCR)", "Unggah dokumen/gambar -> Tesseract OCR -> Executive Draft -> PPTX & PDF")
    table.add_row("2", "Via Prompt", "Tuliskan topik presentasi -> LLM menyusun draft -> PPTX & PDF")
    table.add_row("3", "Manajemen Riwayat & Draft", "Kelola proyek (Edit Metadata/Perusahaan, Logo, Re-draft LLM, Export)")
    table.add_row("4", "System Status & Settings", "Cek Tesseract path, OpenRouter API key, & status sistem")
    table.add_row("0", "Keluar", f"Keluar dari {APP_NAME} CLI")

    console.print(table)

def collect_presentation_metadata(existing: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Collect or edit presentation parameters and corporate metadata."""
    console.print("\n[bold yellow]📋 PARAMETER METADATA PRESENTASI & BRANDING[/bold yellow]")
    
    def_comp = existing.get("company_name", "Enterprise Solutions") if existing else "Enterprise Solutions"
    def_logo = existing.get("logo_path", "") if existing else ""
    def_dur = existing.get("duration", "30 Menit") if existing else "30 Menit"
    def_pres = existing.get("presenter", "Solutions Specialist") if existing else "Solutions Specialist"
    def_aud = existing.get("audience", "C-Level Executives & VP") if existing else "C-Level Executives & VP"
    def_lang = existing.get("language", "Bahasa Indonesia") if existing else "Bahasa Indonesia"
    def_tone = existing.get("tone", "Formal Enterprise") if existing else "Formal Enterprise"
    def_slides = existing.get("slide_count", 8) if existing else 8

    company_name = Prompt.ask("Nama Perusahaan / Instansi", default=def_comp)
    logo_path = Prompt.ask("Path File Logo Perusahaan (opsional)", default=def_logo).strip().strip('"\'')
    
    if logo_path and not os.path.exists(logo_path):
        console.print(f"[yellow]Peringatan: File logo '{logo_path}' tidak ditemukan. Menggunakan logo default.[/yellow]")
        logo_path = ""

    duration = Prompt.ask("Waktu Presentasi", choices=["15 Menit", "30 Menit", "45 Menit", "60 Menit"], default=def_dur)
    presenter = Prompt.ask("Presenter (Siapa yang membawakan)", default=def_pres)
    audience = Prompt.ask("Target Audience", default=def_aud)
    language = Prompt.ask("Bahasa Presentasi", choices=["Bahasa Indonesia", "English", "Bilingual Indo-English"], default=def_lang)
    tone = Prompt.ask("Gaya Bahasa / Tone", choices=["Formal Enterprise", "Technical Deep-Dive", "Persuasive Pitch", "Conversational Business"], default=def_tone)
    
    slide_count_input = IntPrompt.ask("Jumlah Slide (0 untuk Otomatis/Ideal)", default=def_slides)
    slide_count = slide_count_input if slide_count_input > 0 else 8

    use_search = Confirm.ask("Aktifkan Live Web Search Grounding (DuckDuckGo)?", default=True)

    return {
        "company_name": company_name,
        "logo_path": logo_path,
        "duration": duration,
        "presenter": presenter,
        "audience": audience,
        "language": language,
        "tone": tone,
        "slide_count": slide_count,
        "use_web_search": use_search
    }

def handle_upload_file_flow():
    console.print("\n[bold cyan]--- FLOW 1: UPLOAD FILE & OCR DRAFT ---[/bold cyan]")
    file_path = Prompt.ask("Masukkan path file dokumen (PNG/JPG/WEBP, TXT, MD, PDF)").strip().strip('"\'')

    if not os.path.exists(file_path):
        console.print(f"[bold red]Error:[/bold red] File '{file_path}' tidak ditemukan.")
        return

    metadata = collect_presentation_metadata()

    ocr_text = ""
    with console.status("[bold yellow]Memproses file dengan Tesseract OCR / PDF Extractor...[/bold yellow]", spinner="dots"):
        try:
            ocr_text = extract_text_from_file(file_path)
        except Exception as e:
            console.print(f"[bold red]OCR Error:[/bold red] {e}")
            return

    if not ocr_text:
        console.print("[bold red]Gagal membaca teks dari file atau teks kosong.[/bold red]")
        return

    console.print(Panel(
        Text(ocr_text[:600] + ("..." if len(ocr_text) > 600 else ""), style="dim white"),
        title=f"Hasil OCR ({os.path.basename(file_path)})",
        border_style="green"
    ))

    if not Confirm.ask("Lanjutkan ke penyusunan draft AI?", default=True):
        return

    project_id = f"proj_{uuid.uuid4().hex[:8]}"
    project_name = f"{metadata['company_name']}_{os.path.basename(file_path)}"
    
    with console.status("[bold cyan]Menyusun draft slide terstruktur via OpenRouter LLM...[/bold cyan]", spinner="dots"):
        draft = generate_presales_draft(
            ocr_text,
            company_name=metadata["company_name"],
            slide_count=metadata["slide_count"],
            input_type="upload",
            duration=metadata["duration"],
            presenter=metadata["presenter"],
            audience=metadata["audience"],
            language=metadata["language"],
            tone=metadata["tone"],
            use_web_search=metadata["use_web_search"]
        )

    database.create_project(
        project_id, project_name, "upload", ocr_text,
        company_name=metadata["company_name"],
        logo_path=metadata["logo_path"],
        slide_count=len(draft.get("slides", [])),
        duration=metadata["duration"],
        presenter=metadata["presenter"],
        audience=metadata["audience"],
        language=metadata["language"],
        tone=metadata["tone"]
    )
    database.save_slides(project_id, draft.get("slides", []))

    console.print(f"[bold green]Draft presentasi berhasil disusun dan tersimpan di database![/bold green] (ID: {project_id})")
    review_and_edit_draft_flow(project_id)

def handle_via_prompt_flow():
    console.print("\n[bold cyan]--- FLOW 2: VIA PROMPT PRESENTATION DRAFT ---[/bold cyan]")
    prompt_text = Prompt.ask("Tuliskan topik / deskripsi presentasi").strip()

    if not prompt_text:
        console.print("[bold red]Prompt tidak boleh kosong.[/bold red]")
        return

    metadata = collect_presentation_metadata()

    project_id = f"proj_{uuid.uuid4().hex[:8]}"
    project_name = f"{metadata['company_name']}_{prompt_text[:20].strip().replace(' ', '_')}"

    with console.status("[bold cyan]Menyusun draft slide terstruktur via OpenRouter LLM...[/bold cyan]", spinner="dots"):
        draft = generate_presales_draft(
            prompt_text,
            company_name=metadata["company_name"],
            slide_count=metadata["slide_count"],
            input_type="prompt",
            duration=metadata["duration"],
            presenter=metadata["presenter"],
            audience=metadata["audience"],
            language=metadata["language"],
            tone=metadata["tone"],
            use_web_search=metadata["use_web_search"]
        )

    database.create_project(
        project_id, project_name, "prompt", prompt_text,
        company_name=metadata["company_name"],
        logo_path=metadata["logo_path"],
        slide_count=len(draft.get("slides", [])),
        duration=metadata["duration"],
        presenter=metadata["presenter"],
        audience=metadata["audience"],
        language=metadata["language"],
        tone=metadata["tone"]
    )
    database.save_slides(project_id, draft.get("slides", []))

    console.print(f"[bold green]Draft presentasi berhasil disusun dan tersimpan di database![/bold green] (ID: {project_id})")
    review_and_edit_draft_flow(project_id)

def render_slides_table(project_name: str, slides: List[Dict[str, Any]]):
    table = Table(title=f"Draft Slide Outline: {project_name}", border_style="cyan", show_header=True)
    table.add_column("Slide #", style="bold yellow", justify="center", width=8)
    table.add_column("Layout", style="bold green", width=12)
    table.add_column("Judul Slide", style="bold white", width=26)
    table.add_column("Subtitle / Sub-header", style="dim white", width=26)
    table.add_column("Points / Bullets", style="white", width=35)
    table.add_column("AI Image", style="magenta", width=12)

    for s in slides:
        bullets = s.get("content", [])
        if isinstance(bullets, list):
            content_str = "\n".join([f"• {b}" for b in bullets])
        else:
            content_str = str(bullets)

        img_status = "Ready" if s.get("image_path") and os.path.exists(s.get("image_path")) else "No image"

        table.add_row(
            str(s.get("slide_number", "")),
            s.get("layout_type", "content"),
            s.get("title", ""),
            s.get("subtitle", "") or "-",
            content_str or "-",
            img_status
        )

    console.print(table)

def review_and_edit_draft_flow(project_id: str):
    while True:
        project = database.get_project(project_id)
        if not project:
            console.print("[bold red]Project tidak ditemukan.[/bold red]")
            return

        slides = database.get_slides(project_id)

        console.print("\n")
        render_slides_table(project["name"], slides)

        console.print(
            "[bold white]Pilihan Tindakan:[/bold white]\n"
            " [bold yellow][E][/bold yellow] Edit Content Slide   "
            " [bold yellow][G][/bold yellow] Generate Gambar per Slide   "
            " [bold yellow][M][/bold yellow] Edit Metadata / Branding Perusahaan   "
            " [bold yellow][R][/bold yellow] Re-Draft LLM   "
            " [bold yellow][S][/bold yellow] Simpan Ke DB   "
            " [bold green][A][/bold green] APPROVE & GENERATE PPTX & PDF   "
            " [bold red][B][/bold red] Kembali"
        )
        action = Prompt.ask("Pilih tindakan", choices=["e", "E", "g", "G", "m", "M", "r", "R", "s", "S", "a", "A", "b", "B"], default="A").upper()

        if action == "B":
            break

        elif action == "E":
            slide_num = IntPrompt.ask("Nomor slide yang ingin diedit (1 - {})".format(len(slides)))
            target_slide = next((s for s in slides if s["slide_number"] == slide_num), None)

            if not target_slide:
                console.print("[red]Nomor slide tidak valid.[/red]")
                continue

            console.print(f"\n[bold cyan]Editing Slide #{slide_num}[/bold cyan]")
            new_title = Prompt.ask("Judul Slide", default=target_slide["title"])
            new_subtitle = Prompt.ask("Subtitle Slide", default=target_slide["subtitle"] or "")
            new_layout = Prompt.ask("Layout Type", choices=["cover", "divider", "content", "two_column", "stats", "cards", "closing"], default=target_slide["layout_type"])
            
            bullets_raw = Prompt.ask("Bullet points (pisahkan dengan koma)", default="; ".join(target_slide["content"]) if isinstance(target_slide["content"], list) else str(target_slide["content"]))
            new_content = [b.strip() for b in bullets_raw.replace(";", ",").split(",") if b.strip()]

            image_prompt = Prompt.ask("Prompt Gambar Visual (English)", default=target_slide.get("image_prompt", ""))

            database.update_slide(
                target_slide["id"],
                title=new_title,
                subtitle=new_subtitle,
                content=new_content,
                layout_type=new_layout,
                image_prompt=image_prompt,
                image_path=target_slide.get("image_path", "")
            )
            database.update_project_status(project_id, "user_edited")
            console.print(f"[bold green]Slide #{slide_num} berhasil diperbarui![/bold green]")

        elif action == "G":
            slide_num = IntPrompt.ask("Nomor slide untuk generate gambar", default=1)
            target_slide = next((s for s in slides if s["slide_number"] == slide_num), None)

            if not target_slide:
                console.print("[red]Slide tidak ditemukan.[/red]")
                continue

            p = target_slide.get("image_prompt") or f"{target_slide['title']} corporate presentation graphic"
            prompt_input = Prompt.ask("Prompt gambar", default=p)

            with console.status(f"[bold magenta]Generating gambar via Pollinations.ai...[/bold magenta]", spinner="dots"):
                img_path = generate_slide_image(prompt_input, f"{project_id}_slide_{slide_num}.png")

            if img_path:
                database.update_slide(
                    target_slide["id"],
                    title=target_slide["title"],
                    subtitle=target_slide["subtitle"],
                    content=target_slide["content"],
                    layout_type=target_slide["layout_type"],
                    image_prompt=prompt_input,
                    image_path=img_path
                )
                console.print(f"[bold green]Gambar berhasil digenerate tersimpan di:[/bold green] {img_path}")
            else:
                console.print("[bold red]Gagal memproses gambar.[/bold red]")

        elif action == "M":
            new_meta = collect_presentation_metadata(existing=project)
            new_name = Prompt.ask("Nama Proyek", default=project["name"])
            
            database.update_project_metadata(
                project_id,
                name=new_name,
                company_name=new_meta["company_name"],
                logo_path=new_meta["logo_path"],
                duration=new_meta["duration"],
                presenter=new_meta["presenter"],
                audience=new_meta["audience"],
                language=new_meta["language"],
                tone=new_meta["tone"],
                slide_count=new_meta["slide_count"]
            )
            console.print("[bold green]Metadata & branding berhasil diperbarui![/bold green]")

        elif action == "R":
            if not Confirm.ask("Susun ulang (Re-Draft) seluruh slide menggunakan LLM?", default=False):
                continue

            with console.status("[bold cyan]Re-drafting slide outline via OpenRouter LLM...[/bold cyan]", spinner="dots"):
                draft = generate_presales_draft(
                    project["raw_input"],
                    company_name=project.get("company_name", "Enterprise Solutions"),
                    slide_count=project["slide_count"],
                    input_type=project["input_type"],
                    duration=project["duration"],
                    presenter=project["presenter"],
                    audience=project["audience"],
                    language=project["language"],
                    tone=project["tone"],
                    use_web_search=True
                )

            database.save_slides(project_id, draft.get("slides", []))
            database.update_project_status(project_id, "draft")
            console.print("[bold green]Slide outline berhasil disusun ulang oleh LLM![/bold green]")

        elif action == "S":
            database.update_project_status(project_id, "user_edited")
            console.print("[bold green]Semua perubahan tersimpan di SQLite database.[/bold green]")

        elif action == "A":
            if not Confirm.ask("Setujui draft ini dan generate file PPTX & PDF?", default=True):
                continue

            database.update_project_status(project_id, "approved")

            with console.status(f"[bold cyan]Generating file .pptx dan .pdf {APP_NAME}...[/bold cyan]", spinner="dots"):
                res = generate_presentation_and_pdf(
                    project["name"],
                    slides,
                    company_name=project.get("company_name", "Enterprise Solutions"),
                    logo_path=project.get("logo_path")
                )

            database.update_project_status(project_id, "generated", pptx_path=res["pptx_path"], pdf_path=res["pdf_path"])

            console.print("\n" + "="*70)
            console.print(Panel(
                f"[bold green]🎉 PROSES GENERATE PPTX & PDF BERHASIL! 🎉[/bold green]\n\n"
                f"[bold white]File PPTX:[/bold white] [cyan]{res['pptx_path']}[/cyan]\n"
                f"[bold white]File PDF :[/bold white] [cyan]{res['pdf_path']}[/cyan]\n\n"
                f"[dim]Layout: Logo Kanan Atas | Header ({project.get('company_name', 'ENTERPRISE SOLUTIONS')}) | Footer Custom[/dim]",
                title=f"Export Output {APP_NAME}",
                border_style="green"
            ))
            console.print("="*70 + "\n")
            break

def handle_view_projects_flow():
    while True:
        console.print("\n[bold cyan]--- SAVE PROJECTS & DRAFTS IN DATABASE ---[/bold cyan]")
        projects = database.list_projects()

        if not projects:
            console.print("[yellow]Belum ada proyek tersimpan di database.[/yellow]")
            return

        table = Table(title=f"Daftar Proyek {APP_NAME}", border_style="cyan", show_header=True)
        table.add_column("#", style="bold yellow", width=4)
        table.add_column("Project ID", style="bold green", width=14)
        table.add_column("Project Name", style="bold white", width=20)
        table.add_column("Company/Instansi", style="bold cyan", width=18)
        table.add_column("Input", style="dim white", width=8)
        table.add_column("Slides", style="yellow", justify="center", width=6)
        table.add_column("Status", style="magenta", width=12)

        for i, p in enumerate(projects, 1):
            table.add_row(
                str(i),
                p["id"],
                p["name"][:20],
                p.get("company_name", "Enterprise Solutions")[:18],
                p["input_type"].upper(),
                str(p["slide_count"]),
                p["status"].upper()
            )

        console.print(table)

        console.print(
            "\n[bold white]Pilihan Tindakan Riwayat:[/bold white]\n"
            f" [bold green][1-{len(projects)}] [/bold green] Pilih Nomor Proyek untuk Dibuka / Edit Slide\n"
            " [bold yellow][M]    [/bold yellow] Edit Metadata & Perusahaan\n"
            " [bold yellow][R]    [/bold yellow] Re-Draft Proyek dengan LLM\n"
            " [bold red][D]    [/bold red] Hapus Proyek dari Database\n"
            " [bold white][0]    [/bold white] Kembali ke Menu Utama"
        )

        action_str = Prompt.ask("Pilih tindakan atau nomor proyek", default="0").upper().strip()

        if action_str == "0" or not action_str:
            break

        elif action_str.isdigit() and 1 <= int(action_str) <= len(projects):
            selected_proj = projects[int(action_str) - 1]
            review_and_edit_draft_flow(selected_proj["id"])

        elif action_str == "M":
            idx = IntPrompt.ask("Nomor proyek yang ingin diubah metadatanya (1 - {})".format(len(projects)))
            if 1 <= idx <= len(projects):
                target = projects[idx - 1]
                new_meta = collect_presentation_metadata(existing=target)
                new_name = Prompt.ask("Nama Proyek", default=target["name"])
                
                database.update_project_metadata(
                    target["id"],
                    name=new_name,
                    company_name=new_meta["company_name"],
                    logo_path=new_meta["logo_path"],
                    duration=new_meta["duration"],
                    presenter=new_meta["presenter"],
                    audience=new_meta["audience"],
                    language=new_meta["language"],
                    tone=new_meta["tone"],
                    slide_count=new_meta["slide_count"]
                )
                console.print("[bold green]Metadata proyek berhasil diperbarui![/bold green]")

        elif action_str == "R":
            idx = IntPrompt.ask("Nomor proyek yang ingin di-Re-Draft (1 - {})".format(len(projects)))
            if 1 <= idx <= len(projects):
                target = projects[idx - 1]
                if Confirm.ask(f"Susun ulang (Re-Draft) slide proyek '{target['name']}' dengan LLM?", default=True):
                    with console.status("[bold cyan]Re-drafting slide outline via OpenRouter LLM...[/bold cyan]", spinner="dots"):
                        draft = generate_presales_draft(
                            target["raw_input"],
                            company_name=target.get("company_name", "Enterprise Solutions"),
                            slide_count=target["slide_count"],
                            input_type=target["input_type"],
                            duration=target.get("duration", "30 Menit"),
                            presenter=target.get("presenter", "Solutions Specialist"),
                            audience=target.get("audience", "C-Level Executives"),
                            language=target.get("language", "Bahasa Indonesia"),
                            tone=target.get("tone", "Formal Enterprise"),
                            use_web_search=True
                        )
                    database.save_slides(target["id"], draft.get("slides", []))
                    database.update_project_status(target["id"], "draft")
                    console.print("[bold green]Slide outline berhasil disusun ulang oleh LLM![/bold green]")

        elif action_str == "D":
            idx = IntPrompt.ask("Nomor proyek yang ingin dihapus (1 - {})".format(len(projects)))
            if 1 <= idx <= len(projects):
                target = projects[idx - 1]
                if Confirm.ask(f"[bold red]Yakin ingin menghapus proyek '{target['name']}' ({target['id']})?[/bold red]", default=False):
                    database.delete_project(target["id"])
                    console.print(f"[bold green]Proyek '{target['name']}' berhasil dihapus![/bold green]")

def handle_settings_flow():
    console.print("\n[bold cyan]--- SYSTEM STATUS & CONFIGURATION ---[/bold cyan]")
    
    tess_path = os.getenv("TESSERACT_CMD", r"D:\Tesseract-OCR\tesseract.exe")
    tess_ok = os.path.exists(tess_path)
    
    table = Table(title=f"{APP_NAME} System Diagnostics", border_style="cyan")
    table.add_column("Komponen", style="bold green")
    table.add_column("Status / Path", style="white")

    table.add_row("OpenRouter API Key", f"Configured ({OPENROUTER_API_KEY[:8]}...)" if OPENROUTER_API_KEY else "[red]Missing[/red]")
    table.add_row("Tesseract OCR Binary", f"[green]FOUND at {tess_path}[/green]" if tess_ok else f"[red]NOT FOUND ({tess_path})[/red]")
    table.add_row("Web Search Grounding", "DuckDuckGo (DDGS) Enabled")
    table.add_row("Image Generator", "Pollinations.ai (Flux & Turbo models)")
    table.add_row("Branding Customization", "Dynamic Company Header, Custom Logo Upload & Footer Supported")

    console.print(table)
    Prompt.ask("\nTekan Enter untuk kembali ke menu utama")
