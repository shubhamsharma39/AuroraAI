import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Bot, Loader2, Zap, Trash2, MessageCircle } from 'lucide-react';
import { aiService } from '../services/api';
import { historyService } from '../services/historyService';
import toast from 'react-hot-toast';

const TypingMessage = ({ content }) => {
    const [displayedContent, setDisplayedContent] = useState('');
    
    useEffect(() => {
        let i = 0;
        const charsPerTick = Math.max(1, Math.floor(content.length / 100));
        const intervalId = setInterval(() => {
            setDisplayedContent(content.slice(0, i));
            i += charsPerTick;
            if (i > content.length) {
                setDisplayedContent(content);
                clearInterval(intervalId);
            }
        }, 15);
        return () => clearInterval(intervalId);
    }, [content]);

    return (
        <p className="text-base leading-relaxed whitespace-pre-wrap font-medium text-white/90">
            {displayedContent}
            {displayedContent.length < content.length && (
                <span className="inline-block flex-shrink-0 w-2 h-4 ml-1 bg-white/60 animate-pulse align-middle" />
            )}
        </p>
    );
};

const QASection = () => {
    const [question, setQuestion] = useState('');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages]);

    const handleAsk = async (e) => {
        e.preventDefault();
        if (!question.trim()) return;

        const userMsg = { role: 'user', content: question, timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setQuestion('');
        setLoading(true);

        try {
            const history = messages.map(m => ({ role: m.role, content: m.content }));
            const res = await aiService.universalChat({ 
                message: userMsg.content,
                history: history,
                attachments: [] // No attachments after removal
            });
            setMessages(prev => [...prev, { role: 'assistant', content: res.data.answer, timestamp: new Date() }]);
            
            // Log to local history
            historyService.saveEntry('oracle', { 
                query: userMsg.content, 
                answer: res.data.answer 
            });
        } catch (error) {
            const errorMsg = error.response?.data?.error || error.message || 'Unknown network error';
            toast.error(`Error: ${errorMsg}`);
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: `⚠️ I encountered a problem: ${errorMsg}. Please try again.`, 
                timestamp: new Date() 
            }]);
        } finally {
            setLoading(false);
        }
    };
    
    const clearChat = () => {
        setMessages([]);
        toast.success('Aether history cleared');
    };

    return (
        <div className="mx-auto flex flex-col space-y-8 max-w-5xl h-[calc(100vh-160px)] py-4">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <motion.div 
                        initial={{ opacity: 0, x: -10 }} 
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2 text-cyan-400 font-black text-[10px] uppercase tracking-[0.3em]"
                    >
                        <Zap size={12} fill="currentColor" /> Universal AI Assistant
                    </motion.div>
                    <h1 className="text-4xl font-black tracking-tighter">Aurora<span className="gradient-text">Aether</span></h1>
                </div>
            
                <div className="flex items-center gap-4">
                    <button 
                        onClick={clearChat}
                        className="p-3 rounded-2xl bg-white/5 border border-white/10 text-white/40 hover:text-red-400 hover:bg-red-400/10 hover:border-red-400/20 transition-all duration-300"
                        title="Clear Workspace"
                    >
                        <Trash2 size={20} />
                    </button>
                </div>
            </header>

            <div className="flex-1 glass-prime overflow-hidden flex flex-col relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-600/5 blur-[100px] pointer-events-none rounded-full" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/5 blur-[100px] pointer-events-none rounded-full" />

                <div 
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-10 space-y-10 scrollbar-hide relative z-10"
                >
                    {messages.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                            <motion.div 
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 flex items-center justify-center shadow-2xl"
                            >
                                <MessageCircle size={40} className="text-white/20" />
                            </motion.div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-white">Aurora Aether</h3>
                                <p className="text-sm text-white/30 max-w-sm font-medium leading-relaxed">
                                    How can I help you today? Consult Aether with any question.
                                </p>
                            </div>
                        </div>
                    )}
                    
                    <AnimatePresence mode="popLayout">
                        {messages.map((msg, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                className={`flex items-start gap-6 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                            >
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-2xl relative overflow-hidden group ${
                                    msg.role === 'user' 
                                    ? 'bg-gradient-to-br from-cyan-600 to-blue-700' 
                                    : 'bg-gradient-to-br from-purple-600 to-indigo-700'
                                }`}>
                                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    {msg.role === 'user' ? <User size={24} className="text-white" /> : <Bot size={24} className="text-white" />}
                                </div>
                                
                                <div className={`flex flex-col space-y-2 max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                    <div className={`p-6 rounded-[2rem] ${
                                        msg.role === 'user' 
                                        ? 'bg-cyan-600/10 border-cyan-500/20 rounded-tr-none' 
                                        : 'bg-white/5 border-white/10 rounded-tl-none'
                                    } border backdrop-blur-md shadow-xl`}>
                                        {msg.role === 'user' ? (
                                            <p className="text-base leading-relaxed whitespace-pre-wrap font-medium text-white/90">
                                                {msg.content}
                                            </p>
                                        ) : (
                                            <TypingMessage content={msg.content} />
                                        )}
                                    </div>
                                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest px-2">
                                        {msg.role === 'user' ? 'You' : 'Aether'} • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                        
                        {loading && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }} 
                                animate={{ opacity: 1, y: 0 }} 
                                className="flex items-center gap-6"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center shadow-2xl">
                                    <Loader2 className="animate-spin text-white" size={24} />
                                </div>
                                <div className="p-6 rounded-[2rem] rounded-tl-none bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-3">
                                    <div className="flex gap-1">
                                        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                                        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                                        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                                    </div>
                                    <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em]">Aether Insight...</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="p-8 bg-[#020617]/70 border-t border-white/5 backdrop-blur-2xl relative z-20">
                    <div className="max-w-4xl mx-auto flex flex-col space-y-3">
                        <form onSubmit={handleAsk} className="relative flex gap-4 w-full items-end">
                            <div className="relative flex-1 group flex bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl transition-all focus-within:border-cyan-500/50">
                                <textarea 
                                    rows="1"
                                    value={question}
                                    onChange={(e) => {
                                        setQuestion(e.target.value);
                                        e.target.style.height = 'auto';
                                        e.target.style.height = e.target.scrollHeight <= 200 ? e.target.scrollHeight + 'px' : '200px';
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleAsk(e);
                                            e.target.style.height = 'auto';
                                        }
                                    }}
                                    placeholder="Message Aether..."
                                    className="w-full bg-transparent p-5 text-white placeholder:text-white/30 focus:outline-none font-medium resize-none min-h-[60px] max-h-[200px] leading-relaxed scrollbar-hide"
                                />
                            </div>

                            <button 
                                type="submit"
                                disabled={loading || !question.trim()}
                                className={`cyber-button shrink-0 h-[60px] w-[60px] flex items-center justify-center p-0 rounded-2xl ${
                                    loading || !question.trim() 
                                    ? 'bg-white/5 text-white/20' 
                                    : 'bg-white text-[#020617] hover:bg-cyan-400'
                                }`}
                            >
                                <Send size={20} />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QASection;
