import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import ContentGenerator from './pages/ContentGenerator';
import DocumentAnalyzer from './pages/DocumentAnalyzer';
import QASection from './pages/QASection';
import History from './pages/History';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentDocId, setCurrentDocId] = useState(null);

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
      
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 ml-72 p-10 max-w-7xl mx-auto w-full relative z-10 transition-all duration-500">
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
