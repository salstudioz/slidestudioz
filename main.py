import sys
from rich.console import Console
from rich.prompt import Prompt

from src.cli_ui import (
    display_banner,
    display_menu,
    handle_upload_file_flow,
    handle_via_prompt_flow,
    handle_view_projects_flow,
    handle_settings_flow
)
from src import database

console = Console()

def main():
    database.init_db()
    
    while True:
        try:
            console.clear()
            display_banner()
            display_menu()
            
            choice = Prompt.ask("Pilih menu", choices=["1", "2", "3", "4", "0"], default="1")
            
            if choice == "1":
                handle_upload_file_flow()
            elif choice == "2":
                handle_via_prompt_flow()
            elif choice == "3":
                handle_view_projects_flow()
            elif choice == "4":
                handle_settings_flow()
            elif choice == "0":
                console.print("\n[bold yellow]Terima kasih telah menggunakan GetSlideZ CLI! Goodbye![/bold yellow]\n")
                sys.exit(0)
                
            Prompt.ask("\nTekan Enter untuk melanjutkan...")
        except (KeyboardInterrupt, EOFError):
            console.print("\n[bold yellow]Terima kasih telah menggunakan GetSlideZ CLI! Goodbye![/bold yellow]\n")
            break

if __name__ == "__main__":
    main()
