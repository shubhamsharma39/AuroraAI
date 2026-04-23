import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileUp, CheckCircle2, X, FileText, Search, Zap, Loader2, Database } from 'lucide-react';
import { aiService } from '../services/api';
import { historyService } from '../services/historyService';
import toast from 'react-hot-toast';


const DocumentAnalyzer = ({ setCurrentDocId, onNavigate }) => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    const onDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) setFile(droppedFile);
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) setFile(selectedFile);
    };

    const handleUpload = async () => {
        if (!file) return toast.error('Please select a file first');
        
        setLoading(true);
        setResult(null);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await aiService.uploadDocument(formData);
            setResult(res.data);
            setCurrentDocId(res.data.doc_id);

            // Log to local history
            historyService.saveEntry('analyzer', { 
                filename: res.data.filename, 
                doc_id: res.data.doc_id,
                summary: res.data.summary 
            });

            toast.success('Vectorization complete!');
        } catch {
            toast.error('Analysis failed. Ensure file format is supported.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-12 py-6">
            <header className="flex flex-col items-center justify-center text-center space-y-4">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }} 
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center justify-center gap-2 text-cyan-400 font-black text-[10px] uppercase tracking-[0.4em]"
                >
                    <Database size={14} /> Data Ingestion Layer
                </motion.div>
                <h1 className="text-5xl font-black tracking-tighter">Document <span className="gradient-text">Analyzer</span></h1>
                <p className="text-white/40 text-lg font-medium max-w-xl mx-auto leading-relaxed">
                    High-performance semantic vectorization for massive PDF, Docx, and TXT volumes.
                </p>
            </header>

            {!result ? (
                <div className="max-w-3xl mx-auto">
                    <motion.div 
                        layout
                        className={`relative group h-[400px] rounded-[3rem] border-2 border-dashed transition-all duration-500 flex flex-col items-center justify-center space-y-8 overflow-hidden ${
                            isDragging 
                            ? 'bg-cyan-500/10 border-cyan-400 scale-[1.02] shadow-[0_0_50px_rgba(6,182,212,0.2)]' 
                            : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                        }`}
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={onDrop}
                    >
                        {/* Decorative Background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                        
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 relative">
                                <div className="absolute inset-x-0 bottom-[-10px] h-4 mx-auto w-[80%] bg-cyan-900/40 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                <FileUp size={40} className={`transition-colors duration-500 ${isDragging ? 'text-cyan-400' : 'text-white/20 group-hover:text-white'}`} />
                            </div>
                            
                            <div className="text-center space-y-2">
                                <h3 className="text-xl font-bold text-white">
                                    {isDragging ? 'Relinquish File Now' : file ? file.name : 'Target Document Connection'}
                                </h3>
                                <p className="text-sm font-medium text-white/30 truncate max-w-[300px]">
                                    {file ? `Size: ${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Drop payload or browse local clusters'}
                                </p>
                            </div>
                        </div>

                        {!loading && (
                            <div className="relative z-10 flex gap-4">
                                <label className="cyber-button bg-white text-[#020617] hover:bg-cyan-400 cursor-pointer text-xs font-black uppercase tracking-widest px-8">
                                    Browse Cluster
                                    <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.docx,.txt" />
                                </label>
                                {file && (
                                    <button 
                                        onClick={handleUpload}
                                        className="cyber-button bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black uppercase tracking-widest px-8"
                                    >
                                        Execute Injection
                                    </button>
                                )}
                            </div>
                        )}

                        {loading && (
                            <div className="relative z-10 flex flex-col items-center space-y-4">
                                <Loader2 className="animate-spin text-cyan-400" size={40} />
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400 animate-pulse">Analyzing Neural Pathways...</p>
                            </div>
                        )}
                        
                        {/* Status Footer */}
                        <div className="absolute bottom-6 left-0 w-full px-10 flex justify-between items-center opacity-20">
                            <span className="text-[8px] font-black uppercase tracking-widest">Supported: PDF / DOCX / TXT</span>
                            <span className="text-[8px] font-black uppercase tracking-widest">Local-First Encryption</span>
                        </div>
                    </motion.div>
                </div>
            ) : (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-4xl mx-auto space-y-8"
                >
                    <div className="glass-prime overflow-hidden">
                        <div className="bg-gradient-to-r from-emerald-600/20 to-cyan-600/20 p-8 border-b border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                                    <CheckCircle2 size={32} className="text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black tracking-tight">Injection Successful</h2>
                                    <p className="text-white/50 text-sm font-bold uppercase tracking-widest">Document Vectorized & Indexed</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => { setFile(null); setResult(null); }}
                                className="p-3 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-10 space-y-12">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-4">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Target Identity</p>
                                    <div className="flex items-center gap-3">
                                        <FileText className="text-cyan-400" size={24} />
                                        <h3 className="text-lg font-bold truncate">{result.filename}</h3>
                                    </div>
                                </div>
                                <div className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-4">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Access Token (Doc ID)</p>
                                    <div className="flex items-center justify-between">
                                        <code className="text-cyan-400 font-mono font-black text-xl">{result.doc_id}</code>
                                        <div className="flex gap-4">
                                            <button 
                                                onClick={() => { navigator.clipboard.writeText(result.doc_id); toast.success('Token copied'); }}
                                                className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors"
                                            >
                                                Copy
                                            </button>
                                            <button 
                                                onClick={() => onNavigate('qa')}
                                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600/20 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-600 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest"
                                            >
                                                <Zap size={14} fill="currentColor" />
                                                Consult Aether
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <Zap size={16} fill="currentColor" className="text-cyan-400" />
                                    <h3 className="text-xs font-black uppercase tracking-[0.3em]">Core Synthesis Summary</h3>
                                </div>
                                <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/10 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-5">
                                        <Search size={120} />
                                    </div>
                                    <p className="text-lg leading-relaxed text-white/80 font-medium relative z-10 italic">
                                        "{result.summary}"
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default DocumentAnalyzer;
