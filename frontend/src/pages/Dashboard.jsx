import React from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { PenTool, FileText, ArrowRight, Brain, Cpu, Bot } from 'lucide-react';

const DashboardCard = ({ card, i, onNavigate }) => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), { stiffness: 300, damping: 30 });
    const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), { stiffness: 300, damping: 30 });

    function onMouseMove(e) {
        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseXCurrent = e.clientX - rect.left;
        const mouseYCurrent = e.clientY - rect.top;
        const xPct = mouseXCurrent / width - 0.5;
        const yPct = mouseYCurrent / height - 0.5;
        mouseX.set(xPct);
        mouseY.set(yPct);
        
        e.currentTarget.style.setProperty('--mouse-x', `${mouseXCurrent}px`);
        e.currentTarget.style.setProperty('--mouse-y', `${mouseYCurrent}px`);
    }

    function onMouseLeave() {
        mouseX.set(0);
        mouseY.set(0);
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.8 }}
            style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseLeave}
            className="group relative h-96 cursor-pointer"
            onClick={() => onNavigate(card.action)}
        >
            <div className="absolute inset-x-0 bottom-[-10px] h-4 mx-auto w-[90%] bg-black/40 blur-xl rounded-full transition-transform duration-500 group-hover:scale-110" />
            <div className="glass-prime h-full p-6 md:p-10 flex flex-col relative overflow-hidden group-hover:border-white/20 transition-colors duration-500">
                <div className="glow-overlay" />
                
                {/* Background Accent */}
                <div className={`absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br ${card.color} opacity-10 blur-3xl group-hover:opacity-30 transition-opacity duration-1000`} />
                
                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-10 shadow-2xl relative z-10 group-hover:scale-110 transition-transform duration-500`}>
                    <card.icon size={32} className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                    <div className="absolute inset-0 bg-white/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <div style={{ transform: 'translateZ(20px)' }} className="relative z-10">
                    <h3 className="text-2xl font-black mb-4 tracking-tight">{card.title}</h3>
                    <p className="text-white/50 text-base leading-relaxed mb-10 font-medium">
                        {card.description}
                    </p>
                </div>

                <div className="mt-auto relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-cyan-400 group-hover:border-cyan-500/20 transition-all duration-500">
                        Launch System <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const Dashboard = ({ onNavigate }) => {
    const cards = [
        {
            title: 'Content Engine',
            description: 'Intelligent content generation for blogs, emails, and social media with curated tones.',
            icon: PenTool,
            color: 'from-purple-600 to-indigo-600',
            action: 'generator'
        },
        {
            title: 'Doc Analyzer',
            description: 'Deep document processing with advanced summarization and semantic indexing.',
            icon: FileText,
            color: 'from-blue-600 to-cyan-600',
            action: 'analyzer'
        },
        {
            title: 'Aether AI',
            description: 'Universal AI conversational assistant for answering questions and general tasks.',
            icon: Bot,
            color: 'from-emerald-600 to-teal-600',
            action: 'qa'
        }
    ];

    return (
        <div className="space-y-16 py-6">
            <header className="relative">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute -left-20 -top-20 w-40 h-40 bg-purple-500/10 blur-[80px] rounded-full"
                />
                <motion.span 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400 mb-6"
                >
                    System Control Center
                </motion.span>
                <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl md:text-6xl font-black mb-4 tracking-tighter"
                >
                    Aurora <span className="gradient-text">Prime</span>
                </motion.h1>
                <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-white/40 text-lg font-medium max-w-2xl leading-relaxed"
                >
                    Orchestrating high-performance local LLMs for next-generation document processing and creative intelligence.
                </motion.p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 perspective-1000">
                {cards.map((card, i) => (
                    <DashboardCard key={card.title} card={card} i={i} onNavigate={onNavigate} />
                ))}
            </div>

            <motion.section 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="glass-prime p-6 md:p-10 relative overflow-hidden group"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                    <div className="flex flex-col sm:flex-row items-start gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-cyan-400 shrink-0">
                            <Brain size={32} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black mb-2 flex flex-wrap items-center gap-3">
                                Local Intelligence Protocol 
                                <span className="px-2 py-0.5 rounded text-[10px] bg-green-500/20 text-green-400 border border-green-500/20 uppercase tracking-widest font-black">Online</span>
                            </h3>
                            <p className="text-base text-white/50 font-medium max-w-xl">
                                System is currently utilizing <span className="text-white font-bold italic">llama3</span> via Ollama for secure, private-layer processing. Zero data escapes your local environment.
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-6 w-full md:w-auto">
                        <div className="flex -space-x-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="w-10 h-10 md:w-12 md:h-12 rounded-2xl border-4 border-[#020617] bg-white/5 backdrop-blur-md flex items-center justify-center text-[10px] font-black text-white/40 hover:text-cyan-400 hover:border-cyan-500/30 transition-all cursor-crosshair">
                                    {i === 1 ? <Cpu size={14} /> : 'V0' + i}
                                </div>
                            ))}
                        </div>
                        <button className="cyber-button w-full sm:w-auto bg-white text-[#020617] hover:bg-cyan-400 transition-colors uppercase text-xs tracking-tighter px-8">
                            Audit Logs
                        </button>
                    </div>
                </div>
            </motion.section>
        </div>
    );
};

export default Dashboard;
