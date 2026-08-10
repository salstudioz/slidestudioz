# GetSlideZ: Panduan Arsitektur & Prinsip Presentasi Eksekutif

Panduan ini digunakan oleh mesin AI GetSlideZ untuk menyusun materi presentasi eksekutif berstandar tinggi.

---

## 1. Prinsip Utama Desain Konten

1. **Clarity & Visual Balance**:
   - Maksimal 5 poin per slide.
   - Poin-poin ditulis secara padat, tajam, dan langsung menyasar nilai bisnis (*business value*).
   - Menghindari kalimat paragraf panjang (*wall of text*).

2. **Struktur Narasi Presentasi**:
   - **Cover Slide**: Judul hero, sub-judul strategis, serta metadata presenter & perusahaan.
   - **Section Divider**: Transisi antar seksi untuk memberikan jeda narasi yang jernih.
   - **Executive Summary / Challenges**: Menjelaskan tantangan utama dan ruang lingkup solusi.
   - **Key Capabilities / Cards**: Menjabarkan modul/solusi unggulan dalam format kartu visual.
   - **Measurable Impact / Stats**: Menampilkan angka, persentase efisiensi, dan KPI keberhasilan.
   - **Closing Slide**: Call-to-action (CTA) yang jelas dengan informasi kontak resmi.

3. **Prinsip Pengolahan Dokumen OCR / File Upload**:
   - **Comprehensive Section Coverage**: Jika dokumen input memiliki seksi bernomor atau bab utama, buatlah slide untuk setiap seksi tanpa memotong atau mengabaikan topik penting.
   - **Akurasi Fakta**: Mempertahankan istilah teknis, data spesifik, dan angka konkret yang tercantum pada dokumen sumber.

---

## 2. Format JSON Output

Setiap keluaran draf slide wajib berupa JSON valid yang berisi daftar slide, jenis layout (`cover`, `divider`, `content`, `two_column`, `stats`, `cards`, `closing`), serta prompt visual dalam Bahasa Inggris untuk generasi ilustrasi AI.
