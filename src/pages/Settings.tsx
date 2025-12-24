import React, { useState } from 'react';
import { 
  Save, Key, Bell, Shield, Cpu, Activity, 
  Eye, EyeOff, RefreshCw, Terminal, Globe, Zap, Database, Lock, User, Network, Server
} from 'lucide-react';
import { toast } from 'sonner';

interface SystemSettings {
  apiKey: string;
  deploymentMode: 'Global' | 'Sovereign' | 'Hybrid';
  clusterRegion: string;
  modelName: string;
  thinkingBudget: number;
  navigatorVoice: string;
  notifications: { oppFound: boolean; analysisDone: boolean; systemAlerts: boolean; };
  security: { twoFactor: boolean; encryptionLevel: string; datalakeIsolation: boolean; };
  interface: { scanlines: boolean; flicker: boolean; hudColor: string; };
}

const INITIAL_SETTINGS: SystemSettings = {
  apiKey: 'AIzaSy' + '•'.repeat(24),
  deploymentMode: 'Global',
  clusterRegion: 'US-East-Alpha',
  modelName: 'gemini-3-pro-preview',
  thinkingBudget: 16384,
  navigatorVoice: 'Kore',
  notifications: { oppFound: true, analysisDone: true, systemAlerts: true },
  security: { twoFactor: true, encryptionLevel: 'AES-512-RSA', datalakeIsolation: true },
  interface: { scanlines: true, flicker: true, hudColor: 'blue' }
};

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings>(INITIAL_SETTINGS);
  const [isSaving, setIsSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("SYSTEM_RECONFIG_SUCCESS", {
        description: "Kernel parameters committed to Global Sovereign Network.",
        icon: <Zap className="w-4 h-4 text-blue-400" />
      });
    }, 1500);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 animate-in fade-in duration-700">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-white font-mono flex items-center tracking-tighter glow-blue uppercase">
            <Shield className="w-8 h-8 mr-3 text-blue-500" />
            Infrastructure_Config
          </h2>
          <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-[0.3em]">Billion-User Enterprise Orchestration Platform</p>
        </div>
        
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-900/40 transition-all active:scale-95"
        >
          {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{isSaving ? 'Synchronizing...' : 'Commit Changes'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-8">
          
          <Section title="Enterprise_Deployment" icon={Network} color="blue">
             <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-widest">Global Fleet Strategy</label>
                   <select 
                    value={settings.deploymentMode}
                    onChange={(e) => setSettings({...settings, deploymentMode: e.target.value as any})}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-xs text-slate-200 font-mono outline-none focus:border-blue-500"
                   >
                      <option value="Global">GLOBAL_PUBLIC_SWARM</option>
                      <option value="Sovereign">SOVEREIGN_NODE_PRIVATE</option>
                      <option value="Hybrid">HYBRID_ORCHESTRATION</option>
                   </select>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-widest">Primary Cluster Region</label>
                   <select 
                    value={settings.clusterRegion}
                    onChange={(e) => setSettings({...settings, clusterRegion: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-xs text-slate-200 font-mono outline-none focus:border-blue-500"
                   >
                      <option>US-EAST-ALPHA</option>
                      <option>EU-WEST-BETA</option>
                      <option>APAC-SOUTH-GAMMA</option>
                   </select>
                </div>
             </div>
          </Section>

          <Section title="Neural_Engine_Specs" icon={Cpu} color="purple">
            <div className="grid grid-cols-2 gap-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-widest">Orchestrator Model</label>
                  <select className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-xs text-slate-200 font-mono">
                     <option>GEMINI_3_PRO_ENTERPRISE</option>
                     <option>GEMINI_3_ULTRA_SOVEREIGN</option>
                  </select>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-widest">Thinking Budget (Infinite Cap)</label>
                  <input type="number" value={settings.thinkingBudget} onChange={e => setSettings({...settings, thinkingBudget: Number(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-xs text-slate-200 font-mono" />
               </div>
            </div>
          </Section>

          <Section title="Crypto_Gateways" icon={Key} color="emerald">
             <div className="space-y-4">
                <div className="relative">
                   <input type={showApiKey ? "text" : "password"} value={settings.apiKey} className="w-full bg-slate-950 border border-slate-800 rounded p-4 text-xs font-mono pr-12" />
                   <button onClick={() => setShowApiKey(!showApiKey)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white"><Eye className="w-4 h-4" /></button>
                </div>
                <p className="text-[9px] text-slate-600 font-mono uppercase italic tracking-widest">Keys are hardware-encrypted on a per-node basis.</p>
             </div>
          </Section>

        </div>

        <div className="space-y-8">
           <Section title="Security_Hardening" icon={Lock} color="red">
              <div className="space-y-4">
                 <Toggle label="Datalake Isolation" description="Zero communication with public nodes" active={settings.security.datalakeIsolation} onChange={v => setSettings({...settings, security: {...settings.security, datalakeIsolation: v}})} />
                 <Toggle label="Quantum-Resistant" description="AES-512-RSA Cryptography" active={true} onChange={()=>{}} />
                 <div className="pt-4 border-t border-slate-800">
                    <div className="flex items-center space-x-2 text-[10px] font-mono text-emerald-500 font-bold mb-2 uppercase">
                       <Server className="w-3 h-3" />
                       <span>Sovereign_Active</span>
                    </div>
                    <p className="text-[9px] text-slate-600 leading-relaxed font-mono">Kernel Integrity Verified. No intrusion detected in last 24,000 cycles.</p>
                 </div>
              </div>
           </Section>

           <Section title="User_Identity" icon={User} color="slate">
              <div className="flex items-center space-x-4">
                 <div className="w-12 h-12 rounded bg-blue-600/20 border border-blue-500 flex items-center justify-center text-blue-500 font-black">AD</div>
                 <div>
                    <div className="text-sm font-black text-white font-mono">OPERATOR_CHIEF</div>
                    <div className="text-[10px] text-slate-600 font-mono uppercase tracking-widest">Clearance: IL5_AUTHORIZED</div>
                 </div>
              </div>
           </Section>
        </div>
      </div>
    </div>
  );
};

const Section: React.FC<{ title: string; icon: any; color: string; children: React.ReactNode }> = ({ title, icon: Icon, color, children }) => (
  <div className="bg-[#0B1221]/60 border border-slate-800 rounded-xl overflow-hidden tech-border relative group">
    <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/40 flex items-center justify-between">
       <div className="flex items-center space-x-3">
          <Icon className="w-4 h-4 text-blue-400" />
          <h3 className="text-xs font-black font-mono tracking-[0.2em] text-slate-300 uppercase">{title}</h3>
       </div>
    </div>
    <div className="p-8">{children}</div>
  </div>
);

const Toggle: React.FC<{ label: string; description: string; active: boolean; onChange: (v: boolean) => void }> = ({ label, description, active, onChange }) => (
  <div className="flex items-center justify-between">
    <div>
      <div className="text-xs font-black text-slate-300 font-mono uppercase tracking-tight">{label}</div>
      <div className="text-[9px] text-slate-600 font-mono uppercase mt-0.5">{description}</div>
    </div>
    <button onClick={() => onChange(!active)} className={`w-10 h-5 rounded-sm transition-colors ${active ? 'bg-blue-600' : 'bg-slate-800'}`}>
      <div className={`w-3 h-3 bg-white rounded-sm transition-all ${active ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  </div>
);

export default Settings;
