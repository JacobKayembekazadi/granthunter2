import React, { useState, useEffect, useRef } from 'react';
import MissionControl from './MissionControl';
import Hunter from './Hunter';
import Factory from './Factory';
import Artifacts from './Artifacts';
import Settings from './Settings';
import { 
  Search, Filter, ShieldAlert, Cpu, LayoutDashboard, 
  Radar, Factory as FactoryIcon, FolderOpen, Settings as SettingsIcon,
  Wifi, Activity, Globe, ChevronRight, Bell,
  Zap, Database, Server, Lock, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

type View = 'Overview' | 'Search Agents' | 'Proposal Center' | 'Files' | 'Settings';

const Dashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('Overview');
  const [time, setTime] = useState(new Date());
  const [commandText, setCommandText] = useState('');
  const [logs, setLogs] = useState<string[]>([
    'System ready.',
    'Secure connection established.',
    'AI analysis engine online.',
    'All search agents active.',
  ]);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const logPool = [
      'Scanning SAM.gov for new leads...',
      'Optimizing proposal draft...',
      'New opportunity identified in DARPA sector.',
      'Data backup completed.',
      'Checking compliance requirements...',
    ];
    const timer = setInterval(() => {
      setLogs(prev => [...prev, logPool[Math.floor(Math.random() * logPool.length)]].slice(-6));
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const navItems: { id: View; icon: React.FC<any>; label: string }[] = [
    { id: 'Overview', icon: LayoutDashboard, label: 'OVERVIEW' },
    { id: 'Search Agents', icon: Radar, label: 'SEARCH AGENTS' },
    { id: 'Proposal Center', icon: FactoryIcon, label: 'PROPOSAL CENTER' },
    { id: 'Files', icon: FolderOpen, label: 'FILES' },
    { id: 'Settings', icon: SettingsIcon, label: 'SETTINGS' },
  ];

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandText.trim()) return;
    
    setLogs(prev => [...prev, `Action: ${commandText}`, 'Processing request...']);
    setCommandText('');
    
    toast.info("Assistant: " + commandText, {
      description: "Interpreting request and routing to appropriate section.",
      icon: <Sparkles className="w-4 h-4 text-blue-400" />
    });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#050A14] text-slate-100 font-sans relative">
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-30">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.02)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>
      
      <aside className="w-72 bg-[#0B1221]/95 border-r border-slate-800 flex flex-col z-20 tech-border">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center space-x-3 mb-2">
            <ShieldAlert className="w-8 h-8 text-blue-500" />
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white glow-blue">
                GRANTHUNTER
              </h1>
              <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">
                Contracting Platform
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2 mt-4 px-3 py-1.5 bg-blue-500/5 border border-blue-500/10 rounded text-[10px] text-blue-400">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse"></span>
            <span>SYSTEM: ONLINE</span>
          </div>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-1">
          <div className="px-2 mb-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest">Navigation</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button 
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between group
                  ${isActive
                    ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' 
                    : 'text-slate-500 hover:text-slate-200 border border-transparent'}
                `}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-600'}`} />
                  <span className="tracking-wide">{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3 h-3 text-blue-500" />}
              </button>
            );
          })}
        </nav>

        <div className="px-4 py-3 bg-black/20 border-t border-slate-800 font-mono text-[10px] text-slate-500 h-32 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-2 text-slate-600 border-b border-slate-800 pb-1">
            <span>ACTIVITY LOG</span>
          </div>
          <div className="space-y-1 flex-1 overflow-y-auto scrollbar-hide">
            {logs.map((log, i) => (
              <div key={i} className="flex items-start">
                <span className="mr-2 opacity-50">{'>'}</span>
                <span>{log}</span>
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 bg-[#070C18]">
          <div className="grid grid-cols-2 gap-2 mb-4">
            <MetricBox label="PROCESSING" value="Normal" color="text-emerald-400" icon={Cpu} />
            <MetricBox label="CONNECTION" value="Secure" color="text-blue-400" icon={Server} />
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative overflow-hidden z-10">
        <header className="h-16 bg-[#0B1221]/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-6 z-20">
          <form onSubmit={handleCommand} className="flex-1 max-w-2xl relative">
             <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-slate-500" />
             </div>
             <input 
               type="text" 
               value={commandText}
               onChange={(e) => setCommandText(e.target.value)}
               placeholder="Find opportunities, draft proposals, or ask a question..." 
               className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl pl-12 pr-4 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition-all"
             />
          </form>

          <div className="flex items-center space-x-6 pl-6">
            <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
            </button>
            <div className="flex flex-col items-end">
              <span className="text-sm font-bold text-slate-200">{time.toLocaleTimeString([], { hour12: true, hour: '2-digit', minute: '2-digit' })}</span>
              <span className="text-[10px] text-slate-500 uppercase">{time.toLocaleDateString([], { month: 'short', day: '2-digit' })}</span>
            </div>
            <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-lg">OP</div>
          </div>
        </header>

        <div className="flex-1 p-6 overflow-hidden relative">
           <div className="h-full w-full overflow-auto scrollbar-hide">
             {activeView === 'Overview' && <MissionControl />}
             {activeView === 'Search Agents' && <Hunter />}
             {activeView === 'Proposal Center' && <Factory />}
             {activeView === 'Files' && <Artifacts />}
             {activeView === 'Settings' && <Settings />}
           </div>
        </div>
      </main>
    </div>
  );
};

const MetricBox: React.FC<{ label: string; value: string; color: string; icon: any }> = ({ label, value, color, icon: Icon }) => (
  <div className="bg-slate-950/60 p-2 rounded border border-slate-800/40 flex items-center space-x-2">
    <Icon className={`w-3 h-3 ${color}`} />
    <div>
      <div className="text-[8px] text-slate-600 font-bold uppercase tracking-tighter">{label}</div>
      <div className={`text-xs font-bold ${color}`}>{value}</div>
    </div>
  </div>
);

export default Dashboard;