import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectService } from '../services/api';

const DraftReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [draft, setDraft] = useState({ slides: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDraft();
  }, [id]);

  const fetchDraft = async () => {
    try {
      const response = await projectService.getDraft(id);
      const slidesList = response.data.slides || response.data.data?.slides || [];
      setDraft({ slides: slidesList });
    } catch (err) {
      setError('Gagal mengambil draft.');
    } finally {
      setLoading(false);
    }
  };

  const handleSlideChange = (index, field, value) => {
    const newSlides = [...draft.slides];
    newSlides[index] = { ...newSlides[index], [field]: value };
    setDraft({ ...draft, slides: newSlides });
  };

  const handleContentChange = (index, text) => {
    const newSlides = [...draft.slides];
    newSlides[index].content = text.split('\n').filter(line => line.trim() !== '');
    setDraft({ ...draft, slides: newSlides });
  };

  const saveDraft = async () => {
    setSaving(true);
    try {
      await projectService.updateDraft(id, draft);
    } catch (err) {
      setError('Gagal menyimpan draft.');
    } finally {
      setSaving(false);
    }
  };

  const regenerateDraft = async () => {
    setLoading(true);
    try {
      const response = await projectService.regenerateDraft(id);
      const slidesList = response.data.slides || response.data.data?.slides || [];
      setDraft({ slides: slidesList });
    } catch (err) {
      setError('Gagal membuat ulang draft.');
    } finally {
      setLoading(false);
    }
  };

  const approveAndGenerate = async () => {
    await saveDraft();
    navigate(`/project/${id}/result`);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24 space-y-4">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-lg font-bold text-slate-800">Menyiapkan Outline Slide dengan AI SlideStudioZ...</p>
    </div>
  );
  
  if (error) return <div className="p-6 text-center text-rose-600 bg-rose-50 border border-rose-200 rounded-2xl font-bold">{error}</div>;

  return (
    <div className="space-y-6 max-w-full">
      {/* Sticky Action Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-white p-5 rounded-2xl shadow-md border border-slate-200/80 sticky top-16 z-30 gap-4">
        <div>
          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Review & Edit Slide</h2>
            <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-blue-200 shrink-0">
              {draft?.slides?.length || 0} Slide
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Sesuaikan judul, poin bullet, layout, atau visual prompt sebelum render akhir.</p>
        </div>
        <div className="flex items-center flex-wrap gap-2 w-full lg:w-auto justify-end">
          <button 
            onClick={regenerateDraft} 
            className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center shrink-0"
          >
            <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
            Regenerate AI
          </button>
          <button 
            onClick={saveDraft} 
            disabled={saving} 
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all shrink-0"
          >
            {saving ? 'Saving...' : 'Simpan Draft'}
          </button>
          <button 
            onClick={approveAndGenerate} 
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-extrabold shadow-md shadow-blue-600/30 transition-all flex items-center shrink-0"
          >
            <span>Approve & Generate Presentasi</span>
            <svg className="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
          </button>
        </div>
      </div>

      {/* Slide Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {draft?.slides.map((slide, idx) => (
          <div key={idx} className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 relative transition-all hover:shadow-md space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 flex-wrap gap-2">
                <span className="bg-slate-900 text-white text-xs font-mono font-bold px-2.5 py-1 rounded-lg shrink-0">
                  Slide {idx + 1}
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100 shrink-0">
                  {slide.layout || slide.layout_type || 'content'}
                </span>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">Judul Slide</label>
                <input 
                  type="text" 
                  value={slide.title || ''} 
                  onChange={(e) => handleSlideChange(idx, 'title', e.target.value)}
                  className="w-full text-base font-bold text-slate-900 border-b-2 border-slate-100 hover:border-slate-300 focus:border-blue-600 focus:outline-none py-1 transition-colors bg-transparent" 
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">Poin-poin Utama (1 baris per poin)</label>
                <textarea 
                  value={Array.isArray(slide.content) ? slide.content.join('\n') : (slide.content || '')} 
                  onChange={(e) => handleContentChange(idx, e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-800 h-32 focus:ring-2 focus:ring-blue-600 focus:outline-none bg-slate-50/50 resize-none leading-relaxed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs mt-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">Pilihan Layout</label>
                <select 
                  value={slide.layout || slide.layout_type || 'content'} 
                  onChange={(e) => {
                    handleSlideChange(idx, 'layout', e.target.value);
                    handleSlideChange(idx, 'layout_type', e.target.value);
                  }}
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white"
                >
                  <option value="cover">Cover (Sampul)</option>
                  <option value="content">Content (Standar)</option>
                  <option value="divider">Divider (Section)</option>
                  <option value="two_column">Two Column (2 Kolom)</option>
                  <option value="stats">Stats (Statistik)</option>
                  <option value="cards">Cards (Modul Solusi)</option>
                  <option value="closing">Closing (Penutup)</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">Visual Prompt AI</label>
                <input 
                  type="text" 
                  value={slide.visual_request || slide.image_prompt || 'none'} 
                  onChange={(e) => {
                    handleSlideChange(idx, 'visual_request', e.target.value);
                    handleSlideChange(idx, 'image_prompt', e.target.value);
                  }}
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DraftReview;
