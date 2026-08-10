import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { projectService } from '../services/api';

const NewProject = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingKB, setUploadingKB] = useState(false);
  const [error, setError] = useState('');
  const [inputMode, setInputMode] = useState('prompt'); // 'prompt' or 'upload'
  
  const [formData, setFormData] = useState({
    company_name: 'Enterprise Solutions',
    logo_path: '',
    knowledge_base: '',
    jenis: 'Proposal',
    audience: 'Eksekutif',
    duration: 15,
    tone: 'Formal',
    target_slides: 0,
    topic: '',
    points: '',
    presenter: 'Solutions Specialist'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const response = await projectService.uploadDocument(file);
      const extractedText = response.data.extracted_text || '';
      setFormData(prev => ({
        ...prev,
        points: extractedText,
        topic: prev.topic || file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ")
      }));
    } catch (err) {
      console.error(err);
      setError('Gagal mengekstrak teks dari file via OCR.');
    } finally {
      setUploading(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    setError('');

    try {
      const response = await projectService.uploadLogo(file);
      setFormData(prev => ({
        ...prev,
        logo_path: response.data.logo_path || ''
      }));
    } catch (err) {
      console.error(err);
      setError('Gagal mengunggah file logo perusahaan.');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleKnowledgebaseUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingKB(true);
    setError('');

    try {
      const response = await projectService.uploadKnowledgebase(file);
      setFormData(prev => ({
        ...prev,
        knowledge_base: response.data.content || ''
      }));
    } catch (err) {
      console.error(err);
      setError('Gagal membaca file Knowledgebase (.txt/.md).');
    } finally {
      setUploadingKB(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.topic.trim()) {
      setError('Topik utama wajib diisi');
      return;
    }
    
    setLoading(true);
    setError('');
    
    const payload = {
      name: formData.topic.split('\n')[0].slice(0, 60),
      topic: formData.topic,
      company_name: formData.company_name,
      logo_path: formData.logo_path,
      knowledge_base: formData.knowledge_base,
      raw_input: formData.points ? `${formData.topic}\nPoin kunci: ${formData.points}` : formData.topic,
      audience: formData.audience,
      duration: parseInt(formData.duration),
      purpose: formData.jenis,
      tone: formData.tone,
      presenter: formData.presenter,
      target_slides: parseInt(formData.target_slides) > 0 ? parseInt(formData.target_slides) : null,
      input_type: inputMode
    };

    try {
      const response = await projectService.createProject(payload);
      const projectId = response.data.id || response.data.data?.id;
      
      await projectService.generateDraft(projectId);
      
      navigate(`/project/${projectId}/draft`);
    } catch (err) {
      console.error(err);
      setError('Gagal membuat project atau menghubungi server.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center space-x-3 mb-2">
        <Link to="/" className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
          Kembali ke Riwayat
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/80 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-900 to-blue-950 p-6 text-white border-b border-slate-800 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight">Buat Presentasi Baru</h2>
            <p className="text-slate-300 text-xs mt-1">Isi informasi proyek di bawah ini agar AI SlideStudioZ menyusun outline & tata letak slide terbaik.</p>
          </div>
          
          <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setInputMode('prompt')}
              className={`px-3 py-1.5 rounded-lg transition-all ${inputMode === 'prompt' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              Prompt
            </button>
            <button
              type="button"
              onClick={() => setInputMode('upload')}
              className={`px-3 py-1.5 rounded-lg transition-all ${inputMode === 'upload' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              Upload Document
            </button>
          </div>
        </div>

        <div className="p-8">
          {error && <div className="bg-rose-50 text-rose-700 border border-rose-200/80 p-4 rounded-xl text-sm font-semibold mb-6 flex items-center"><svg className="w-5 h-5 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>{error}</div>}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-slate-600">Nama Perusahaan / Instansi</label>
                <input 
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  placeholder="Misal: Nusantara Tech Solutions / Bank BCA"
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none bg-slate-50 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-slate-600">Upload Logo Perusahaan (Opsional)</label>
                <input 
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-blue-600 outline-none bg-slate-50 font-medium"
                />
                {uploadingLogo && <span className="text-[11px] text-blue-600 font-semibold block mt-1">Mengunggah logo...</span>}
                {formData.logo_path && <span className="text-[11px] text-emerald-600 font-semibold block mt-1">✓ Logo tersimpan</span>}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-slate-600">Jenis Presentasi</label>
                <select name="jenis" value={formData.jenis} onChange={handleChange} className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none bg-slate-50 font-medium">
                  <option value="Proposal">Proposal</option>
                  <option value="Demo Produk">Demo Produk</option>
                  <option value="Laporan">Laporan</option>
                  <option value="Training">Training</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-slate-600">Target Audiens</label>
                <select name="audience" value={formData.audience} onChange={handleChange} className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none bg-slate-50 font-medium">
                  <option value="Eksekutif">Eksekutif (C-Level / VP)</option>
                  <option value="Teknis">Teknis (IT Lead / Architect)</option>
                  <option value="Klien Potensial">Klien Potensial</option>
                  <option value="Internal">Internal Team</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-slate-600">Durasi Presentasi (Menit)</label>
                <select name="duration" value={formData.duration} onChange={handleChange} className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none bg-slate-50 font-medium">
                  <option value="5">5 Menit (Singkat)</option>
                  <option value="15">15 Menit (Standar)</option>
                  <option value="30">30 Menit (Detail)</option>
                  <option value="60">60 Menit (Mendalam)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-slate-600">Tone / Gaya Bahasa</label>
                <select name="tone" value={formData.tone} onChange={handleChange} className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none bg-slate-50 font-medium">
                  <option value="Formal">Formal Enterprise</option>
                  <option value="Semi-formal">Semi-formal</option>
                  <option value="Kasual">Kasual</option>
                  <option value="Persuasif">Persuasif</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-slate-600">Presenter / Peran</label>
                <input 
                  type="text"
                  name="presenter"
                  value={formData.presenter}
                  onChange={handleChange}
                  placeholder="Misal: Solutions Specialist"
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none bg-slate-50 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-slate-600">Jumlah Slide (Opsional)</label>
                <select name="target_slides" value={formData.target_slides} onChange={handleChange} className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none bg-slate-50 font-medium">
                  <option value="0">Otomatis (Rekomendasi AI)</option>
                  <option value="3">3 Slide</option>
                  <option value="4">4 Slide</option>
                  <option value="5">5 Slide</option>
                  <option value="6">6 Slide</option>
                  <option value="7">7 Slide</option>
                  <option value="8">8 Slide</option>
                  <option value="9">9 Slide</option>
                  <option value="10">10 Slide</option>
                  <option value="15">15 Slide</option>
                </select>
              </div>
            </div>

            {inputMode === 'upload' && (
              <div className="p-4 border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-xl bg-slate-50 text-center transition-colors">
                <input 
                  type="file" 
                  accept=".pdf,.png,.jpg,.jpeg,.txt,.md,.docx"
                  onChange={handleFileUpload} 
                  className="hidden"
                  id="ocr-file-upload"
                />
                <label htmlFor="ocr-file-upload" className="cursor-pointer block">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                  </div>
                  <span className="text-xs font-bold text-slate-800 block">
                    {uploading ? 'Memproses File via OCR...' : 'Klik untuk Unggah PDF / Dokumen / Gambar OCR'}
                  </span>
                  <span className="text-[11px] text-slate-400">Mendukung PDF, DOCX, TXT, dan gambar berformat PNG/JPG</span>
                </label>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-slate-600">Topik Utama <span className="text-rose-500">*</span></label>
              <input 
                type="text" 
                name="topic"
                value={formData.topic} 
                onChange={handleChange}
                placeholder="Misal: Digital Transformation & AI Strategy 2026" 
                className="w-full border border-slate-200 rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-blue-600 outline-none font-medium text-slate-900"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Knowledgebase Perusahaan / Instansi (.txt / .md) (Opsional)
                </label>
                <label htmlFor="kb-file-upload" className="cursor-pointer text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center">
                  <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                  {uploadingKB ? 'Mengunggah...' : 'Unggah File (.txt/.md)'}
                </label>
                <input 
                  type="file" 
                  id="kb-file-upload" 
                  accept=".txt,.md" 
                  onChange={handleKnowledgebaseUpload} 
                  className="hidden" 
                />
              </div>
              <textarea 
                name="knowledge_base"
                value={formData.knowledge_base} 
                onChange={handleChange}
                placeholder="File atau teks acuan basis pengetahuan instansi/perusahaan (profil, produk, visi, angka rujukan)..." 
                className="w-full border border-slate-200 rounded-xl p-3 text-xs h-24 focus:ring-2 focus:ring-blue-600 outline-none font-medium text-slate-800 bg-slate-50/50 resize-none font-mono"
              ></textarea>
              {formData.knowledge_base && (
                <span className="text-[11px] text-emerald-600 font-semibold block mt-1">
                  ✓ Knowledgebase aktif ({formData.knowledge_base.length} karakter)
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-slate-600">Poin-poin Kunci / Hasil Ekstraksi OCR (Opsional)</label>
              <textarea 
                name="points"
                value={formData.points} 
                onChange={handleChange}
                placeholder="Tuliskan ide atau angka penting yang ingin dimasukkan ke dalam slide..." 
                className="w-full border border-slate-200 rounded-xl p-3.5 text-sm h-32 focus:ring-2 focus:ring-blue-600 outline-none font-medium text-slate-900 resize-none font-sans"
              ></textarea>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button 
                type="submit" 
                disabled={loading || uploading}
                className={`px-8 py-3.5 rounded-xl text-white font-bold shadow-lg transition-all text-sm flex items-center ${loading || uploading ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/30'}`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    AI sedang menyusun Outline...
                  </>
                ) : (
                  <>
                    <span>Generate Draft Presentasi</span>
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewProject;
