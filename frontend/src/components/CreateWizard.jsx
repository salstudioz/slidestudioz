import React, { useState } from 'react';
import { 
  Sparkles, FileText, Upload, ArrowRight, CheckCircle2, 
  Layers, Clock, User, Users, Globe, Shield, RefreshCw, AlertCircle, Building, Image as ImageIcon
} from 'lucide-react';
import { api } from '../api';

export default function CreateWizard({ onProjectCreated, onCancel }) {
  const [mode, setMode] = useState('prompt');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('Enterprise Solutions');
  const [logoPath, setLogoPath] = useState('');
  const [rawInput, setRawInput] = useState('');
  const [file, setFile] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [ocrSuccess, setOcrSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Configuration Metadata
  const [slideCount, setSlideCount] = useState(8);
  const [duration, setDuration] = useState('30 Menit');
  const [presenter, setPresenter] = useState('Solutions Specialist');
  const [audience, setAudience] = useState('C-Level Executives & VP');
  const [language, setLanguage] = useState('Bahasa Indonesia');
  const [tone, setTone] = useState('Formal Enterprise');

  const handleFileUpload = async (uploadedFile) => {
    if (!uploadedFile) return;
    setFile(uploadedFile);
    setUploading(true);
    setError(null);
    setOcrSuccess(false);

    try {
      const res = await api.uploadDocument(uploadedFile);
      setRawInput(res.extracted_text || '');
      setOcrSuccess(true);
      if (!name) {
        setName(uploadedFile.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " "));
      }
    } catch (err) {
      setError(`File OCR processing failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleLogoUpload = async (uploadedLogo) => {
    if (!uploadedLogo) return;
    setLogoFile(uploadedLogo);
    setUploadingLogo(true);
    try {
      const res = await api.uploadLogo(uploadedLogo);
      setLogoPath(res.logo_path || '');
    } catch (err) {
      setError(`Logo upload failed: ${err.message}`);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a presentation title.');
      return;
    }
    if (!rawInput.trim()) {
      setError('Please provide prompt text or upload a reference document.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Create Project
      const createRes = await api.createProject({
        name,
        company_name: companyName,
        logo_path: logoPath,
        input_type: mode,
        raw_input: rawInput,
        target_slides: Number(slideCount),
        duration,
        presenter,
        audience,
        language,
        tone
      });

      const newProject = createRes;

      // 2. Trigger LLM slide generation
      const genRes = await api.generateDraft(newProject.id);
      
      onProjectCreated(newProject, genRes.slides || []);
    } catch (err) {
      setError(err.message || 'Failed to create presentation deck.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="glass-panel p-8 animate-fade-in border-blue-500/20 shadow-2xl">
        
        {/* Title Banner */}
        <div className="text-center max-w-xl mx-auto mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/30">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Create Executive Deck</h2>
          <p className="text-gray-400 text-sm mt-1">
            Generate customized presentation slides powered by GetSlideZ AI Engine.
          </p>
        </div>

        {/* Input Mode Selector */}
        <div className="grid grid-cols-2 gap-4 p-1.5 bg-gray-900/80 rounded-xl border border-white/10 mb-8 max-w-md mx-auto">
          <button
            type="button"
            onClick={() => setMode('prompt')}
            className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-semibold text-xs transition-all ${
              mode === 'prompt' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            Via Prompt Mode
          </button>
          
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-semibold text-xs transition-all ${
              mode === 'upload' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Upload className="w-4 h-4" />
            Upload Document (OCR)
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Company & Presentation Title */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-blue-400" /> Company / Instansi Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Acme Corp / Bank Central Asia"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="input-field text-sm font-semibold"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Presentation Title *</label>
              <input
                type="text"
                placeholder="e.g. Digital Transformation & AI Strategy"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field text-sm font-semibold"
                required
              />
            </div>
          </div>

          {/* Optional Logo Upload */}
          <div className="form-group">
            <label className="form-label flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-cyan-400" /> Custom Logo (Optional)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0])}
                className="input-field text-xs cursor-pointer"
              />
              {uploadingLogo && <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />}
              {logoPath && <span className="text-xs text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-4 h-4"/> Logo Uploaded</span>}
            </div>
          </div>

          {/* Mode 1: Prompt Input */}
          {mode === 'prompt' && (
            <div className="form-group">
              <label className="form-label">Topic / Solution Description / Key Requirements *</label>
              <textarea
                placeholder="Describe your solution requirements, challenges, goals, and key points..."
                value={rawInput}
                onChange={(e) => setRawInput(e.target.value)}
                className="textarea-field min-h-[140px]"
                required
              />
            </div>
          )}

          {/* Mode 2: File Upload */}
          {mode === 'upload' && (
            <div className="space-y-4">
              <div className="form-label">Upload Reference Document (PDF, TXT, PNG/JPG OCR)</div>
              
              <div className="border-2 border-dashed border-gray-700 hover:border-cyan-500/60 rounded-xl p-8 text-center bg-gray-900/40 transition-colors relative cursor-pointer group">
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.txt,.md"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                
                <div className="w-12 h-12 rounded-full bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6 text-cyan-400" />
                </div>
                
                <p className="text-sm font-semibold text-white mb-1">
                  {file ? file.name : 'Click to select or drag and drop reference document'}
                </p>
                <p className="text-xs text-gray-400">
                  Supports PDF reports, proposal documents, or image screenshots for OCR extraction
                </p>

                {uploading && (
                  <div className="mt-4 flex items-center justify-center gap-2 text-xs text-cyan-300">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Extracting text content via Tesseract OCR...
                  </div>
                )}

                {ocrSuccess && (
                  <div className="mt-4 inline-flex items-center gap-1.5 badge badge-green text-xs">
                    <CheckCircle2 className="w-4 h-4" />
                    Text Extracted Successfully ({rawInput.length} chars)
                  </div>
                )}
              </div>

              {rawInput && (
                <div className="form-group">
                  <label className="form-label">Extracted Content Preview (Editable)</label>
                  <textarea
                    value={rawInput}
                    onChange={(e) => setRawInput(e.target.value)}
                    className="textarea-field min-h-[120px] font-mono text-xs text-gray-300"
                  />
                </div>
              )}
            </div>
          )}

          {/* Configuration Grid */}
          <div className="pt-6 border-t border-white/10">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-cyan-400 mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Presentation Settings
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="form-group">
                <label className="form-label flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-400" /> Presenter Name
                </label>
                <input
                  type="text"
                  value={presenter}
                  onChange={(e) => setPresenter(e.target.value)}
                  className="input-field text-xs"
                />
              </div>

              <div className="form-group">
                <label className="form-label flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-cyan-400" /> Target Audience
                </label>
                <input
                  type="text"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className="input-field text-xs"
                />
              </div>

              <div className="form-group">
                <label className="form-label flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" /> Duration
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="input-field text-xs"
                >
                  <option value="15 Menit">15 Menit (Executive Pitch)</option>
                  <option value="30 Menit">30 Menit (Standard Presentation)</option>
                  <option value="60 Menit">60 Menit (Deep-Dive Tech)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-purple-400" /> Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="input-field text-xs"
                >
                  <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                  <option value="English">English</option>
                  <option value="Bilingual (ID/EN)">Bilingual (ID/EN)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-amber-400" /> Tone / Style
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="input-field text-xs"
                >
                  <option value="Formal Enterprise">Formal Enterprise</option>
                  <option value="Persuasive Pitch">Persuasive Pitch</option>
                  <option value="Technical Deep-Dive">Technical Deep-Dive</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-400" /> Target Slide Count
                </label>
                <input
                  type="number"
                  min="3"
                  max="25"
                  value={slideCount}
                  onChange={(e) => setSlideCount(e.target.value)}
                  className="input-field text-xs font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-lg bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-secondary text-xs py-2.5 px-5"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading || uploading}
              className="btn btn-primary text-sm py-2.5 px-6"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating Presentation Deck...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Deck with AI
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
