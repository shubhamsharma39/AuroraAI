import React from 'react';
import { motion } from 'framer-motion';
import { PenTool, FileText, LayoutDashboard, Zap, Activity, Bot, Clock } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
    const menuItems = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { id: 'generator', icon: PenTool, label: 'Generator' },
        { id: 'analyzer', icon: FileText, label: 'Analyzer' },
        { id: 'qa', icon: Bot, label: 'Aether' },
        { id: 'history', icon: Clock, label: 'History' },
    ];

    return (
        <aside className="w-72 glass-morphism h-[calc(100vh-40px)] fixed left-5 top-5 bottom-5 flex flex-col p-8 z-50 rounded-[2rem] border-white/10 shadow-2xl">
            <div className="flex items-center gap-4 mb-14 px-2">
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative w-11 h-11 bg-[#020617] rounded-xl flex items-center justify-center border border-white/10">
                        <Zap size={22} className="text-cyan-400 fill-cyan-400/20" />
                    </div>
                </div>
                <div>
                    <h1 className="text-xl font-black tracking-tighter leading-none">AURORA<span className="text-cyan-400 underline decoration-purple-500/50 decoration-4 underline-offset-4">AI</span></h1>
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mt-1 ml-0.5">Prime Edition</p>
                </div>
            </div>

            <nav className="flex-1 space-y-2 relative">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full relative group flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-500 ${
                            activeTab === item.id 
                            ? 'text-white' 
                            : 'text-white/40 hover:text-white/80'
                        }`}
                    >
                        {activeTab === item.id && (
                            <motion.div 
                                layoutId="active-pill"
                                className="absolute inset-0 bg-white/10 border border-white/10 rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.02)]"
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            />
                        )}
                        <item.icon size={20} className={`relative z-10 transition-colors duration-500 ${activeTab === item.id ? 'text-cyan-400' : ''}`} />
                        <span className="font-bold text-sm tracking-wide relative z-10">{item.label}</span>
                        
                        {activeTab === item.id && (
                            <motion.div 
                                layoutId="active-indicator"
                                className="absolute right-4 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]"
                            />
                        )}
                    </button>
                ))}
            </nav>

            <div className="mt-auto pt-8 border-t border-white/5 space-y-4">
                <div className="p-5 glass-card bg-cyan-500/5 border-cyan-500/10 group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-20">
                        <Activity size={14} className="animate-pulse text-cyan-400" />
                    </div>
                    <p className="text-[10px] font-black text-cyan-400/60 uppercase tracking-widest mb-2">Engine Status</p>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)] animate-pulse" />
                        <p className="text-xs font-bold text-white/70">Ollama Connected</p>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
