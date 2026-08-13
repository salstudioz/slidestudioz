import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, FileText, Sparkles, Download, Trash2, Edit3, 
  Clock, Users, UserCheck, Layers, AlertCircle, RefreshCw, Building 
} from 'lucide-react';
import { api } from '../api';

export default function Dashboard({ onSelectProject, onCreateNew }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState({});

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getProjects();
      setProjects(res || []);
    } catch (err) {
      setError(err.message || 'Could not connect to FastAPI server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDelete = async (projectId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await api.deleteProject(projectId);
      setProjects(projects.filter(p => p.id !== projectId));
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const handleExportQuick = async (projectId, e) => {
    e.stopPropagation();
    setActionLoading(prev => ({ ...prev, [projectId]: 'exporting' }));
    try {
      const pptxUrl = res.data.pptx_download_url;
      window.open(pptxUrl, '_blank');
      fetchProjects();
    } catch (err) {
      alert(`Export error: ${err.message}`);
    } finally {
      setActionLoading(prev => ({ ...prev, [projectId]: null }));
    }
  };

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.company_name && p.company_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (p.presenter && p.presenter.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (p.audience && p.audience.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            Presentation Decks
            <span className="badge badge-blue text-xs font-semibold py-1 px-3 bg-blue-600/30 text-blue-300 rounded-full border border-blue-500/30">
              {projects.length} Total Decks
            </span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Manage, edit, and export AI-generated executive presentation decks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={fetchProjects} 
            className="btn btn-secondary py-2.5 px-3 text-xs" 
            title="Refresh Projects"
          >
            <RefreshCw className={`w-4 h-4 text-gray-300 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={onCreateNew} 
            className="btn btn-primary py-2.5 px-5 text-sm"
          >
            <Plus className="w-5 h-5" />
            Create Presentation
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-panel p-4 mb-8 flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search presentation title, company name, presenter, or audience..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="glass-panel p-6 border-red-500/40 bg-red-950/20 text-center my-8">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-red-200 mb-1">Backend Server Disconnected</h3>
          <p className="text-sm text-red-300 max-w-md mx-auto mb-4">{error}</p>
          <button onClick={fetchProjects} className="btn btn-secondary text-xs">
            Retry Connection
          </button>
        </div>
      )}

      {/* Loading Grid */}
      {loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="glass-panel p-6 h-56 animate-pulse bg-gray-800/40 rounded-xl" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredProjects.length === 0 && (
        <div className="glass-panel p-12 text-center my-8 border-dashed border-gray-700">
          <div className="w-16 h-16 rounded-full bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Presentations Found</h3>
          <p className="text-gray-400 text-sm max-w-md mx-auto mb-6">
            {searchQuery ? 'No presentations match your search filter.' : 'Get started by creating your first presentation deck with GetSlideZ.'}
          </p>
          <button onClick={onCreateNew} className="btn btn-primary">
            <Plus className="w-4 h-4" />
            Create Presentation Deck
          </button>
        </div>
      )}

      {/* Projects Grid */}
      {!loading && !error && filteredProjects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div 
              key={project.id}
              onClick={() => onSelectProject(project)}
              className="glass-panel p-6 flex flex-col justify-between cursor-pointer group hover:border-cyan-500/40 transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`text-xs font-semibold py-0.5 px-2.5 rounded-full border ${
                    project.status === 'completed' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 
                    project.status === 'draft' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                  }`}>
                    {project.status === 'completed' ? 'PPTX Ready' : 'Draft Deck'}
                  </span>
                  
                  <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider bg-gray-800/80 px-2 py-0.5 rounded border border-white/5">
                    {project.input_type === 'upload' ? '📄 Document' : '💡 Prompt'}
                  </span>
                </div>

                <h3 className="font-bold text-lg text-white group-hover:text-cyan-300 transition-colors line-clamp-2 mb-2">
                  {project.name}
                </h3>

                <div className="text-xs font-semibold text-cyan-400 flex items-center gap-1 mb-4">
                  <Building className="w-3.5 h-3.5" />
                  <span>{project.company_name || 'Enterprise Solutions'}</span>
                </div>

                <div className="space-y-1.5 text-xs text-gray-400 mb-6">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                    <span className="truncate">Presenter: <strong className="text-gray-200">{project.presenter}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                    <span className="truncate">Target: <strong className="text-gray-200">{project.audience}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                    <span>Slide Count: <strong className="text-gray-200">{project.slide_count} Slides</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>Duration: <strong className="text-gray-200">{project.duration}</strong></span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-2" onClick={e => e.stopPropagation()}>
                <button 
                  onClick={() => onSelectProject(project)}
                  className="btn btn-secondary text-xs py-1.5 px-3 flex-1 justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Open Studio
                </button>

                <button 
                  onClick={(e) => handleExportQuick(project.id, e)}
                  disabled={actionLoading[project.id] === 'exporting'}
                  className="btn btn-secondary text-xs py-1.5 px-3 text-cyan-300 border-cyan-500/30 hover:bg-cyan-600 hover:text-white"
                  title="Quick Export PPTX"
                >
                  {actionLoading[project.id] === 'exporting' ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                </button>

                <button 
                  onClick={(e) => handleDelete(project.id, e)}
                  className="btn btn-secondary text-xs py-1.5 px-2.5 text-red-400 border-red-500/20 hover:bg-red-600 hover:text-white"
                  title="Delete Project"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
