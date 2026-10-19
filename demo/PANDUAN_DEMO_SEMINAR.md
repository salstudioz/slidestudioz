# 🎯 PANDUAN LENGKAP LIVE DEMO SISTEM SEMINAR KERJA PRAKTIK
**Aplikasi**: SlideStudioz / AssistSlide Engine  
**Presenter**: Salma Faizatul Jannah  
**Topik**: Rancang Bangun Sistem Generator Presentasi Berbasis Multi-Model AI dengan Mekanisme Human-in-the-Loop pada AssistX Enterprise  

---

## 📁 1. Daftar File Bahan Demo di Folder `demo/`
Semua bahan yang Anda butuhkan sudah disiapkan di folder `demo/`:
1. **`demo/logo_assistx.png`** $\rightarrow$ File logo transparan AssistX Enterprise untuk fitur Corporate Branding.
2. **`demo/sample_proposal_presales.pdf`** $\rightarrow$ Dokumen proposal presales 2 halaman untuk demo ekstraksi OCR/PyMuPDF.
3. **`demo/company_knowledgebase.txt`** $\rightarrow$ Berkas teks profil & layanan AssistX untuk demo Knowledge Grounding.

---

## ⚡ 2. Persiapan Sebelum Maju Presentasi (2 Menit)
1. Buka Terminal / PowerShell di folder proyek ini (`d:\Intern\project\mini\AssistSlide\final\`).
2. Jalankan perintah:
   ```bash
   python run_app.py
   ```
3. Tunggu 5 detik:
   - Backend FastAPI akan aktif di `http://127.0.0.1:8000`.
   - Frontend React Vite akan aktif di `http://localhost:5173`.
   - Browser Anda akan otomatis terbuka ke `http://localhost:5173`.
4. Buka File Explorer di sebelah browser dan arahkan ke folder `demo/` agar mudah saat memilih file upload.
5. Pastikan laptop terhubung ke internet (WiFi atau Tethering HP).

---

## 🎬 3. Skenario Demo Step-by-Step (Durasi ~3–4 Menit)

### TAHAP 1: Halaman Riwayat Proyek (Dashboard)
- **Tampilan**: Halaman Beranda (`http://localhost:5173`).
- **Apa yang Anda lakukan**:
  - Tunjukkan daftar riwayat proyek yang ada di tabel.
- **Apa yang Anda katakan ke Dosen**:
  > *"Selamat pagi/siang Bapak/Ibu Dosen Penguji dan Pembimbing. Ini adalah antarmuka utama sistem yang saya bangun untuk Divisi Presales di PT Masadepan Indonesia Digital (AssistX Enterprise).*  
  > *Semua proyek presentasi tersimpan secara persisten menggunakan basis data lokal SQLite."*
- **Aksi**: Klik tombol biru **`+ Buat Presentasi Baru`** di pojok kanan atas.

---

### TAHAP 2: Creation Wizard (Input & Ekstraksi Dokumen)
- **Tampilan**: Form pembuatan presentasi.
- **Langkah 1 (Ganti Mode ke Upload Document)**:
  - Di pojok kanan atas kartu, klik tombol toggle **`Upload Document`** (sebelah tombol *Prompt*).
- **Langkah 2 (Upload File Dokumen)**:
  - Klik kotak putus-putus *Unggah Berkas / Dokumen* $\rightarrow$ pilih file:  
    `demo/sample_proposal_presales.pdf`
  - Tunggu 1–2 detik hingga teks proposal otomatis terisi di kolom *"Poin Kunci / Masukan Dokumen"*.
- **Apa yang Anda katakan ke Dosen**:
  > *"Pada fitur Ingestion ini, staf presales tidak perlu menyalin-tempel teks secara manual dari proposal klien. Modul PyMuPDF dan Tesseract OCR di backend langsung mengekstrak teks teknis secara akurat ke dalam form."*
- **Langkah 3 (Pengisian Metadata & Branding)**:
  Isi formulir dengan data berikut:
  - **Nama Perusahaan / Instansi**: `PT Masadepan Indonesia Digital (AssistX)`
  - **Upload Logo Perusahaan**: Klik tombol upload $\rightarrow$ pilih `demo/logo_assistx.png`.  
    *(Akan muncul teks hijau: `✓ Logo tersimpan`)*
  - **Jenis Presentasi**: Pilih `Proposal`
  - **Target Audiens**: Pilih `Eksekutif (C-Level / VP)`
  - **Durasi Presentasi**: Pilih `15 Menit (Standar)`
  - **Tone / Gaya Bahasa**: Pilih `Formal Enterprise`
  - **Presenter / Peran**: `Salma Faizatul J - Presales Specialist`
  - **Jumlah Slide**: Pilih `5 Slide`  
    *(Tips: Pilih 5 slide agar proses AI di depan dosen cepat selesai sekitar 10–15 detik).*
  - **Upload Knowledgebase (Opsional)**: Klik upload knowledge base $\rightarrow$ pilih `demo/company_knowledgebase.txt`.
- **Aksi**: Klik tombol biru di bagian bawah: **`Generate Outline & Draft Slide`**.

---

### TAHAP 3: Draft Review Editor (Mekanisme Human-in-the-Loop) — ★ POIN UTAMA KP ★
- **Tampilan**: Halaman kartu draf slide (`/project/:id/draft`).
- **Apa yang Anda katakan ke Dosen**:
  > *"Bapak/Ibu, ini adalah poin inovasi utama dalam laporan Kerja Praktik saya, yaitu mekanisme **Human-in-the-Loop (HITL)**.*  
  > *Sistem berbasis AI generatif biasa sering mengalami halusinasi dan memaksakan hasil akhir tanpa kontrol editorial. Di sistem ini, sebelum dokumen dikompilasi ke PPTX, staf manusia diberikan ruang untuk memvalidasi, menyunting, dan menyetujui draf."*
- **Aksi Interaktif yang Anda Demokan di Depan Dosen**:
  1. **Edit Teks Slide**:
     - Pilih salah satu kartu slide (misal Slide 2 atau Slide 3).
     - Di kolom teks poin konten, tambahkan satu kalimat baru:  
       `• Prioritas Presales: Efisiensi waktu pembuatan dokumen hingga 80%`
  2. **Ganti Jenis Layout**:
     - Pada salah satu slide, klik dropdown layout di pojok kanan kartu (misal ubah dari `content` menjadi `cards` atau `two_column`).
     - Jelaskan bahwa sistem mendukung 7 variasi tata letak korporat: *Cover, Divider, Content, Two Column, Stats, Cards, Closing*.
  3. *(Opsional)* Tunjukkan tombol `Regenerate AI` dan `Simpan Draft`.
- **Aksi**: Klik tombol biru di kanan atas: **`Approve & Generate Presentasi`**.

---

### TAHAP 4: Result & Download Output Dokumen
- **Tampilan**: Layar progress bar (`Menyusun Presentasi Anda...`).
  - Progress bar akan berjalan dari rendering gambar AI $\rightarrow$ layouting engine $\rightarrow$ selesai.
- **Tampilan Akhir**: Ikon centang hijau bertuliskan **"Presentasi Siap Diunduh!"**.
- **Aksi**:
  1. Klik tombol biru **`Download PPTX`**.
  2. Buka berkas `.pptx` yang baru terunduh menggunakan Microsoft PowerPoint.
- **Apa yang Anda tunjukkan di PowerPoint ke Dosen**:
  - **Aspek Rasio 16:9 Widescreen**: Layout slide proporsional dan tidak berantakan.
  - **Corporate Branding Terintegrasi**: Perlihatkan logo **AssistX Enterprise** yang otomatis terpasang rapi di slide cover dan header.
  - **Hasil Edit HITL Masuk ke Slide**: Tunjukkan kalimat tambahan yang tadi Anda ketik di web editor sudah tercetak di dalam PowerPoint.
- **Kalimat Penutup Demo**:
  > *"Dengan demikian, alur sistem dari ekstraksi dokumen, routing model AI, kurasi Human-in-the-Loop, hingga kompilasi berkas presentasi korporat telah berjalan secara fungsional dan terintegrasi penuh. Sekian demo sistem dari saya, terima kasih."*

---

## 🧠 4. Prediksi Pertanyaan Dosen Penguji & Contekan Jawabannya

### Q1: *"Mengapa harus ada tahap Draft Review (Human-in-the-Loop), kenapa tidak langsung jadi PPTX saja?"*
> **Jawaban Salma**:  
> *"Di lingkungan bisnis korporat divisi Presales, akurasi data teknis adalah taruhan reputasi perusahaan. Model AI generatif memiliki risiko 'hallucination' (mengarang fakta atau angka yang keliru). Dengan mekanisme Human-in-the-Loop, AI bertindak sebagai asisten pembuat draf awal (*copilot*), sedangkan kendali editorial dan keputusan final tetap berada di tangan manusia sebelum dokumen disajikan ke klien C-Level."*

### Q2: *"Bagaimana arsitektur Multi-Model AI Router bekerja?"*
> **Jawaban Salma**:  
> *"Sistem menggunakan OpenRouter API sebagai AI Gateway. Model primer menggunakan open-source performa tinggi seperti Google Gemma atau DeepSeek. Jika API penyedia utama mengalami latensi tinggi atau kehabisan kuota, router otomatis melakukan failover ke model cadangan, dan jika koneksi internet terputus sekalipun, sistem memiliki modul local parser dokumen bawaan agar alur kerja tidak macet."*

### Q3: *"Mengapa menggunakan SQLite untuk database dan bukan PostgreSQL atau MySQL?"*
> **Jawaban Salma**:  
> *"Sesuai dengan batasan masalah dan ruang lingkup Kerja Praktik, aplikasi difokuskan pada single-tenant internal developer/presales environment tanpa otentikasi multi-user yang kompleks. SQLite bersifat serverless, zero-configuration, sangat cepat untuk operasi read-write lokal, serta mudah di-backup dalam bentuk satu file database (`slidestudioz.db`)."*

### Q4: *"Bagaimana slide PowerPoint dan PDF dihasilkan oleh sistem?"*
> **Jawaban Salma**:  
> *"Sistem menggunakan engine Python `python-pptx` yang diprogram secara modular dengan aturan koordinat grid 16:9 widescreen. Sistem menghitung margin, padding, perataan logo, dan ukuran font secara dinamis agar tidak terjadi text-overflow. Untuk ekspor PDF, sistem mengonversinya secara otomatis menggunakan antarmuka Windows Office Automation atau renderer ReportLab."*
