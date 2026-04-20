import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Search, Trash2, ExternalLink, Copy, Check, MessageSquare, Wand2, Database, X } from 'lucide-react';
import { historyService } from '../services/historyService';
import toast from 'react-hot-toast';

const History = () => {
    const [history, setHistory] = useState([]);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [copiedId, setCopiedId] = useState(null);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        const data = await historyService.getHistory();
        setHistory(data);
    };

    const handleDelete = async (id) => {
        await historyService.deleteEntry(id);
        await loadHistory();
        toast.success('Entry removed');
    };

    const handleClear = async () => {
        if (window.confirm('Wipe all activity history? This cannot be undone.')) {
            await historyService.clearHistory();
            await loadHistory();
            toast.success('History cleared');
        }
    };

    const copyToClipboard = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        toast.success('Saved to clipboard');
        setTimeout(() => setCopiedId(null), 2000);
    };

    const filteredHistory = history.filter(item => {
        const matchesFilter = filter === 'all' || item.type === filter;
        const matchesSearch = searchTerm === '' || 
            JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const getTypeIcon = (type) => {
        switch (type) {
            case 'oracle': return <MessageSquare size={16} className="text-cyan-400" />;
            case 'generator': return <Wand2 size={16} className="text-purple-400" />;
            case 'analyzer': return <Database size={16} className="text-emerald-400" />;
            default: return <Clock size={16} />;
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-10 py-6">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-4 text-center md:text-left">
                    <motion.div 
                        initial={{ opacity: 0, x: -10 }} 
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-center md:justify-start gap-2 text-cyan-400 font-black text-[10px] uppercase tracking-[0.4em]"
                    >
                        <Clock size={12} fill="currentColor" /> Temporal Memory Ledger
                    </motion.div>
                    <h1 className="text-5xl font-black tracking-tighter">Activity <span className="gradient-text">History</span></h1>
                </div>

                <div className="flex items-center gap-3 bg-white/5 p-2 rounded-2xl border border-white/10 backdrop-blur-xl">
                    <button 
                        onClick={() => setFilter('all')}
                        className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'all' ? 'bg-white text-[#020617] shadow-lg' : 'text-white/40 hover:text-white'}`}
                    >
                        All
                    </button>
                    <button 
                        onClick={() => setFilter('oracle')}
                        className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'oracle' ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400' : 'text-white/40 hover:text-white'}`}
                    >
                        Aether
                    </button>
                    <button 
                        onClick={() => setFilter('generator')}
                        className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'generator' ? 'bg-purple-500/20 border-purple-500/40 text-purple-400' : 'text-white/40 hover:text-white'}`}
                    >
                        Studio
                    </button>
                    <button 
                        onClick={() => setFilter('analyzer')}
                        className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'analyzer' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'text-white/40 hover:text-white'}`}
                    >
                        Analyzer
                    </button>
                </div>
            </header>

            <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-cyan-400 transition-colors" size={20} />
                <input 
                    type="text"
                    placeholder="Search temporal streams..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-[2rem] pl-16 pr-8 py-6 text-white placeholder:text-white/10 focus:outline-none focus:border-cyan-500/50 transition-all font-medium text-lg backdrop-blur-xl shadow-2xl"
                />
                {history.length > 0 && (
                    <button 
                        onClick={handleClear}
                        className="absolute right-6 top-1/2 -translate-y-1/2 p-3 rounded-xl hover:bg-red-500/10 text-white/10 hover:text-red-400 transition-all"
                        title="Wipe Ledger"
                    >
                        <Trash2 size={20} />
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 gap-6">
                <AnimatePresence mode="popLayout">
                    {filteredHistory.length > 0 ? (
                        filteredHistory.map((item, idx) => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: idx * 0.05 }}
                                className="glass-prime group overflow-hidden border border-white/5 hover:border-white/20 transition-all duration-500"
                            >
                                <div className="p-8 flex flex-col gap-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                                                {getTypeIcon(item.type)}
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
                                                    {item.type} • {new Date(item.timestamp).toLocaleString()}
                                                </p>
                                                <h3 className="text-lg font-bold text-white/90 line-clamp-1">
                                                    {item.query || item.topic || item.filename || 'Activity Entry'}
                                                </h3>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => copyToClipboard(item.result || item.answer || item.doc_id, item.id)}
                                                className="p-3 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all"
                                                title="Copy Output"
                                            >
                                                {copiedId === item.id ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} />}
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(item.id)}
                                                className="p-3 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-red-400 transition-all"
                                                title="Forget Entry"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                            {getTypeIcon(item.type)}
                                        </div>
                                        {item.type === 'generator' && item.type_of_content?.includes('Image') ? (
                                            <div className="flex items-center gap-4">
                                                <img src={item.result} alt="Generated" className="w-20 h-20 rounded-xl object-cover border border-white/10" />
                                                <div className="flex-1 space-y-2">
                                                    <p className="text-[10px] font-black uppercase text-purple-400 tracking-widest">{item.type_of_content}</p>
                                                    <p className="text-sm font-medium text-white/60 line-clamp-2 italic">"{item.topic}"</p>
                                                </div>
                                                <a href={item.result} target="_blank" rel="noreferrer" className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
                                                    <ExternalLink size={20} />
                                                </a>
                                            </div>
                                        ) : item.type === 'analyzer' ? (
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-2">
                                                    <p className="text-sm font-medium text-white/80">{item.summary}</p>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded">Doc ID: {item.doc_id}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-base text-white/60 font-medium leading-relaxed italic line-clamp-3">
                                                "{item.answer || item.result || 'No content found'}"
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="h-64 flex flex-col items-center justify-center space-y-4 opacity-20">
                            <Clock size={48} />
                            <p className="text-xs font-black uppercase tracking-[0.5em]">Ledger is empty</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default History;
