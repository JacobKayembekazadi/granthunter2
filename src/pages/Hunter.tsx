
import React, { useState } from 'react';
import { 
  Radar, Plus, Search, Trash2, Play, Pause, 
  X, Zap, Cpu, Signal, ChevronRight, Activity, Target, ShieldCheck,
  Sparkles, TrendingUp, BarChart3, History, Globe, Brain, RefreshCw, Layers
} from 'lucide-react';
import { toast } from 'sonner';
import { GoogleGenAI, Type } from "@google/genai";

interface Suggestion {
  id: string;
  type: 'optimization' | 'expansion' | 'source';
  title: string;
  description: string;
  confidence: number;
  reasoning: string;
  impact: 'High' | 'Medium' | 'Low';
  suggestedValue?: string;
  marketIntel?: string;
  historicalPrecedent?: { title: string; agency: string; value: string };
}

interface Agent {
  id: string;
  name: string;
  target: string;
  status: 'Active' | 'Paused' | 'Learning';
  hits: number;
  lastRun: string;
  suggestions: Suggestion[];
}

const Hunter: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([
    { 
      id: 'AG-99', 
      name: 'Global Energy Sweep', 
      target: 'NAICS 541512, 541715', 
      status: 'Active', 
      hits: 142, 
      lastRun: '2m ago',
      suggestions: [
        {
          id: 's1',
          type: 'expansion',
          title: 'Cross-index with ARPA-E',
          description: 'Historical wins in this NAICS often derive from ARPA-E research grants transitioning to DOE production.',
          confidence: 92,
          reasoning: 'AI detected 14 similar contract pathways in Q3-Q4 2024.',
          impact: 'High',
          marketIntel: 'Market saturation for clean energy swarms is currently low (12% competitive overlap).',
          historicalPrecedent: { title: 'Clean Grid Phase IV', agency: 'DOE', value: '$45M' }
        }
      ]
    },
    { id: 'AG-01', name: 'DARPA Swarm Monitor', target: 'Keywords: Swarm, Drone', status: 'Learning', hits: 12, lastRun: '15m ago', suggestions: [] },
  ]);
  
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [newAgent, setNewAgent] = useState({ name: '', target: '' });

  const selectedAgent = agents.find(a => a.id === selectedId);

  const generateAutonomousInsights = async () => {
    if (!selectedAgent) return;
    setIsAnalyzing(true);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Analyze this Government Contracting Search Target: "${selectedAgent.target}". 
      Provide 2 advanced strategic suggestions for improving this search agent.
      Return exactly as a JSON array of objects with keys: title, description, confidence (0-100), reasoning, impact (High/Medium/Low), suggestedValue (the updated search string), marketIntel, historicalPrecedent (object with title, agency, value).`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                confidence: { type: Type.NUMBER },
                reasoning: { type: Type.STRING },
                impact: { type: Type.STRING },
                suggestedValue: { type: Type.STRING },
                marketIntel: { type: Type.STRING },
                historicalPrecedent: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    agency: { type: Type.STRING },
                    value: { type: Type.STRING }
                  }
                }
              }
            }
          }
        }
      });

      const newSuggestions: Suggestion[] = JSON.parse(response.text || '[]').map((s: any) => ({
        ...s,
        id: Math.random().toString(36).substr(2, 9),
        type: 'optimization'
      }));

      setAgents(prev => prev.map(a => 
        a.id === selectedId ? { ...a, suggestions: [...newSuggestions, ...a.suggestions] } : a
      ));
      
      toast.success("Autonomous Intelligence Sync Complete");
    } catch (err) {
      console.error(err);
      toast.error("Intelligence Fetch Failed");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applySuggestion = (sug: Suggestion) => {
    if (!selectedAgent || !sug.suggestedValue) return;
    setAgents(prev => prev.map(a => 
      a.id === selectedAgent.id ? { 
        ...a, 
        target: sug.suggestedValue!, 
        suggestions: a.suggestions.filter(s => s.id !== sug.id) 
      } : a
    ));
    toast.success("Strategic Parameters Updated");
  };

  const handleCreateAgent = () => {
    if (!newAgent.name) return toast.error("Identity Required");
    const id = `AG-${Math.floor(Math.random()*90)+10}`;
    setAgents([...agents, { ...newAgent, id, status: 'Active', hits: 0, lastRun: 'Just now', suggestions: [] }]);
    setIsAdding(false);
    setNewAgent({ name: '', target: '' });
    toast.success("Autonomous Node Activated");
  };

  return (
    <div className="h-full flex flex-col gap-10 animate-in fade-in duration-500 pb-20">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        <StatPill icon={Activity} label="Live Scans" value="03" color="volt" />
        <StatPill icon={Target} label="Leads Yield" value="1,245" color="white" />
        <StatPill icon={Radar} label="Total Scanned" value="842K" color="white" />
        <StatPill icon={ShieldCheck} label="Node Status" value="Online" color="volt" />
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-10 min-h-0">
        <div className={`${selectedId ? 'lg:col-span-5' : 'lg:col-span-12'} flex flex-col gap-8 transition-all duration-700`}>
          <div className="spatial-card flex flex-col h-full overflow-hidden">
            <div className="p-10 border-b border-white/5 flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <div className="w-2 h-8 bg-volt rounded-full shadow-volt-aura" />
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Search Fleet</h3>
               </div>
              <button 
                onClick={() => setIsAdding(true)}
                className="p-5 bg-volt text-black rounded-full shadow-volt-aura hover:scale-110 transition-transform"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-auto scrollbar-hide p-8 space-y-6">
              {agents.map(agent => (
                <div 
                  key={agent.id}
                  onClick={() => setSelectedId(agent.id)}
                  className={`p-8 rounded-[2rem] cursor-pointer transition-all flex items-center justify-between group
                    ${selectedId === agent.id ? 'bg-volt shadow-volt-aura text-black' : 'bg-space-950/40 hover:bg-white/5 text-slate-400 border border-white/5 shadow-inner-depth'}
                  `}
                >
                  <div className="flex items-center gap-8">
                    <div className={`p-5 rounded-[1.5rem] shadow-inner-depth ${selectedId === agent.id ? 'bg-black/10' : 'bg-space-900'}`}>
                      <Cpu className={`w-8 h-8 ${selectedId === agent.id ? 'text-black' : 'text-volt'}`} />
                    </div>
                    <div>
                      <div className="text-lg font-black uppercase tracking-tight">{agent.name}</div>
                      <div className={`text-[11px] font-bold uppercase tracking-widest mt-1 opacity-60`}>
                        Yield: {agent.hits} // Node ID: {agent.id}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className={`w-6 h-6 ${selectedId === agent.id ? 'text-black' : 'text-slate-700'}`} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {selectedAgent && (
          <div className="lg:col-span-7 animate-in fade-in slide-in-from-right-10 duration-700">
            <div className="spatial-card flex flex-col h-full relative">
              <div className="p-10 border-b border-white/5 flex items-center justify-between bg-space-950/20">
                <div className="flex items-center gap-8">
                  <div className="p-6 rounded-[2rem] bg-volt text-black shadow-volt-aura">
                    <Activity className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter">{selectedAgent.name}</h2>
                    <div className="text-[11px] font-bold text-slate-600 uppercase tracking-[0.3em] flex items-center gap-3 mt-1">
                      <Signal className="w-4 h-4 text-volt" /> Intelligence Feed Live
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                   <button 
                    onClick={generateAutonomousInsights}
                    disabled={isAnalyzing}
                    className="p-4 bg-space-900 border border-white/10 rounded-full text-volt hover:bg-volt hover:text-black transition-all"
                   >
                     <RefreshCw className={`w-5 h-5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                   </button>
                   <button onClick={() => setSelectedId(null)} className="p-3 text-slate-500 hover:text-white transition-colors">
                     <X className="w-8 h-8" />
                   </button>
                </div>
              </div>

              <div className="flex-1 p-10 space-y-12 overflow-auto scrollbar-hide">
                <div className="space-y-6">
                   <div className="flex justify-between items-center">
                    <h4 className="text-[12px] font-black text-slate-500 uppercase tracking-widest">Autonomous Parameters</h4>
                    <span className="text-[10px] font-bold text-volt uppercase tracking-widest">Active Search Vector</span>
                   </div>
                  <div className="p-8 bg-space-950 border border-white/5 shadow-inner-depth rounded-[2rem] text-volt font-mono text-sm leading-relaxed italic opacity-80">
                    "{selectedAgent.target}"
                  </div>
                </div>

                {/* ADVANCED SUGGESTION ENGINE */}
                <div className="space-y-8">
                   <div className="flex items-center justify-between">
                      <h4 className="text-[12px] font-black text-white uppercase tracking-widest flex items-center gap-3">
                        <Sparkles className="w-4 h-4 text-volt" />
                        Autonomous Insights
                      </h4>
                      {selectedAgent.suggestions.length > 0 && (
                        <span className="text-[9px] font-black text-slate-500 uppercase px-3 py-1 border border-white/5 rounded-full">
                          {selectedAgent.suggestions.length} Optimized Pathways Found
                        </span>
                      )}
                   </div>

                   {isAnalyzing ? (
                      <div className="p-12 space-y-6 text-center">
                         <div className="w-24 h-1 bg-space-900 mx-auto rounded-full overflow-hidden">
                            <div className="h-full bg-volt animate-marquee w-1/2" />
                         </div>
                         <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.5em] animate-pulse">
                            Deep Scanning Historical Win Patterns...
                         </p>
                      </div>
                   ) : selectedAgent.suggestions.length === 0 ? (
                      <div className="p-12 spatial-card !bg-transparent border-dashed border-white/5 text-center flex flex-col items-center">
                         <Brain className="w-12 h-12 text-slate-800 mb-6" />
                         <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest leading-loose">
                            Agent currently in learning mode.<br/>Click the sync icon to trigger analysis.
                         </p>
                      </div>
                   ) : (
                      <div className="grid grid-cols-1 gap-6">
                         {selectedAgent.suggestions.map((sug) => (
                           <div key={sug.id} className="spatial-card p-10 bg-space-950/40 hover:border-volt/20 transition-all space-y-8 group">
                              <div className="flex justify-between items-start">
                                 <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                       <div className="px-3 py-1 bg-volt/10 border border-volt/20 rounded-full text-[9px] font-black text-volt uppercase tracking-widest">
                                          {sug.type}
                                       </div>
                                       <div className="flex items-center gap-1">
                                          {[1, 2, 3].map(i => (
                                            <div key={i} className={`w-1 h-3 rounded-full ${i === 3 ? 'bg-slate-800' : 'bg-volt'}`} />
                                          ))}
                                          <span className="text-[9px] font-black text-slate-600 uppercase ml-2 tracking-widest">{sug.impact} IMPACT</span>
                                       </div>
                                    </div>
                                    <h5 className="text-xl font-black text-white uppercase tracking-tight group-hover:text-volt transition-colors">{sug.title}</h5>
                                 </div>
                                 <div className="text-right">
                                    <div className="text-3xl font-black text-white text-volt-glow">{sug.confidence}%</div>
                                    <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-1">Confidence Score</div>
                                 </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6 border-y border-white/5">
                                 <div className="space-y-4">
                                    <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Strategic Reasoning</div>
                                    <p className="text-xs text-slate-300 leading-relaxed italic border-l-2 border-volt/30 pl-4">
                                       "{sug.reasoning}"
                                    </p>
                                 </div>
                                 <div className="space-y-4">
                                    <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Market Intelligence</div>
                                    <p className="text-xs text-slate-300 leading-relaxed">
                                       {sug.marketIntel || "Cross-referencing similar performance profiles across DARPA and DOE databases..."}
                                    </p>
                                 </div>
                              </div>

                              {sug.historicalPrecedent && (
                                 <div className="p-6 bg-space-950/80 rounded-[1.5rem] border border-white/5">
                                    <div className="flex items-center gap-3 mb-4">
                                       <History className="w-4 h-4 text-volt" />
                                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Historical Win Pattern Identified</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                       <div>
                                          <div className="text-sm font-black text-white uppercase">{sug.historicalPrecedent.title}</div>
                                          <div className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mt-1">
                                             Agency: {sug.historicalPrecedent.agency} // Value: {sug.historicalPrecedent.value}
                                          </div>
                                       </div>
                                       <div className="px-4 py-2 bg-space-900 border border-white/5 rounded-full text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                          Success Cloned
                                       </div>
                                    </div>
                                 </div>
                              )}

                              {sug.suggestedValue && (
                                 <button 
                                  onClick={() => applySuggestion(sug)}
                                  className="w-full volt-btn !rounded-[1.5rem] !py-4 !text-[11px] flex items-center justify-center gap-4"
                                 >
                                    <Sparkles className="w-4 h-4" />
                                    Apply Strategic Update
                                 </button>
                              )}
                           </div>
                         ))}
                      </div>
                   )}
                </div>
                
                <div className="pt-12 border-t border-white/5 flex gap-6">
                  <button className="spatial-btn flex-1 !rounded-[2rem] !py-6">Force Real-time Scan</button>
                  <button 
                    onClick={() => setAgents(agents.filter(a => a.id !== selectedAgent.id))}
                    className="px-12 py-6 rounded-[2rem] bg-red-500/10 border border-red-500/20 text-red-500 text-[12px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                  >
                    Purge Node
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Agent Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-12 bg-black/95 backdrop-blur-3xl animate-in fade-in duration-300">
          <div className="spatial-card w-full max-w-2xl p-16 space-y-12">
            <div className="flex justify-between items-center">
               <h3 className="text-3xl font-black text-white uppercase tracking-tighter">New Autonomous Hunter</h3>
               <button onClick={() => setIsAdding(false)}><X className="w-8 h-8 text-slate-500" /></button>
            </div>
            <div className="space-y-10">
               <div className="space-y-4">
                  <label className="text-[12px] font-black text-slate-500 uppercase tracking-widest pl-4">Node Identifier</label>
                  <input 
                    className="w-full spatial-input !py-6" 
                    placeholder="e.g., DARPA Daily Pipeline Scan"
                    value={newAgent.name}
                    onChange={e => setNewAgent({...newAgent, name: e.target.value})}
                  />
               </div>
               <div className="space-y-4">
                  <label className="text-[12px] font-black text-slate-500 uppercase tracking-widest pl-4">Neural Search Vector</label>
                  <textarea 
                    className="w-full spatial-input h-48 resize-none !py-6" 
                    placeholder="Enter keywords, NAICS codes, or agency identifiers..."
                    value={newAgent.target}
                    onChange={e => setNewAgent({...newAgent, target: e.target.value})}
                  />
               </div>
               <button onClick={handleCreateAgent} className="spatial-btn w-full !py-6 !rounded-[2.5rem]">Initialize Sovereign Search</button>
               <button onClick={() => setIsAdding(false)} className="w-full text-[12px] font-black text-slate-600 uppercase tracking-widest hover:text-white transition-colors">Abort Cycle</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatPill: React.FC<{ icon: any, label: string, value: string, color: string }> = ({ icon: Icon, label, value, color }) => (
  <div className="spatial-card p-8 flex items-center gap-8 group hover:border-volt/30 transition-all">
    <div className={`p-5 rounded-[1.5rem] shadow-inner-depth ${color === 'volt' ? 'text-volt text-volt-glow' : 'text-slate-600'}`}>
      <Icon className="w-8 h-8" />
    </div>
    <div>
      <div className="text-3xl font-black text-white tracking-tight">{value}</div>
      <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{label}</div>
    </div>
  </div>
);

export default Hunter;
