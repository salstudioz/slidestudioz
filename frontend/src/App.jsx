import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import NewProject from './pages/NewProject';
import DraftReview from './pages/DraftReview';
import Result from './pages/Result';
import { getUserId, resetUserId } from './services/api';

function App() {
  const [currentUserId, setCurrentUserId] = useState('');

  useEffect(() => {
    setCurrentUserId(getUserId());
  }, []);

  const handleResetUser = () => {
    if (window.confirm("Buat Workspace / User ID baru? Proyek di session ini tidak akan terhapus namun akan terpisah dari workspace baru.")) {
      const newId = resetUserId();
      setCurrentUserId(newId);
      window.location.href = "/";
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 flex flex-col">
        <header className="glass-header text-white border-b border-slate-800 sticky top-0 z-50 transition-all">
          <div className="container mx-auto flex justify-between items-center max-w-6xl px-6 py-3.5">
            <Link to="/" className="text-xl font-extrabold tracking-tight flex items-center hover:opacity-90 transition-opacity">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center mr-3 shadow-md shadow-blue-500/20">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <span>Slide<span className="gradient-text">StudioZ</span></span>
            </Link>

            <div className="flex items-center space-x-3 text-xs">
              <div 
                title={`User Workspace ID: ${currentUserId} (Isolasi data aktif)`}
                className="bg-slate-800/90 border border-slate-700/80 px-3 py-1.5 rounded-xl font-mono flex items-center text-slate-300 shadow-sm"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-pulse"></span>
                <span className="font-sans text-[11px] text-slate-400 mr-1.5 font-bold">Workspace:</span>
                <span className="font-semibold text-blue-400">{currentUserId ? currentUserId.slice(0, 14) : '...'}</span>
              </div>
              
              <button 
                onClick={handleResetUser}
                title="Ganti ke Workspace / User ID Baru"
                className="bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white px-2.5 py-1.5 rounded-xl border border-slate-700/80 transition-colors font-bold text-[11px]"
              >
                Switch Session
              </button>
            </div>
          </div>
        </header>
        
        <main className="container mx-auto px-6 py-8 max-w-6xl flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/new" element={<NewProject />} />
            <Route path="/project/:id/draft" element={<DraftReview />} />
            <Route path="/project/:id/result" element={<Result />} />
          </Routes>
        </main>

        <footer className="bg-white border-t border-slate-200/80 py-6 mt-16">
          <div className="container mx-auto max-w-6xl px-6 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500 gap-2">
            <div>&copy; {new Date().getFullYear()} SlideStudioZ AI Presentation Engine. All rights reserved.</div>
            <div className="flex items-center space-x-4 text-xs font-medium text-slate-400">
              <span>PPTX & PDF Render System</span>
              <span>•</span>
              <span>Design System AI</span>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
