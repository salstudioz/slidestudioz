import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Download, Save, Plus, Trash2, ChevronUp, ChevronDown, 
  ChevronLeft, ChevronRight, Layout, CheckCircle2, RefreshCw, 
  FileDown, Layers, Edit2, AlertCircle 
} from 'lucide-react';
import SlideCanvas from './SlideCanvas';
import { api } from '../api';

export default function SlideStudio({ project, initialSlides, onBackToDashboard }) {
  const [slides, setSlides] = useState(initialSlides || []);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportResult, setExportResult] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (initialSlides && initialSlides.length > 0) {
      setSlides(initialSlides);
    } else {
      api.getProjectDetails(project.id)
        .then(res => setSlides(res.slides || []))
        .catch(err => setError(err.message));
    }
  }, [project.id]);

  const activeSlide = slides[currentSlideIndex] || null;

  const handleUpdateActiveSlide = (field, value) => {
    if (!activeSlide) return;
    const updated = [...slides];
    updated[currentSlideIndex] = {
      ...updated[currentSlideIndex],
      [field]: value
    };
    setSlides(updated);
  };

  const handleUpdateContentPoint = (index, value) => {
    if (!activeSlide) return;
    let points = Array.isArray(activeSlide.content) ? [...activeSlide.content] : [];
    points[index] = value;
    handleUpdateActiveSlide('content', points);
  };

  const handleAddContentPoint = () => {
    if (!activeSlide) return;
    let points = Array.isArray(activeSlide.content) ? [...activeSlide.content] : [];
    points.push('New key highlight point');
    handleUpdateActiveSlide('content', points);
  };

  const handleRemoveContentPoint = (index) => {
    if (!activeSlide) return;
    let points = Array.isArray(activeSlide.content) ? [...activeSlide.content] : [];
    points.splice(index, 1);
    handleUpdateActiveSlide('content', points);
  };

  const handleAddSlide = () => {
    const newSlide = {
      slide_number: slides.length + 1,
      layout_type: 'content',
      title: `Slide ${slides.length + 1}: Solution Details`,
      subtitle: 'Key technical highlight',
      content: ['Feature highlight point 1', 'Implementation timeline point 2'],
      image_prompt: 'Enterprise tech workspace illustration'
    };
    const updated = [...slides, newSlide];
    setSlides(updated);
    setCurrentSlideIndex(updated.length - 1);
  };

  const handleDeleteSlide = (index) => {
    if (slides.length <= 1) {
      alert('Presentation must have at least 1 slide.');
      return;
    }
    const updated = slides.filter((_, i) => i !== index).map((s, i) => ({
      ...s,
      slide_number: i + 1
    }));
    setSlides(updated);
    setCurrentSlideIndex(Math.max(0, index - 1));
  };

  const handleMoveSlide = (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= slides.length) return;
    const updated = [...slides];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    
    const reindexed = updated.map((s, i) => ({ ...s, slide_number: i + 1 }));
    setSlides(reindexed);
    setCurrentSlideIndex(targetIdx);
  };

  const handleSaveDeck = async () => {
    setSaving(true);
    setError(null);
    setSavedSuccess(false);
    try {
      await api.updateDraft(project.id, slides);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      setError(`Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleRegenerateAI = async () => {
    if (!window.confirm('Regenerate entire slide deck using AI? Local un-saved changes will be overwritten.')) return;
    setGenerating(true);
    setError(null);
    try {
      const res = await api.generateDraft(project.id);
      setSlides(res.slides || []);
      setCurrentSlideIndex(0);
    } catch (err) {
      setError(`AI Regeneration failed: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    setError(null);
    setExportResult(null);
    try {
      await api.updateDraft(project.id, slides);
      const res = await api.generatePresentation(project.id);
      setExportResult(res.data);
    } catch (err) {
      setError(`Export failed: ${err.message}`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 pb-12">
      
      {/* Studio Header Bar */}
      <div className="glass-panel p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <button onClick={onBackToDashboard} className="text-xs text-gray-400 hover:text-white font-medium">
              ← Dashboard
            </button>
            <span className="text-gray-600">/</span>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-500/20 px-2 py-0.5 rounded">
              {project.company_name || 'Enterprise Solutions'}
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2 mt-0.5">
            {project.name}
          </h2>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleRegenerateAI}
            disabled={generating}
            className="btn btn-secondary text-xs py-2 px-3"
            title="Regenerate all slides via OpenRouter LLM"
          >
            <Sparkles className={`w-3.5 h-3.5 text-cyan-400 ${generating ? 'animate-spin' : ''}`} />
            {generating ? 'Regenerating...' : 'AI Regenerate Deck'}
          </button>

          <button
            onClick={handleSaveDeck}
            disabled={saving}
            className="btn btn-secondary text-xs py-2 px-4"
          >
            <Save className={`w-3.5 h-3.5 text-blue-400 ${saving ? 'animate-spin' : ''}`} />
            {saving ? 'Saving...' : savedSuccess ? 'Saved!' : 'Save Deck'}
          </button>

          <button
            onClick={handleExport}
            disabled={exporting}
            className="btn btn-primary text-xs py-2 px-5"
          >
            {exporting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Compiling PPTX & PDF...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Export Deck (.pptx / .pdf)
              </>
            )}
          </button>
        </div>
      </div>

      {/* Export Result Download Banner */}
      {exportResult && (
        <div className="glass-panel p-4 mb-6 border-emerald-500/40 bg-emerald-950/30 flex items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h4 className="font-bold text-emerald-200 text-sm">Presentation Exported Successfully!</h4>
              <p className="text-xs text-emerald-400">
                Generated files ready for presentation & download:
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {exportResult.pptx_download_url && (
              <a
                href={exportResult.pptx_download_url}
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary text-xs py-2 px-4"
              >
                <FileDown className="w-4 h-4" />
                Download PowerPoint (.pptx)
              </a>
            )}

            {exportResult.pdf_download_url && (
              <a
                href={exportResult.pdf_download_url}
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary text-xs py-2 px-4"
              >
                <FileDown className="w-4 h-4 text-emerald-400" />
                Download PDF
              </a>
            )}
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center gap-2 mb-6">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Studio 3-Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Slide Thumbnails List (3 Cols) */}
        <div className="lg:col-span-3 space-y-3">
          <div className="flex items-center justify-between px-1 mb-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              Slides ({slides.length})
            </span>
            <button
              onClick={handleAddSlide}
              className="btn btn-secondary text-[11px] py-1 px-2.5"
              title="Add New Slide"
            >
              <Plus className="w-3 h-3 text-cyan-400" /> Slide
            </button>
          </div>

          <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
            {slides.map((s, idx) => (
              <div
                key={idx}
                onClick={() => setCurrentSlideIndex(idx)}
                className={`glass-panel p-3 cursor-pointer relative group transition-all ${
                  currentSlideIndex === idx 
                    ? 'border-cyan-400 bg-blue-950/30 shadow-lg shadow-cyan-500/10' 
                    : 'hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[11px] font-mono font-bold text-cyan-400">
                    Slide {idx + 1}
                  </span>
                  
                  <span className="text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded bg-blue-600/30 text-blue-300 border border-blue-500/30">
                    {s.layout_type}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-white line-clamp-1 group-hover:text-cyan-300">
                  {s.title || `Slide ${idx + 1}`}
                </h4>

                <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleMoveSlide(idx, -1)}
                      disabled={idx === 0}
                      className="p-1 rounded hover:bg-gray-700 text-gray-400 disabled:opacity-30"
                      title="Move Up"
                    >
                      <ChevronUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleMoveSlide(idx, 1)}
                      disabled={idx === slides.length - 1}
                      className="p-1 rounded hover:bg-gray-700 text-gray-400 disabled:opacity-30"
                      title="Move Down"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    onClick={() => handleDeleteSlide(idx)}
                    className="p-1 rounded hover:bg-red-900/40 text-red-400"
                    title="Delete Slide"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CENTER COLUMN: Live Slide Visual Canvas (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-extrabold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
              <Layout className="w-3.5 h-3.5 text-cyan-400" />
              Live Canvas Preview
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentSlideIndex(prev => Math.max(0, prev - 1))}
                disabled={currentSlideIndex === 0}
                className="btn btn-secondary py-1 px-2 text-xs disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono font-bold text-gray-300">
                {currentSlideIndex + 1} / {slides.length}
              </span>
              <button
                onClick={() => setCurrentSlideIndex(prev => Math.min(slides.length - 1, prev + 1))}
                disabled={currentSlideIndex === slides.length - 1}
                className="btn btn-secondary py-1 px-2 text-xs disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="glass-panel p-2 shadow-2xl bg-gray-950/80 border-gray-800">
            <SlideCanvas 
              slide={activeSlide} 
              currentSlideNum={currentSlideIndex + 1} 
              totalSlides={slides.length} 
              companyName={project.company_name || 'Enterprise Solutions'}
            />
          </div>
        </div>

        {/* RIGHT COLUMN: Slide Content Editor Form (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="glass-panel p-5 border-blue-500/20">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-cyan-400 mb-4 flex items-center gap-2">
              <Edit2 className="w-4 h-4 text-cyan-400" />
              Edit Slide #{currentSlideIndex + 1} Content
            </h3>

            {activeSlide && (
              <div className="space-y-4">
                
                <div className="form-group">
                  <label className="form-label">Slide Layout Style</label>
                  <select
                    value={activeSlide.layout_type || 'content'}
                    onChange={(e) => handleUpdateActiveSlide('layout_type', e.target.value)}
                    className="input-field text-xs font-semibold"
                  >
                    <option value="cover">Cover (Title Slide)</option>
                    <option value="divider">Divider (Section Overview)</option>
                    <option value="content">Content (Bullets)</option>
                    <option value="two_column">Two Column (Comparison)</option>
                    <option value="stats">Stats (KPI Big Numbers)</option>
                    <option value="cards">Cards (Module Cards)</option>
                    <option value="closing">Closing (Call to Action)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Slide Title</label>
                  <input
                    type="text"
                    value={activeSlide.title || ''}
                    onChange={(e) => handleUpdateActiveSlide('title', e.target.value)}
                    className="input-field text-xs font-semibold"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Subtitle / Description</label>
                  <input
                    type="text"
                    value={activeSlide.subtitle || ''}
                    onChange={(e) => handleUpdateActiveSlide('subtitle', e.target.value)}
                    className="input-field text-xs"
                  />
                </div>

                <div className="form-group">
                  <div className="flex items-center justify-between mb-2">
                    <label className="form-label mb-0">Bullet Points / Items</label>
                    <button
                      onClick={handleAddContentPoint}
                      className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add Point
                    </button>
                  </div>

                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {(Array.isArray(activeSlide.content) ? activeSlide.content : []).map((pt, pIdx) => (
                      <div key={pIdx} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0" />
                        <input
                          type="text"
                          value={pt}
                          onChange={(e) => handleUpdateContentPoint(pIdx, e.target.value)}
                          className="input-field text-xs py-1.5 px-2 flex-1"
                        />
                        <button
                          onClick={() => handleRemoveContentPoint(pIdx)}
                          className="p-1 rounded text-red-400 hover:bg-red-900/30"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-group pt-2 border-t border-white/5">
                  <label className="form-label">Image Illustration Prompt</label>
                  <input
                    type="text"
                    value={activeSlide.image_prompt || ''}
                    onChange={(e) => handleUpdateActiveSlide('image_prompt', e.target.value)}
                    placeholder="Visual prompt for AI image asset"
                    className="input-field text-xs text-gray-300 font-mono"
                  />
                </div>

              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
