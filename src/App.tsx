import React, { useEffect, useState, useMemo } from 'react';
import { 
  TrendingUp, TrendingDown, Activity, ShieldAlert, Target, 
  Menu, RefreshCcw, Info, ArrowUpRight, ArrowDownRight,
  BarChart3, BrainCircuit, Zap, Upload, ImageIcon, FileWarning,
  CheckCircle2, Gauge, Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

import { ChartAnalysis } from './types';
import { analyzeChartImage } from './services/geminiService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [image, setImage] = useState<{file: File, preview: string} | null>(null);
  const [analysis, setAnalysis] = useState<ChartAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [history, setHistory] = useState<ChartAnalysis[]>([]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage({
          file,
          preview: reader.result as string
        });
        setAnalysis(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage({
          file,
          preview: reader.result as string
        });
        setAnalysis(null);
      };
      reader.readAsDataURL(file);
    }
  };

  async function runVisualAnalysis() {
    if (!image) return;
    
    try {
      setAnalyzing(true);
      // Remove data:image/xxx;base64, prefix
      const base64Data = image.preview.split(',')[1];
      const result = await analyzeChartImage(base64Data, image.file.type);
      setAnalysis(result);
      setHistory(prev => [result, ...prev].slice(0, 10));
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setAnalyzing(false);
    }
  }

  const reset = () => {
    setImage(null);
    setAnalysis(null);
  };

  return (
    <div className="flex h-screen bg-[#0f1115] text-slate-200 overflow-hidden font-sans">
      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className="w-72 border-r border-[#2d3748] bg-[#1a1d23] relative z-20 flex flex-col"
          >
            <div className="p-6 border-bottom border-[#2d3748]">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <Zap className="text-white w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-white">ChartSage</h1>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-indigo-400 font-mono">Vision Engine</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-6">
              <h2 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-4 px-2">Analysis History</h2>
              <div className="space-y-4">
                {history.length === 0 ? (
                  <div className="py-8 text-center px-4">
                    <p className="text-xs text-slate-600 italic">No recent scans detected. Secure analysis active.</p>
                  </div>
                ) : (
                  history.map((h, i) => (
                    <div key={i} className="p-3 bg-[#0f1115] rounded-lg border border-[#2d3748] space-y-2">
                       <div className="flex items-center justify-between">
                         <span className={cn(
                            "text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-tighter",
                            h.dailyTrend === 'up' ? "bg-emerald-500/10 text-emerald-500" :
                            h.dailyTrend === 'down' ? "bg-rose-500/10 text-rose-500" : "bg-slate-500/10 text-slate-400"
                         )}>
                           {h.dailyTrend} Trend
                         </span>
                         <span className="text-[10px] text-slate-500 font-mono">{h.confidence}% Conf.</span>
                       </div>
                       <p className="text-[11px] text-slate-400 line-clamp-2">{h.explanation}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            <div className="p-4 border-t border-[#2d3748]">
              <div className="bg-indigo-950/30 border border-indigo-500/20 p-3 rounded-lg">
                <p className="text-[10px] text-indigo-400 leading-relaxed font-medium">
                  Analysis is generated in real-time using Gemini Vision Pro LLM.
                </p>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 relative grid-bg">
        {/* Header */}
        <header className="h-20 border-b border-[#2d3748] bg-[#1a1d23]/80 backdrop-blur-md flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-slate-700 rounded-md transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex flex-col">
              <h2 className="text-lg font-bold text-white tracking-tight">Chart Analysis Desktop</h2>
              <p className="text-[10px] text-indigo-400 font-mono uppercase tracking-widest">Awaiting visual input telemetry</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {image && (
              <button 
                onClick={reset}
                className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-2 border border-[#2d3748] px-4 py-2 rounded-md transition-all"
              >
                Clear Scene
              </button>
            )}
            <button 
              onClick={runVisualAnalysis}
              disabled={!image || analyzing}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-6 py-2 rounded-md font-bold text-sm transition-all shadow-lg shadow-indigo-500/20"
            >
              {analyzing ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <BrainCircuit className="w-4 h-4" />}
              {analyzing ? 'Computing Scenarios...' : 'Run Analysis'}
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto space-y-8">
            {!image ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center min-h-[60vh] space-y-6"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
              >
                <div className="w-full max-w-2xl bg-[#1a1d23] border-2 border-dashed border-[#2d3748] rounded-3xl p-12 flex flex-col items-center justify-center text-center group hover:border-indigo-500/50 transition-all cursor-pointer relative overflow-hidden">
                  <div className="absolute inset-0 bg-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="w-20 h-20 bg-indigo-600/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform relative z-10">
                    <Upload className="text-indigo-500 w-10 h-10" />
                  </div>
                  
                  <div className="space-y-2 relative z-10">
                    <h3 className="text-2xl font-bold text-white">Import Telemetry Image</h3>
                    <p className="text-slate-500 text-sm max-w-md mx-auto">
                      Drag and drop your stock chart, trend screen, or technical graph. Our vision engine will extract patterns and forecast trajectory.
                    </p>
                  </div>

                  <label className="mt-8 relative z-10">
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleFileUpload}
                    />
                    <span className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-500/30 cursor-pointer">
                      Select Files
                    </span>
                  </label>
                  
                  <div className="mt-8 flex gap-8 text-slate-600 relative z-10">
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold">
                       <CheckCircle2 className="w-3 h-3" /> PNG/JPG
                    </div>
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold">
                       <CheckCircle2 className="w-3 h-3" /> Ultra HD
                    </div>
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold">
                       <CheckCircle2 className="w-3 h-3" /> Encrypted
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: Image Feed */}
                <div className="lg:col-span-12 xl:col-span-8 flex flex-col gap-6">
                  <section className="bg-[#1a1d23] border border-[#2d3748] rounded-2xl overflow-hidden shadow-2xl relative group">
                    <div className="absolute top-4 left-4 z-20 flex gap-2">
                       <div className="bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1 rounded text-[10px] font-mono text-white flex items-center gap-2 uppercase">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> Source Feed
                       </div>
                    </div>
                    
                    <div className="min-h-[400px] flex items-center justify-center p-4 bg-[#0f1115]">
                      <img 
                        src={image.preview} 
                        alt="Target Chart" 
                        className="max-w-full max-h-[600px] rounded shadow-2xl border border-white/5"
                      />
                    </div>
                    
                    {!analysis && !analyzing && (
                       <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <button 
                           onClick={runVisualAnalysis}
                           className="bg-white text-black px-8 py-3 rounded-full font-bold flex items-center gap-3 hover:scale-105 transition-transform"
                         >
                           <BrainCircuit className="w-5 h-5" /> Execute Scanalaysis
                         </button>
                       </div>
                    )}
                  </section>

                  {analysis && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-[#1a1d23] border border-[#2d3748] p-6 rounded-2xl">
                         <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Patterns Loaded</p>
                         <div className="flex flex-wrap gap-2">
                           {analysis.patternsDetected.map((p, i) => (
                             <span key={i} className="text-[10px] bg-slate-800 text-slate-300 px-3 py-1 rounded-full border border-white/5">
                               {p}
                             </span>
                           ))}
                         </div>
                      </div>
                      <div className="bg-[#1a1d23] border border-[#2d3748] p-6 rounded-2xl">
                         <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Market Volatility</p>
                         <div className="flex items-center gap-4">
                           <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                              <div 
                                className={cn(
                                  "h-full transition-all duration-1000",
                                  analysis.volatility === 'low' ? "w-1/3 bg-emerald-500" :
                                  analysis.volatility === 'medium' ? "w-2/3 bg-amber-500" : "w-full bg-rose-500"
                                )} 
                              />
                           </div>
                           <span className="text-xs font-bold text-white uppercase">{analysis.volatility}</span>
                         </div>
                      </div>
                      <div className="bg-[#1a1d23] border border-[#2d3748] p-6 rounded-2xl">
                         <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">AI Integrity</p>
                         <div className="flex items-center gap-3">
                           <Gauge className="w-5 h-5 text-indigo-400" />
                           <span className="text-xl font-mono font-bold text-white">{analysis.confidence}%</span>
                         </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: Results Panel */}
                <div className="lg:col-span-12 xl:col-span-4 space-y-6">
                  <section className="bg-[#1a1d23] border border-[#2d3748] rounded-2xl overflow-hidden shadow-2xl">
                    <div className="bg-indigo-600 p-6">
                      <div className="flex items-center justify-between text-white">
                        <div className="flex items-center gap-3">
                          <Activity className="w-6 h-6" />
                          <h3 className="font-bold tracking-tight">Signal Report</h3>
                        </div>
                        <span className="text-[10px] font-mono opacity-80">VERIFIED ANALYTICS</span>
                      </div>
                    </div>

                    <div className="p-8">
                      {!analysis && analyzing ? (
                        <div className="py-12 flex flex-col items-center justify-center text-center gap-6">
                           <div className="relative">
                             <RefreshCcw className="w-16 h-16 text-indigo-500 animate-spin" />
                             <BrainCircuit className="w-8 h-8 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                           </div>
                           <div className="space-y-2">
                             <h4 className="text-white font-bold">Scanning Vertices...</h4>
                             <p className="text-xs text-slate-500 px-8">Extracting candle patterns and projecting volatility vectors.</p>
                           </div>
                        </div>
                      ) : analysis ? (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="space-y-8"
                        >
                          <div className="flex items-center justify-between bg-[#0f1115] p-6 rounded-2xl border border-[#2d3748] relative overflow-hidden">
                             <div className={cn(
                               "absolute inset-y-0 left-0 w-2",
                               analysis.dailyTrend === 'up' ? "bg-emerald-500" :
                               analysis.dailyTrend === 'down' ? "bg-rose-500" : "bg-slate-500"
                             )} />
                             <div>
                               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Forecast Direction</p>
                               <div className="flex items-center gap-3">
                                 {analysis.dailyTrend === 'up' ? <TrendingUp className="text-emerald-500 w-8 h-8" /> : 
                                  analysis.dailyTrend === 'down' ? <TrendingDown className="text-rose-500 w-8 h-8" /> : 
                                  <Layers className="text-slate-400 w-8 h-8" />}
                                 <span className={cn(
                                   "text-3xl font-black uppercase tracking-tighter",
                                   analysis.dailyTrend === 'up' ? "text-emerald-400" :
                                   analysis.dailyTrend === 'down' ? "text-rose-400" : "text-white"
                                 )}>
                                   {analysis.dailyTrend}
                                 </span>
                               </div>
                             </div>
                             <div className="text-right">
                               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Scoring</p>
                               <p className="text-2xl font-mono font-bold text-white">{analysis.confidence}%</p>
                             </div>
                          </div>

                          <div className="space-y-6">
                            <div className="space-y-3">
                              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Info className="w-3 h-3 text-indigo-500" /> Strategic Explanation
                              </h4>
                              <p className="text-sm text-slate-300 leading-relaxed font-medium bg-white/5 p-4 rounded-xl">
                                {analysis.explanation}
                              </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                               <div className="space-y-3">
                                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Resistance</h4>
                                  <div className="space-y-2">
                                    {analysis.resistanceLevels.map((l, i) => (
                                      <div key={i} className="bg-rose-500/10 border border-rose-500/20 p-2 rounded text-rose-400 text-xs font-mono font-bold">
                                        {l}
                                      </div>
                                    ))}
                                  </div>
                               </div>
                               <div className="space-y-3">
                                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Support</h4>
                                  <div className="space-y-2">
                                    {analysis.supportLevels.map((l, i) => (
                                      <div key={i} className="bg-emerald-500/10 border border-emerald-500/20 p-2 rounded text-emerald-400 text-xs font-mono font-bold">
                                        {l}
                                      </div>
                                    ))}
                                  </div>
                               </div>
                            </div>
                          </div>

                          <div className="pt-8 border-t border-[#2d3748]">
                             <button 
                               onClick={reset}
                               className="w-full py-4 rounded-xl border border-[#2d3748] text-xs font-bold uppercase tracking-widest text-slate-500 hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                             >
                               <RefreshCcw className="w-3 h-3" /> Analyze New Target
                             </button>
                          </div>
                        </motion.div>
                      ) : (
                        <div className="py-24 text-center space-y-6">
                           <div className="w-20 h-20 bg-slate-800/50 rounded-full mx-auto flex items-center justify-center">
                              <Target className="w-10 h-10 text-slate-600" />
                           </div>
                           <div className="space-y-2">
                             <h4 className="text-white font-bold italic">Awaiting Scene Analysis</h4>
                             <p className="text-xs text-slate-500 leading-relaxed px-12">
                               Image detected. Secure a stable connection and click "Run Analysis" to initialize the vision engine.
                             </p>
                           </div>
                        </div>
                      )}
                    </div>
                  </section>

                  <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex gap-3">
                    <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-amber-500 uppercase tracking-wider">Trading Advisory</p>
                      <p className="text-[10px] text-amber-500/70 leading-relaxed">
                        Visual analysis is speculative. Do not base financial decisions solely on AI output. ChartSage is for educational telemetry only.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
