import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Layers, Plus } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="glass-header text-white border-b border-slate-800 sticky top-0 z-50 transition-all">
      <div className="container mx-auto flex justify-between items-center max-w-6xl px-6 py-3.5">
        <Link to="/" className="text-xl font-extrabold tracking-tight flex items-center hover:opacity-90 transition-opacity">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center mr-3 shadow-md shadow-blue-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span>Get<span className="gradient-text">SlideZ</span></span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to="/new"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2 px-4 rounded-lg transition-all shadow-md shadow-blue-600/20"
          >
            <Plus className="w-4 h-4" />
            New Deck
          </Link>
        </div>
      </div>
    </header>
  );
}
