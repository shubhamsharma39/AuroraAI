import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Copy, Check, Loader2, Wand2, MessageSquare, BookOpen, Quote, ChevronDown, Zap } from 'lucide-react';
import { aiService } from '../services/api';
import { historyService } from '../services/historyService';
import toast from 'react-hot-toast';

const ContentGenerator = () => {
    const [topic, setTopic] = useState('');
    const [tone, setTone] = useState('Creative');
    const [type, setType] = useState('Short Video Hook');
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const tones = [
        { name: 'Creative', icon: Wand2, color: 'text-purple-400' },
        { name: 'Funny', icon: Quote, color: 'text-orange-400' },
        { name: 'Epic', icon: Sparkles, color: 'text-emerald-400' },
        { name: 'Sarcastic', icon: MessageSquare, color: 'text-rose-400' }
    ];

    const types = ['Image Concept', 'Anime Art', 'Short Video Hook', 'Meme Idea', 'Voiceover Script'];

    const handleGenerate = async () => {
        if (!topic) return toast.error('Please enter a topic');
        
        setLoading(true);
        setResult('');
        try {
            const res = await aiService.generateContent({ topic, tone, type });
            setResult(res.data.content);
            
            // Log to local history
            historyService.saveEntry('generator', { 
                topic: topic, 
                tone: tone, 
                type_of_content: type,
                result: res.data.content 
            });
            
            toast.success('Synthesis complete!');
        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Synthesis failed. Is the engine active?';
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(result);
        setCopied(true);
        toast.success('Stored in clipboard');
        setTimeout(() => setCopied(false), 2000);
    };

    const downloadMedia = () => {
        const link = document.createElement('a');
        link.href = result;
        const extension = isVideo ? 'mp4' : 'png';
        link.download = `aurora-${type.toLowerCase().replace(' ', '-')}.${extension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const isImage = typeof result === 'string' && result.trim().startsWith('http') && (result.includes('pollinations') || result.trim().match(/\.(jpeg|jpg|gif|png)$/i) != null);
    const isVideo = typeof result === 'string' && result.trim().startsWith('http') && result.trim().match(/\.(mp4|webm|ogg)$/i) != null;

    return (
        <div className="max-w-5xl mx-auto space-y-12 py-6">
            <header className="text-center space-y-4">
                <motion.div 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center gap-2 text-purple-400 font-black text-[10px] uppercase tracking-[0.4em]"
                >
                    <Sparkles size={14} /> Creative Protocol 8.0
                </motion.div>
                <h1 className="text-3xl md:text-5xl font-black tracking-tighter">Content <span className="gradient-text">Studio</span></h1>
                <p className="text-white/40 text-sm md:text-lg font-medium max-w-xl mx-auto">
                    Multi-modal generative suite for high-fidelity text, image, and video synthesis.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
                {/* Configuration Sidebar */}
                <div className="lg:col-span-5 space-y-8">
                    <div className="glass-prime p-8 space-y-10 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 to-cyan-600 opacity-30" />
                        
                        <div className="space-y-4">
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                                <MessageSquare size={12} className="text-purple-400" /> Topic Vector
                            </label>
                            <div className="relative">
                                <textarea 
                                    rows={4}
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    placeholder="Describe your vision (e.g., A cyberpunk city in 2077)..."
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white placeholder:text-white/10 focus:outline-none focus:border-purple-500/50 transition-all font-medium resize-none shadow-inner"
                                />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                                <Wand2 size={12} className="text-cyan-400" /> Synthesis tone
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {tones.map((t) => (
                                    <button
                                        key={t.name}
                                        onClick={() => setTone(t.name)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-300 ${
                                            tone === t.name 
                                            ? 'bg-purple-500/20 border-purple-500/40 text-white' 
                                            : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'
                                        }`}
                                    >
                                        <t.icon size={16} className={tone === t.name ? t.color : 'text-current'} />
                                        <span className="text-xs font-bold">{t.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                                <BookOpen size={12} className="text-blue-400" /> Output format
                            </label>
                            <div className="relative group/select">
                                <select 
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-6 pr-14 py-5 text-white placeholder:text-white/10 focus:outline-none focus:border-blue-500/50 transition-all font-bold appearance-none cursor-pointer"
                                >
                                    {types.map(t => (
                                        <option key={t} value={t} className="bg-[#020617]">{t}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-white/30 group-focus-within/select:rotate-180 transition-transform" size={20} />
                            </div>
                        </div>

                        <button 
                            onClick={handleGenerate}
                            disabled={loading}
                            className={`w-full h-[70px] rounded-2xl font-black text-sm uppercase tracking-[0.3em] transition-all duration-500 flex items-center justify-center gap-4 group/btn ${
                                loading 
                                ? 'bg-white/5 text-white/20' 
                                : 'bg-white text-[#020617] hover:bg-cyan-400 hover:shadow-[0_0_40px_rgba(34,211,238,0.3)] shadow-2xl'
                            }`}
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={24} />
                            ) : (
                                <>
                                    <Zap size={20} className="fill-current group-hover/btn:scale-125 transition-transform" />
                                    Launch Synthesis
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Output Area */}
                <div className="lg:col-span-7 h-full">
                    <div className="glass-prime h-full min-h-[600px] flex flex-col relative overflow-hidden group/output">
                        <div className="flex flex-col sm:flex-row justify-between items-center p-6 md:p-8 border-b border-white/5 gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400">Synthesis Terminal</h2>
                            </div>
                            {result && (
                                <div className="flex flex-wrap gap-2 justify-center">
                                    {(isImage || isVideo) ? (
                                        <button 
                                            onClick={downloadMedia}
                                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all"
                                        >
                                            <Sparkles size={16} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Download Asset</span>
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={copyToClipboard}
                                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all"
                                        >
                                            {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                                            <span className="text-[10px] font-black uppercase tracking-widest">Capture Text</span>
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex-1 p-6 md:p-10 flex flex-col overflow-y-auto scrollbar-hide">
                            <AnimatePresence mode="wait">
                                {loading ? (
                                    <motion.div 
                                        key="loading"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="h-full flex flex-col items-center justify-center space-y-8"
                                    >
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-purple-500/20 blur-3xl rounded-full scale-150 animate-pulse" />
                                            <Loader2 className="animate-spin text-purple-400 relative z-10" size={64} />
                                        </div>
                                        <div className="text-center space-y-2">
                                            <p className="text-xl font-bold text-white uppercase tracking-widest animate-pulse">Neural Threading Active</p>
                                            <p className="text-sm text-white/20 font-black uppercase tracking-[0.4em]">Multimodal Layer • Secure Local Inference</p>
                                        </div>
                                    </motion.div>
                                ) : result ? (
                                    <motion.div 
                                        key="result"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="h-full flex flex-col items-center justify-center"
                                    >
                                        {isImage ? (
                                            <div className="relative group/img max-w-lg flex flex-col items-center gap-4">
                                                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-[2.5rem] blur opacity-25 group-hover/img:opacity-50 transition duration-1000"></div>
                                                <img 
                                                    src={result} 
                                                    alt="AI Generated" 
                                                    className="relative rounded-[2rem] border border-white/10 shadow-2xl w-full h-auto animate-in fade-in zoom-in duration-1000"
                                                    onLoad={() => toast.success('Media localized!')}
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        toast.error('Failed to load media directly in browser.');
                                                    }}
                                                />
                                                <a href={result} target="_blank" rel="noreferrer" className="relative z-10 text-cyan-400 hover:text-cyan-300 text-xs font-bold underline underline-offset-4">
                                                    Open Asset in New Tab
                                                </a>
                                            </div>
                                        ) : isVideo ? (
                                            <div className="relative group/vid w-full max-w-2xl px-4 flex flex-col items-center gap-4">
                                                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-[2.5rem] blur opacity-25 group-hover/vid:opacity-50 transition duration-1000"></div>
                                                <video 
                                                    src={result} 
                                                    controls 
                                                    autoPlay 
                                                    muted 
                                                    className="relative rounded-[2rem] border border-white/10 shadow-2xl w-full"
                                                />
                                                <a href={result} target="_blank" rel="noreferrer" className="relative z-10 text-cyan-400 hover:text-cyan-300 text-xs font-bold underline underline-offset-4">
                                                    Open Asset in New Tab
                                                </a>
                                            </div>
                                        ) : (
                                            <div className="w-full font-medium text-lg leading-relaxed text-white/80 whitespace-pre-wrap selection:bg-purple-500/30">
                                                {result}
                                            </div>
                                        )}
                                    </motion.div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center opacity-10 space-y-6">
                                        <Wand2 size={80} strokeWidth={1} />
                                        <p className="text-xs font-black uppercase tracking-[0.5em]">Awaiting topic vector input</p>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Decorative Footer */}
                        <div className="p-6 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
                            <div className="flex gap-1">
                                {[1, 2, 3].map(i => <div key={i} className="w-1 h-3 rounded-full bg-white/10" />)}
                            </div>
                            <span className="text-[8px] font-black text-white/10 uppercase tracking-[0.5em]">Secure Multimodal Layer v2.0.0</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContentGenerator;
