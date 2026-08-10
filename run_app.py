import subprocess
import sys
import time
import webbrowser
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = Path(__file__).resolve().parent
FRONTEND_DIR = BASE_DIR / "frontend"

def main():
    print("=" * 65)
    print(" Launching GetSlideZ (React + FastAPI)")
    print("=" * 65)

    # 1. Start FastAPI Backend Server
    print("[1/3] Starting FastAPI REST Server on http://127.0.0.1:8000...")
    backend_cmd = [sys.executable, "-m", "uvicorn", "server:app", "--host", "127.0.0.1", "--port", "8000", "--reload"]
    backend_proc = subprocess.Popen(backend_cmd, cwd=str(BASE_DIR))

    time.sleep(2)

    # 2. Start React Vite Dev Server
    print("[2/3] Starting React Vite Frontend Server...")
    frontend_cmd = ["cmd", "/c", "npm run dev"]
    frontend_proc = subprocess.Popen(frontend_cmd, cwd=str(FRONTEND_DIR))

    time.sleep(3)

    # 3. Open Browser
    app_url = "http://localhost:5173"
    print(f"[3/3] Opening browser at {app_url}...")
    try:
        webbrowser.open(app_url)
    except Exception:
        pass

    print("\n[OK] GetSlideZ is live!")
    print("   • React App: http://localhost:5173")
    print("   • API Specs: http://127.0.0.1:8000/docs\n")
    print("Press Ctrl+C to stop both servers.")

    try:
        backend_proc.wait()
        frontend_proc.wait()
    except KeyboardInterrupt:
        print("\nStopping GetSlideZ servers...")
        backend_proc.terminate()
        frontend_proc.terminate()
        sys.exit(0)

if __name__ == "__main__":
    main()
