import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import NewProject from './pages/NewProject';
import DraftReview from './pages/DraftReview';
import Result from './pages/Result';

function App() {
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
