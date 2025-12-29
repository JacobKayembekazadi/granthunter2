'use client';

import React, { useState, useEffect } from 'react';
import {
  Radar, Plus, Search, X, ChevronRight, Activity, Target,
  Sparkles, History, Brain, RefreshCw, HelpCircle, CheckCircle2, Clock
} from 'lucide-react';
import { toast } from 'sonner';

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
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [newAgent, setNewAgent] = useState({ name: '', target: '' });
  const [showHelp, setShowHelp] = useState(false);

  const selectedAgent = agents.find(a => a.id === selectedId);

  // Fetch agents from API
  const fetchAgents = async () => {
    try {
      const response = await fetch('/api/agents');
      if (response.ok) {
        const data = await response.json();
        setAgents(data.agents.map((a: any) => ({
          ...a,
          hits: a.hits || 0,
          lastRun: a.lastRun ? new Date(a.lastRun).toLocaleString() : 'Never',
          suggestions: [],
        })));
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast.error('Failed to load search agents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const generateAutonomousInsights = async () => {
    if (!selectedAgent) return;
    setIsAnalyzing(true);

    try {
      const response = await fetch(`/api/agents/${selectedAgent.id}/insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: selectedAgent.target }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate insights');
      }

      const { suggestions } = await response.json();
      const newSuggestions: Suggestion[] = suggestions.map((s: any) => ({
        ...s,
        id: Math.random().toString(36).substr(2, 9),
        type: 'optimization' as const
      }));

      setAgents(prev => prev.map(a =>
        a.id === selectedId ? { ...a, suggestions: [...newSuggestions, ...a.suggestions] } : a
      ));

      toast.success("AI analysis complete! New recommendations available.");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to get AI recommendations");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applySuggestion = async (sug: Suggestion) => {
    if (!selectedAgent || !sug.suggestedValue) return;

    try {
      const response = await fetch(`/api/agents/${selectedAgent.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: sug.suggestedValue }),
      });

      if (response.ok) {
        setAgents(prev => prev.map(a =>
          a.id === selectedAgent.id ? {
            ...a,
            target: sug.suggestedValue!,
            suggestions: a.suggestions.filter(s => s.id !== sug.id)
          } : a
        ));
        toast.success("Search criteria updated successfully!");
      }
    } catch (error) {
      toast.error("Failed to update search criteria");
    }
  };

  const handleCreateAgent = async () => {
    if (!newAgent.name) return toast.error("Please enter a name for your search");

    try {
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newAgent.name,
          target: newAgent.target,
          status: 'Active',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAgents(prev => [{
          ...data.agent,
          hits: 0,
          lastRun: 'Just now',
          suggestions: [],
        }, ...prev]);
        setIsAdding(false);
        setNewAgent({ name: '', target: '' });
        toast.success("Search agent created! It will automatically find matching opportunities.");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to create agent");
      }
    } catch (error) {
      toast.error("Failed to create search agent");
    }
  };

  const handleDeleteAgent = async (id: string) => {
    try {
      const response = await fetch(`/api/agents/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setAgents(agents.filter(a => a.id !== id));
        if (selectedId === id) setSelectedId(null);
        toast.success("Search agent deleted");
      }
    } catch (error) {
      toast.error("Failed to delete search agent");
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-8 animate-in fade-in duration-500 pb-20">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-2xl p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <Radar className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Search Agents</h2>
              <p className="text-slate-400 text-sm max-w-2xl">
                <strong className="text-white">Automatically find government contracts that match your business.</strong> Create search agents
                that monitor SAM.gov 24/7 and alert you when new opportunities match your NAICS codes, keywords, or target agencies.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <HelpCircle className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {showHelp && (
          <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm shrink-0">1</div>
              <div>
                <h4 className="text-white font-semibold text-sm">Create a Search</h4>
                <p className="text-slate-500 text-xs mt-1">Define what opportunities you're looking for using NAICS codes, keywords, or agency names.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm shrink-0">2</div>
              <div>
                <h4 className="text-white font-semibold text-sm">AI Monitors SAM.gov</h4>
                <p className="text-slate-500 text-xs mt-1">Your agent automatically scans SAM.gov daily and scores matching opportunities.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm shrink-0">3</div>
              <div>
                <h4 className="text-white font-semibold text-sm">Get Recommendations</h4>
                <p className="text-slate-500 text-xs mt-1">AI analyzes patterns and suggests ways to find more opportunities you might win.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Activity} label="Active Searches" value={agents.filter(a => a.status === 'Active').length.toString()} />
        <StatCard icon={Target} label="Opportunities Found" value={agents.reduce((sum, a) => sum + (a.hits || 0), 0).toLocaleString()} />
        <StatCard icon={Clock} label="Last Scan" value="Recently" />
        <StatCard icon={CheckCircle2} label="Status" value="Online" highlight />
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        {/* Agent List */}
        <div className={`${selectedId ? 'lg:col-span-5' : 'lg:col-span-12'} flex flex-col gap-4 transition-all duration-500`}>
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl flex flex-col overflow-hidden h-full">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Your Search Agents</h3>
                <p className="text-xs text-slate-500 mt-1">Click an agent to see details and AI recommendations</p>
              </div>
              <button
                onClick={() => setIsAdding(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Search
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4 space-y-3">
              {agents.length === 0 ? (
                <div className="p-12 text-center">
                  <Radar className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                  <h4 className="text-white font-semibold mb-2">No search agents yet</h4>
                  <p className="text-slate-500 text-sm mb-6">Create your first search agent to start finding opportunities automatically.</p>
                  <button
                    onClick={() => setIsAdding(true)}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-colors"
                  >
                    Create Your First Search
                  </button>
                </div>
              ) : (
                agents.map(agent => (
                  <div
                    key={agent.id}
                    onClick={() => setSelectedId(agent.id)}
                    className={`p-5 rounded-xl cursor-pointer transition-all flex items-center justify-between group
                      ${selectedId === agent.id
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                        : 'bg-slate-800/50 hover:bg-slate-800 text-slate-300 border border-slate-700/50'
                      }
                    `}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${selectedId === agent.id ? 'bg-white/20' : 'bg-slate-900'}`}>
                        <Radar className={`w-5 h-5 ${selectedId === agent.id ? 'text-white' : 'text-blue-400'}`} />
                      </div>
                      <div>
                        <div className="font-semibold">{agent.name}</div>
                        <div className={`text-xs mt-1 ${selectedId === agent.id ? 'text-white/70' : 'text-slate-500'}`}>
                          {agent.hits || 0} opportunities • Last: {agent.lastRun}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase
                        ${agent.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}
                      `}>
                        {agent.status}
                      </span>
                      <ChevronRight className={`w-4 h-4 ${selectedId === agent.id ? 'text-white' : 'text-slate-600'}`} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Agent Details Panel */}
        {selectedAgent && (
          <div className="lg:col-span-7 animate-in slide-in-from-right-5 duration-300">
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl flex flex-col h-full overflow-hidden">
              <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-blue-600">
                    <Radar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedAgent.name}</h2>
                    <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      Monitoring SAM.gov for new matches
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={generateAutonomousInsights}
                    disabled={isAnalyzing}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-sm text-slate-300 transition-colors"
                  >
                    <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
                    {isAnalyzing ? 'Analyzing...' : 'Get AI Tips'}
                  </button>
                  <button onClick={() => setSelectedId(null)} className="p-2 text-slate-500 hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 p-6 space-y-8 overflow-auto">
                {/* Search Criteria */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Search Criteria</h4>
                  <div className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl">
                    <p className="text-slate-300 text-sm">{selectedAgent.target}</p>
                  </div>
                </div>

                {/* AI Recommendations */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-400" />
                      AI Recommendations
                    </h4>
                  </div>

                  {isAnalyzing ? (
                    <div className="p-8 text-center">
                      <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-4" />
                      <p className="text-slate-400 text-sm">Analyzing your search criteria...</p>
                    </div>
                  ) : selectedAgent.suggestions.length === 0 ? (
                    <div className="p-8 border border-dashed border-slate-700 rounded-xl text-center">
                      <Brain className="w-10 h-10 text-slate-700 mx-auto mb-4" />
                      <p className="text-slate-500 text-sm mb-4">Click "Get AI Tips" to analyze your search.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedAgent.suggestions.map((sug) => (
                        <div key={sug.id} className="p-5 bg-slate-800/50 border border-slate-700/50 rounded-xl space-y-4">
                          <div className="flex justify-between items-start">
                            <h5 className="text-white font-semibold">{sug.title}</h5>
                            <div className="text-2xl font-bold text-blue-400">{sug.confidence}%</div>
                          </div>
                          <p className="text-sm text-slate-400">{sug.description}</p>
                          {sug.suggestedValue && (
                            <button
                              onClick={() => applySuggestion(sug)}
                              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              Apply This Recommendation
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-6 border-t border-slate-800 flex gap-4">
                  <button
                    onClick={() => handleDeleteAgent(selectedAgent.id)}
                    className="px-4 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl text-sm font-semibold"
                  >
                    Delete Agent
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Agent Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-8 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-white">Create Search Agent</h3>
                <p className="text-slate-500 text-sm mt-1">Set up an automated search for government contracts</p>
              </div>
              <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-slate-800 rounded-lg">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300">Search Name</label>
                <input
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder:text-slate-600 focus:border-blue-500 focus:outline-none"
                  placeholder="e.g., IT Services Opportunities"
                  value={newAgent.name}
                  onChange={e => setNewAgent({ ...newAgent, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300">Search Criteria</label>
                <textarea
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder:text-slate-600 focus:border-blue-500 focus:outline-none h-32 resize-none"
                  placeholder="NAICS codes, keywords, agency names..."
                  value={newAgent.target}
                  onChange={e => setNewAgent({ ...newAgent, target: e.target.value })}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={handleCreateAgent} className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold">
                  Create Search Agent
                </button>
                <button onClick={() => setIsAdding(false)} className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-semibold">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard: React.FC<{ icon: any, label: string, value: string, highlight?: boolean }> = ({ icon: Icon, label, value, highlight }) => (
  <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
    <div className={`p-3 rounded-lg ${highlight ? 'bg-green-500/20 text-green-400' : 'bg-slate-800 text-slate-400'}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <div className={`text-xl font-bold ${highlight ? 'text-green-400' : 'text-white'}`}>{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  </div>
);

export default Hunter;
