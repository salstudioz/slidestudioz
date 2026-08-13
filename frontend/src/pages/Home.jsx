import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectService } from '../services/api';

const Home = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await projectService.listProjects();
      const rawData = Array.isArray(response.data) ? response.data : (response.data.data || []);
      setProjects(rawData);
    } catch (err) {
      console.error("Failed to fetch projects", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm("Apakah Anda yakin ingin menghapus proyek ini beserta seluruh slidenya?")) {
      try {
        await projectService.deleteProject(id);
        setProjects(prev => prev.filter(p => p.id !== id));
      } catch (err) {
        alert("Gagal menghapus proyek.");
      }
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'draft':
        return <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200/60 rounded-full text-xs font-bold inline-flex items-center shrink-0">Draft</span>;
      case 'completed':
      case 'generated':
        return <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-full text-xs font-bold inline-flex items-center shrink-0">Selesai</span>;
      default:
        return <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold shrink-0">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-full">
      {/* Header Card */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Riwayat Project</h2>
          <p className="text-xs text-slate-500 mt-1">Kelola, edit ulang, atau unduh hasil presentasi yang telah dibuat.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 shrink-0">
            Total {projects.length} Project
          </span>
          <Link to="/new" className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2.5 rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center text-sm shrink-0">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
            Buat Presentasi Baru
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400 font-medium animate-pulse bg-white rounded-2xl border border-slate-100">
          Memuat riwayat proyek...
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300 p-8 shadow-sm">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-600">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">Belum ada proyek dibuat</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">Mulai buat presentasi pertama Anda dengan bantuan kecerdasan buatan SlideStudioZ Engine.</p>
          <Link to="/new" className="inline-flex items-center bg-blue-600 text-white font-semibold px-5 py-2.5 rounded-xl shadow-md hover:bg-blue-700 transition-colors text-sm">
            Buat Presentasi Sekarang
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-50/80 text-slate-600 text-xs font-bold uppercase tracking-wider border-b border-slate-200/80">
                  <th className="p-4 pl-6 whitespace-nowrap">ID Project</th>
                  <th className="p-4 whitespace-nowrap">Topik / Perusahaan</th>
                  <th className="p-4 whitespace-nowrap">Target / Audiens</th>
                  <th className="p-4 whitespace-nowrap">Status</th>
                  <th className="p-4 pr-6 text-right whitespace-nowrap">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {projects.map((p) => (
                  <tr key={p.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="p-4 pl-6 font-mono text-xs font-semibold text-slate-400 whitespace-nowrap">{p.id}</td>
                    <td className="p-4 max-w-xs">
                      <div className="font-bold text-slate-900 line-clamp-2 leading-snug">{(p.topic || p.name || 'Untitled').split('\n')[0]}</div>
                      <div className="text-xs text-blue-600 font-semibold mt-0.5">{(p.company_name && p.company_name !== 'Enterprise Solutions' ? p.company_name : 'Enterprise Solutions')} • {p.purpose || p.input_type || 'Proposal'}</div>
                    </td>
                    <td className="p-4 text-slate-600 font-medium whitespace-nowrap">
                      <div>{p.audience}</div>
                      <div className="text-xs text-slate-400">{p.tone}</div>
                    </td>
                    <td className="p-4 whitespace-nowrap">{getStatusBadge(p.status)}</td>
                    <td className="p-4 pr-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-2">
                        <Link 
                          to={`/project/${p.id}/draft`} 
                          className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/60 rounded-lg font-bold text-xs transition-all flex items-center shrink-0"
                        >
                          Edit Slide
                        </Link>

                        {(p.status === 'completed' || p.status === 'generated') && (
                          <a 
                            href={`/api/projects/${p.id}/download?format=pptx`} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/60 rounded-lg font-bold text-xs transition-all shrink-0"
                          >
                            Download
                          </a>
                        )}

                        <button 
                          onClick={(e) => handleDelete(p.id, e)} 
                          className="px-3.5 py-1.5 bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 hover:border-rose-200 rounded-lg font-semibold text-xs transition-all shrink-0"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
