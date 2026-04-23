import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import ContentGenerator from './pages/ContentGenerator';
import DocumentAnalyzer from './pages/DocumentAnalyzer';
import QASection from './pages/QASection';
import History from './pages/History';
import { Menu, X } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentDocId, setCurrentDocId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onNavigate={setActiveTab} />;
      case 'generator':
        return <ContentGenerator />;
      case 'analyzer':
        return <DocumentAnalyzer setCurrentDocId={setCurrentDocId} onNavigate={setActiveTab} />;
      case 'qa':
        return <QASection docId={currentDocId} />;
      case 'history':
        return <History />;
      default:
        return <Dashboard onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#020617] text-slate-100 overflow-x-hidden selection:bg-cyan-500/30">
      <Toaster position="top-right" toastOptions={{
        style: {
          background: 'rgba(15, 23, 42, 0.8)',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(12px)',
          borderRadius: '16px',
          fontFamily: 'Outfit'
        }
      }} />
      
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => { setActiveTab(tab); setSidebarOpen(false); }} 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-20 px-6 glass-morphism z-40 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center border border-white/10 text-cyan-400">
                  <span className="font-black text-xl">A</span>
              </div>
              <h1 className="text-lg font-black tracking-tighter">AURORA<span className="text-cyan-400 text-sm">AI</span></h1>
          </div>
          <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-3 rounded-xl bg-white/5 border border-white/10 text-white/60 active:scale-95 transition-all"
          >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
      </div>
      
      <main className="flex-1 lg:ml-72 p-6 md:p-10 mt-20 lg:mt-0 max-w-7xl mx-auto w-full relative z-10 transition-all duration-500">
        <div className="max-w-6xl mx-auto">
          {renderContent()}
        </div>
      </main>

      {/* Immersive Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] bg-purple-600/15 blur-[140px] rounded-full animate-float" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] bg-cyan-600/15 blur-[140px] rounded-full animate-float" style={{ animationDelay: '-3s' }} />
        <div className="absolute top-[30%] left-[40%] w-[30%] h-[30%] bg-brand-magenta/5 blur-[100px] rounded-full animate-pulse" style={{ animationDuration: '10s' }} />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 contrast-150 brightness-150 pointer-events-none" />
      </div>
    </div>
  );
}

export default App;
