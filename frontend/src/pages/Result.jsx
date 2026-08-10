import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projectService } from '../services/api';

const Result = () => {
  const { id } = useParams();
  const [status, setStatus] = useState('generating');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    let timer;
    if (status === 'generating') {
      timer = setInterval(() => {
        setProgress(old => {
          if (old >= 90) {
            clearInterval(timer);
            return 90;
          }
          return old + 10;
        });
      }, 1000);
    }

    const generatePPTX = async () => {
      try {
        await projectService.generateFinal(id);
        setStatus('done');
        setProgress(100);
        clearInterval(timer);
      } catch (err) {
        console.error(err);
        setStatus('error');
        setError('Gagal menghasilkan PPTX & PDF.');
        clearInterval(timer);
      }
    };

    generatePPTX();

    return () => clearInterval(timer);
  }, [id]);

  return (
    <div className="max-w-3xl mx-auto space-y-6 mt-6">
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/80 p-10 text-center relative overflow-hidden">
        {status === 'generating' && (
          <div className="py-10 space-y-6">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner border border-blue-100 animate-bounce">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
            </div>

            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">Menyusun Presentasi Anda...</h2>
              <p className="text-xs text-slate-500 mt-1">Engine AI SlideStudioZ sedang mengolah gambar cerdas, tata letak 16:9, dan dokumen akhir.</p>
            </div>

            <div className="max-w-md mx-auto">
              <div className="w-full bg-slate-100 rounded-full h-3 mb-3 overflow-hidden border border-slate-200/80">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
              </div>
              <p className="text-xs font-bold text-blue-600 animate-pulse">
                {progress < 40 ? 'Membuat aset gambar cerdas...' : progress < 80 ? 'Merender layout PPTX & PDF dengan Design System...' : 'Finalisasi dokumen akhir...'}
              </p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="py-10 space-y-6">
            <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto border border-rose-100">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <h2 className="text-2xl font-bold text-rose-600">Terjadi Kesalahan Render</h2>
            <p className="text-sm text-slate-600">{error}</p>
            <Link to={`/project/${id}/draft`} className="inline-flex items-center px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-sm transition-all">Kembali ke Draft</Link>
          </div>
        )}

        {status === 'done' && (
          <div className="py-6 space-y-6">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto border border-emerald-200 shadow-lg shadow-emerald-500/10">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
            </div>

            <div>
              <div className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 mb-2">
                ✓ Render Berhasil Dituntaskan
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900">Presentasi Siap Diunduh!</h2>
              <p className="text-slate-500 text-sm mt-1">Dokumen PPTX & PDF 16:9 telah dioptimasi dan siap digunakan untuk presentasi.</p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <a 
                href={`http://localhost:8000/api/projects/${id}/download?format=pptx`}
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-600/30 transition-all font-extrabold text-sm flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                Download PPTX
              </a>
              <a 
                href={`http://localhost:8000/api/projects/${id}/download?format=pdf`}
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-600/30 transition-all font-extrabold text-sm flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                Download PDF
              </a>
              <Link to={`/project/${id}/draft`} className="px-6 py-3.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-xl font-extrabold text-sm transition-all flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                Edit Slide Ulang
              </Link>
              <Link to="/" className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-sm transition-all flex items-center">
                Beranda
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Result;
