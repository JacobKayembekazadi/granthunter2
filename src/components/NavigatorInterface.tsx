import React from 'react';
import { useGeminiLive } from '../hooks/useGeminiLive';
import AudioVisualizer from './AudioVisualizer';
import { ConnectionState } from '../types';
import { Mic, MicOff, Power, Activity, Brain, Radio, Signal, Sparkles, MessageSquare } from 'lucide-react';

const NavigatorInterface: React.FC = () => {
  const { connect, disconnect, connectionState, volume, isMuted, setIsMuted, error } = useGeminiLive();

  const isConnected = connectionState === ConnectionState.CONNECTED;
  const isConnecting = connectionState === ConnectionState.CONNECTING;

  const handleToggleConnection = () => {
    if (isConnected || isConnecting) {
      disconnect();
    } else {
      connect();
    }
  };

  const suggestions = [
    "What are my win probabilities today?",
    "Analyze the DARPA drone RFP",
    "Identify compliance risks in my draft",
    "Find similar past performance documents"
  ];

  return (
    <div className="bg-[#0B1221]/90 backdrop-blur-2xl rounded-2xl p-6 w-full max-w-md mx-auto relative overflow-hidden border border-slate-800/60 shadow-2xl tech-border group">
      {/* Dynamic Status Glow Bar */}
      <div className={`absolute top-0 left-0 w-full h-1 transition-all duration-700
        ${isConnected ? 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)]' : 
          isConnecting ? 'bg-amber-500 animate-pulse' : 'bg-slate-800'}`} 
      />

      <div className="flex justify-between items-start mb-6">
        <div className="relative">
          <div className="flex items-center space-x-3">
             <div className={`p-2 rounded-xl bg-slate-900 border border-slate-800 transition-colors ${isConnected ? 'border-blue-500/50' : ''}`}>
               <Brain className={`w-5 h-5 ${isConnected ? 'text-blue-400 animate-pulse' : 'text-slate-600'}`} />
             </div>
             <div>
               <h2 className="text-lg font-bold flex items-center space-x-2 font-mono tracking-tight">
                 <span className={`${isConnected ? 'text-blue-400 glow-blue' : 'text-slate-400'}`}>THE NAVIGATOR</span>
               </h2>
               <div className="text-[9px] font-mono text-slate-500 flex items-center space-x-2 uppercase tracking-widest mt-0.5">
                 <Radio className={`w-2 h-2 ${isConnected ? 'text-emerald-500 animate-ping' : 'text-slate-700'}`} />
                 <span>Link Status: {connectionState}</span>
               </div>
             </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleToggleConnection}
            disabled={isConnecting}
            className={`p-3 rounded-xl transition-all duration-300 border-2 shadow-lg
              ${isConnected 
                ? 'bg-red-500/10 border-red-500/40 text-red-500 hover:bg-red-500 hover:text-white shadow-red-900/20' 
                : 'bg-blue-500/10 border-blue-500/40 text-blue-500 hover:bg-blue-500 hover:text-white shadow-blue-900/20'
              }
              ${isConnecting ? 'opacity-50 cursor-not-allowed' : ''}
              group-hover:scale-105 active:scale-95
            `}
          >
            <Power className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Visualizer Area */}
      <div className="mb-6 relative rounded-2xl overflow-hidden border border-slate-800/80 group/vis shadow-inner">
        <AudioVisualizer isActive={isConnected || isConnecting} volume={volume} />
        
        {/* Connection Overlay */}
        {!isConnected && !isConnecting && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#050A14]/70 backdrop-blur-[1px]">
             <div className="text-center text-slate-500">
               <Activity className="w-10 h-10 mx-auto mb-3 opacity-10" />
               <p className="text-[10px] font-mono uppercase tracking-[0.3em]">Module_Standby</p>
             </div>
          </div>
        )}
      </div>

      {/* Simple Guidance for Million Users */}
      <div className="mb-6 space-y-3">
         <div className="flex items-center space-x-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">
            <Sparkles className="w-3 h-3 text-blue-400" />
            <span>Voice Command Suggestions</span>
         </div>
         <div className="grid grid-cols-1 gap-2">
            {suggestions.map((s, i) => (
              <button key={i} className="text-left px-3 py-2 bg-slate-900/40 border border-slate-800/50 rounded-lg text-[10px] text-slate-400 hover:text-blue-400 hover:border-blue-500/30 transition-all font-medium flex items-center space-x-2 group/s">
                 <MessageSquare className="w-3 h-3 opacity-30 group-hover/s:opacity-100" />
                 <span>"{s}"</span>
              </button>
            ))}
         </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col space-y-4">
        <button
          onClick={() => setIsMuted(!isMuted)}
          disabled={!isConnected}
          className={`flex items-center justify-center space-x-3 px-6 py-4 rounded-xl font-mono text-xs font-black transition-all border
            ${isMuted 
              ? 'bg-red-500/10 text-red-400 border-red-500/30 shadow-[inset_0_0_10px_rgba(239,68,68,0.1)]' 
              : 'bg-blue-600/10 text-blue-400 border-blue-500/20 hover:bg-blue-600/20 hover:text-blue-300'}
            ${!isConnected ? 'opacity-30 cursor-not-allowed grayscale' : 'active:scale-95 shadow-xl shadow-blue-900/10'}
          `}
        >
          {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 animate-pulse" />}
          <span className="tracking-[0.2em]">{isMuted ? 'TRANSMIT_DISABLED' : 'TALK_TO_SYSTEM'}</span>
        </button>

        {error && (
          <div className="p-3 bg-red-950/40 border border-red-900/40 rounded text-[9px] text-red-400 font-mono flex items-start space-x-2 animate-in slide-in-from-bottom-2">
            <Activity className="w-3 h-3 mt-0.5 shrink-0" />
            <span className="uppercase tracking-tighter">FAULT: {error}</span>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-6 pt-4 border-t border-slate-800 text-[9px] text-slate-700 font-mono flex justify-between uppercase tracking-widest">
        <div className="flex items-center">
           <Radio className="w-2 h-2 mr-1" />
           <span>Ref: G-3-NATIVE</span>
        </div>
        <div className="flex items-center space-x-3">
           <span className="text-emerald-500/40 italic">Ready</span>
           <span className="text-slate-800">|</span>
           <span>v2.4</span>
        </div>
      </div>
    </div>
  );
};

export default NavigatorInterface;