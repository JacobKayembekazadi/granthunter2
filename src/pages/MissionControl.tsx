import React, { useState, useEffect } from 'react';
import OpportunityCard from '../components/OpportunityCard';
import NavigatorInterface from '../components/NavigatorInterface';
import { MOCK_OPPORTUNITIES } from '../data/mock';
import { 
  Globe, Shield, Target, Zap, Activity, AlertCircle, 
  Layers, Search, Plus, X, Save, Network, Database, Server,
  Sparkles, ArrowRight, MessageSquare, BarChart3, Clock
} from 'lucide-react';
import { Opportunity } from '../types';
import { toast } from 'sonner';

const MissionControl: React.FC = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>(MOCK_OPPORTUNITIES);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeDots, setActiveDots] = useState<{x: number, y: number}[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOpp, setEditingOpp] = useState<Opportunity | null>(null);
  const [formData, setFormData] = useState<Partial<Opportunity>>({
    title: '', agency: '', value: '', dueDate: '', status: 'new', matchScore: 85, naicsCode: '', description: ''
  });

  useEffect(() => {
    const generateDots = () => {
      const dots = Array.from({length: 8}, () => ({
        x: Math.floor(Math.random() * 100),
        y: Math.floor(Math.random() * 100)
      }));
      setActiveDots(dots);
    };
    generateDots();
    const timer = setInterval(generateDots, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleOpenModal = (opp?: Opportunity) => {
    if (opp) {
      setEditingOpp(opp);
      setFormData(opp);
    } else {
      setEditingOpp(null);
      setFormData({
        title: '', agency: '', value: '', dueDate: new Date().toISOString().split('T')[0], status: 'new', matchScore: 85, naicsCode: '', description: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (editingOpp) {
      setOpportunities(prev => prev.map(o => o.id === editingOpp.id ? { ...o, ...formData } as Opportunity : o));
      toast.success("Opportunity updated.");
    } else {
      setOpportunities(prev => [{ id: Math.random().toString(36).substr(2, 9), ...(formData as Opportunity) }, ...prev]);
      toast.success("New opportunity added.");
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-gradient-to-r from-blue-900/10 via-slate-900/40 to-slate-900/10 border border-blue-500/10 rounded-2xl p-6 relative overflow-hidden">
         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
               <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-[10px] font-bold uppercase rounded-md border border-blue-500/30">AI Insights</span>
               </div>
               <h2 className="text-xl font-bold text-white leading-tight">
                  Welcome back. There are <span className="text-blue-400">3 new leads</span> in the DARPA sector that match your expertise.
               </h2>
               <p className="text-sm text-slate-400">
                  The "Drone Swarm Control" project was recently updated. Would you like to review the new requirements?
               </p>
            </div>
            <div className="flex items-center space-x-3">
               <button className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-blue-900/40 flex items-center space-x-2 transition-all">
                  <span>Review Leads</span>
                  <ArrowRight className="w-4 h-4" />
               </button>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
        <div className="lg:col-span-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatusTile icon={Network} label="ACTIVE USERS" value="1.2M" sub="GLOBAL" color="blue" />
          <StatusTile icon={Database} label="DATA INDEXED" value="84PB" sub="TOTAL" color="emerald" />
          <StatusTile icon={Clock} label="SYSTEM UPTIME" value="99.9%" sub="LIVE" color="purple" />
          <StatusTile icon={Target} label="NEW LEADS" value={opportunities.length.toString()} sub="THIS WEEK" color="amber" />
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center space-x-3">
               <div className="h-4 w-1 bg-blue-500 rounded-full"></div>
               <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest">Opportunity Feed</h3>
            </div>
            <button 
              onClick={() => handleOpenModal()}
              className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600/10 border border-blue-500/20 text-blue-400 rounded text-[10px] font-bold hover:bg-blue-600/20 transition-all uppercase"
            >
              <Plus className="w-3 h-3" />
              <span>Add Opportunity</span>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {opportunities.map(opp => (
              <OpportunityCard 
                key={opp.id} 
                data={opp} 
                onSelect={setSelectedId} 
                onEdit={handleOpenModal}
                onDelete={(id) => setOpportunities(prev => prev.filter(o => o.id !== id))}
              />
            ))}
          </div>

          <div className="bg-[#0B1221]/60 border border-slate-800 rounded-xl p-6 relative overflow-hidden h-64 tech-border">
             <div className="absolute top-4 left-4 z-10 flex items-center space-x-2">
                <Globe className="w-4 h-4 text-blue-500 animate-spin-slow" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Global Activity Map</span>
             </div>
             <div className="relative h-full w-full flex items-center justify-center opacity-40">
                {activeDots.map((dot, i) => (
                  <div 
                    key={i} 
                    className="absolute w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,1)]"
                    style={{ left: `${dot.x}%`, top: `${dot.y}%` }}
                  >
                    <div className="absolute -inset-2 bg-blue-400/20 rounded-full animate-ping"></div>
                  </div>
                ))}
                <BarChart3 className="w-32 h-32 text-slate-800" />
             </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="sticky top-0 space-y-6">
            <NavigatorInterface />
            
            <div className="bg-[#0B1221]/80 border border-slate-800 rounded-xl p-6 h-[460px] flex flex-col tech-border relative overflow-hidden shadow-2xl">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 border-b border-slate-800 pb-2 flex items-center">
                <BarChart3 className="w-3 h-3 mr-2 text-blue-400" />
                <span>Opportunity Analysis</span>
              </h3>
              
              {selectedId ? (
                <div className="flex-1 overflow-auto space-y-4 scrollbar-hide">
                  <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded font-mono text-[10px] text-blue-400">
                    Analysis complete. Context loaded.
                  </div>
                  <div className="bg-slate-950/40 p-4 rounded border border-slate-800">
                     <p className="text-[10px] text-slate-500 uppercase font-bold mb-2">Project Summary</p>
                     <p className="text-xs text-slate-300 leading-relaxed">
                       "{opportunities.find(o => o.id === selectedId)?.description}"
                     </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                     <div className="bg-slate-900/50 p-3 rounded border border-slate-800 text-center">
                        <div className="text-[8px] text-slate-600 uppercase mb-1">Win Probability</div>
                        <div className="text-lg font-bold text-emerald-400">82%</div>
                     </div>
                     <div className="bg-slate-900/50 p-3 rounded border border-slate-800 text-center">
                        <div className="text-[8px] text-slate-600 uppercase mb-1">Risk Level</div>
                        <div className="text-lg font-bold text-amber-400">LOW</div>
                     </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-600 text-[10px] font-mono text-center p-8">
                  <Layers className="w-12 h-12 mb-4 opacity-10" />
                  <p className="tracking-widest leading-loose">
                    SELECT AN OPPORTUNITY<br/>TO START ANALYSIS
                  </p>
                </div>
              )}
              
              {selectedId && (
                <div className="mt-auto pt-4 flex gap-2">
                   <button className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all">Create Proposal Draft</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
           <div className="bg-[#0B1221] border border-slate-700 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden tech-border">
              <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
                 <h3 className="text-sm font-bold text-white uppercase tracking-widest">New Opportunity Details</h3>
                 <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5 text-slate-500 hover:text-white" /></button>
              </div>
              <div className="p-6 space-y-4">
                 <div className="space-y-1">
                    <label className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Project Title</label>
                    <input 
                      placeholder="e.g., Drone Swarm Phase II" 
                      value={formData.title} 
                      onChange={e => setFormData({...formData, title: e.target.value})} 
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-slate-200 focus:border-blue-500 outline-none" 
                    />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Agency</label>
                    <input 
                      placeholder="e.g., DARPA" 
                      value={formData.agency} 
                      onChange={e => setFormData({...formData, agency: e.target.value})} 
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-slate-200 focus:border-blue-500 outline-none" 
                    />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Description</label>
                    <textarea 
                      placeholder="Briefly describe the objective..." 
                      value={formData.description} 
                      onChange={e => setFormData({...formData, description: e.target.value})} 
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-slate-200 h-24 focus:border-blue-500 outline-none resize-none" 
                    />
                 </div>
              </div>
              <div className="px-6 py-4 bg-slate-950/50 border-t border-slate-800 flex justify-end gap-3">
                 <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-500 uppercase hover:text-white transition-colors">Cancel</button>
                 <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded text-xs font-bold uppercase tracking-widest transition-all">Save Changes</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const StatusTile: React.FC<{ icon: any, label: string, value: string, sub: string, color: string }> = ({ icon: Icon, label, value, sub, color }) => {
  const colors: any = {
    blue: 'text-blue-500 border-blue-500/20 bg-blue-500/5',
    emerald: 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5',
    purple: 'text-purple-500 border-purple-500/20 bg-purple-500/5',
    amber: 'text-amber-500 border-amber-500/20 bg-amber-500/5',
  };
  return (
    <div className={`p-4 border rounded-xl ${colors[color]} relative group transition-all`}>
      <div className="flex justify-between items-center mb-1">
        <span className="text-[9px] font-bold tracking-widest text-slate-500 uppercase">{label}</span>
        <Icon className="w-4 h-4 opacity-40" />
      </div>
      <div className="flex items-baseline space-x-2">
        <span className="text-2xl font-bold tracking-tighter">{value}</span>
        <span className="text-[9px] font-bold text-slate-600 uppercase">{sub}</span>
      </div>
    </div>
  );
};

export default MissionControl;