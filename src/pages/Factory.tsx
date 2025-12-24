import React, { useState, useEffect, useMemo } from 'react';
import { 
  Factory as FactoryIcon, FileText, CheckCircle, Clock, 
  Play, Plus, Trash2, RotateCw, Pause, Settings, X, Save,
  Cpu, Layers, ChevronRight, Download, History, Search, Database
} from 'lucide-react';
import { toast } from 'sonner';
import { MOCK_OPPORTUNITIES } from '../data/mock';

interface JobLog {
  timestamp: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
}

interface Job {
  id: string;
  name: string;
  type: string; 
  stage: string;
  progress: number;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'paused';
  eta: string;
  priority: 'High' | 'Normal' | 'Low';
  opportunityId?: string;
  logs: JobLog[];
  configuration: {
    model: string;
    creativity: 'Standard' | 'Creative' | 'Conservative';
    depth: 'Standard' | 'Deep' | 'Exhaustive';
  };
}

const INITIAL_JOBS: Job[] = [
  { 
    id: 'PRJ-1024', 
    name: 'Drone Swarm - Technical Section', 
    type: 'Technical Proposal',
    stage: 'Drafting Section 3.1', 
    progress: 45, 
    status: 'processing', 
    eta: '12 min',
    priority: 'High',
    opportunityId: '1',
    logs: [
      { timestamp: '09:00:01', message: 'Project initialized.', type: 'info' },
      { timestamp: '09:00:05', message: 'Context loaded from DARPA RFP.', type: 'success' },
      { timestamp: '09:05:22', message: 'Analyzing evaluation criteria.', type: 'info' }
    ],
    configuration: { model: 'GPT-4 / Gemini Pro', creativity: 'Standard', depth: 'Deep' }
  }
];

const Factory: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>(INITIAL_JOBS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const selectedJob = useMemo(() => jobs.find(j => j.id === selectedJobId), [jobs, selectedJobId]);

  const [formData, setFormData] = useState<Partial<Job>>({
    name: '',
    type: 'Technical Proposal',
    priority: 'Normal',
    status: 'queued',
    progress: 0,
    opportunityId: '',
    configuration: { model: 'Gemini-3-Pro', creativity: 'Standard', depth: 'Standard' }
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setJobs(prevJobs => {
        return prevJobs.map(job => {
          if (job.status === 'processing' && job.progress < 100) {
            const increment = Math.random() * 2.5;
            const newProgress = Math.min(100, job.progress + increment);
            
            let newLogs = [...job.logs];
            if (Math.random() > 0.8) {
              const messages = [
                'Analyzing past performance records...',
                'Drafting executive summary...',
                'Checking compliance with RFP Section L...',
                'Synthesizing technical approach narrative...',
                'Reviewing for tone and clarity...'
              ];
              newLogs.push({
                timestamp: new Date().toLocaleTimeString([], { hour12: false }),
                message: messages[Math.floor(Math.random() * messages.length)],
                type: 'info'
              });
            }

            if (newProgress >= 100) {
              toast.success(`Proposal Complete: ${job.name}`);
              return { ...job, progress: 100, status: 'completed', stage: 'Ready for Review', eta: '-', logs: newLogs };
            }

            return { 
              ...job, 
              progress: newProgress,
              logs: newLogs,
              stage: newProgress > 90 ? 'Final Review' : newProgress > 30 ? 'Content Generation' : 'Initial Planning'
            };
          }
          return job;
        });
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleOpenModal = (job?: Job) => {
    if (job) {
      setEditingJob(job);
      setFormData(job);
    } else {
      setEditingJob(null);
      setFormData({
        name: '',
        type: 'Technical Proposal',
        priority: 'Normal',
        status: 'queued',
        progress: 0,
        opportunityId: MOCK_OPPORTUNITIES[0].id,
        configuration: { model: 'Gemini-3-Pro', creativity: 'Standard', depth: 'Standard' }
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name) {
      toast.error("Project name required.");
      return;
    }

    if (editingJob) {
      setJobs(prev => prev.map(j => j.id === editingJob.id ? { ...j, ...formData } as Job : j));
      toast.success("Project settings updated.");
    } else {
      const newJob: Job = {
        id: `PRJ-${Math.floor(Math.random() * 9000) + 1000}`,
        eta: '10m',
        logs: [{ timestamp: new Date().toLocaleTimeString([], { hour12: false }), message: 'Project started.', type: 'info' }],
        ...(formData as Job)
      };
      setJobs(prev => [newJob, ...prev]);
      toast.success("New proposal project started.");
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setJobs(prev => prev.filter(j => j.id !== id));
    if (selectedJobId === id) setSelectedJobId(null);
    toast.success("Project deleted.");
  };

  const filteredJobs = jobs.filter(j => j.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="h-full flex flex-col space-y-6 pb-12">
      {!selectedJobId && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-in fade-in duration-500">
          <StatTile icon={Cpu} label="ACTIVE PROJECTS" value={jobs.filter(j => j.status === 'processing').length.toString()} color="blue" />
          <StatTile icon={Layers} label="QUEUED" value={jobs.filter(j => j.status === 'queued').length.toString()} color="amber" />
          <StatTile icon={CheckCircle} label="COMPLETED" value={jobs.filter(j => j.status === 'completed').length.toString()} color="emerald" />
          <StatTile icon={Database} label="STORED DRAFTS" value="12" color="purple" />
        </div>
      )}

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 relative min-h-0">
        <div className={`${selectedJobId ? 'lg:col-span-5' : 'lg:col-span-12'} flex flex-col space-y-4 transition-all duration-500`}>
          <div className="bg-[#0B1221]/60 border border-slate-800 rounded-2xl overflow-hidden tech-border flex flex-col h-full">
            <div className="p-5 border-b border-slate-800 bg-slate-900/40 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <FactoryIcon className="w-5 h-5 text-blue-500" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-100">Project List</h3>
              </div>
              <div className="flex items-center space-x-2">
                 <div className="relative group">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                      type="text" 
                      placeholder="Search projects..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-[10px] focus:border-blue-500 outline-none w-32 md:w-48 transition-all"
                    />
                 </div>
                 <button onClick={() => handleOpenModal()} className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-lg shadow-blue-900/40">
                   <Plus className="w-4 h-4" />
                 </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto scrollbar-hide">
              {filteredJobs.map(job => (
                <div 
                  key={job.id} 
                  onClick={() => setSelectedJobId(job.id)}
                  className={`group p-5 border-b border-slate-800/50 cursor-pointer transition-all relative
                    ${selectedJobId === job.id ? 'bg-blue-600/10 border-l-2 border-l-blue-500' : 'hover:bg-slate-800/30'}`}
                >
                  <div className="flex justify-between items-start">
                     <div className="flex items-start space-x-4">
                        <div className={`p-2 rounded-lg ${job.status === 'processing' ? 'text-blue-400 bg-blue-400/5' : 'text-slate-600'}`}>
                          {job.status === 'processing' ? <RotateCw className="w-5 h-5 animate-spin-slow" /> : <FileText className="w-5 h-5" />}
                        </div>
                        <div>
                           <div className="flex items-center space-x-2">
                              <span className="text-xs font-bold text-slate-100">{job.name}</span>
                              <span className={`text-[8px] font-bold px-1 rounded border ${job.priority === 'High' ? 'text-red-400 border-red-400/20 bg-red-400/5' : 'text-slate-500 border-slate-700'}`}>{job.priority}</span>
                           </div>
                           <div className="text-[9px] text-slate-500 uppercase mt-1 tracking-tighter">
                              Progress: {Math.round(job.progress)}% // Type: {job.type}
                           </div>
                        </div>
                     </div>
                     <StatusIndicator status={job.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {selectedJob && (
          <div className="lg:col-span-7 animate-in fade-in slide-in-from-right-4 duration-500 h-full flex flex-col space-y-4">
             <div className="bg-[#0B1221]/90 border border-slate-700 rounded-2xl overflow-hidden flex flex-col flex-1 tech-border shadow-2xl">
                <div className="p-6 border-b border-slate-800 bg-slate-900/60 flex justify-between items-center">
                   <div className="flex items-center space-x-4">
                      <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                         <FileText className="w-6 h-6 text-blue-400" />
                      </div>
                      <div>
                         <h2 className="text-xl font-bold text-white uppercase tracking-tight">{selectedJob.name}</h2>
                         <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-1">Project Active</div>
                      </div>
                   </div>
                   <button onClick={() => setSelectedJobId(null)} className="p-2 text-slate-500 hover:text-white transition-colors">
                      <X className="w-6 h-6" />
                   </button>
                </div>

                <div className="flex-1 overflow-auto p-6 space-y-8">
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <DetailStat label="Progress" value={`${Math.round(selectedJob.progress)}%`} />
                      <DetailStat label="Model" value="Enterprise AI" />
                      <DetailStat label="Priority" value={selectedJob.priority} />
                      <DetailStat label="Status" value={selectedJob.status.toUpperCase()} />
                   </div>

                   <div className="space-y-3">
                      <div className="flex justify-between items-end">
                         <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Task</span>
                         <span className="text-xs font-bold text-blue-400">{selectedJob.stage}</span>
                      </div>
                      <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                         <div className="h-full bg-blue-600 transition-all duration-700" style={{ width: `${selectedJob.progress}%` }} />
                      </div>
                   </div>

                   <div className="space-y-3">
                      <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Activity History</h4>
                      <div className="bg-black/40 border border-slate-800 rounded-xl p-4 h-48 overflow-auto font-mono text-[10px] space-y-2">
                         {selectedJob.logs.map((log, i) => (
                           <div key={i} className="flex space-x-2">
                              <span className="text-slate-600">[{log.timestamp}]</span>
                              <span className={log.type === 'success' ? 'text-emerald-500' : 'text-slate-400'}>{log.message}</span>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>

                <div className="p-6 bg-slate-950/80 border-t border-slate-800 flex justify-between items-center">
                   <button onClick={() => handleOpenModal(selectedJob)} className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded-xl text-[10px] font-bold uppercase transition-all flex items-center space-x-2">
                      <Settings className="w-3.5 h-3.5" />
                      <span>Project Settings</span>
                   </button>
                   <button onClick={() => handleDelete(selectedJob.id)} className="px-5 py-2.5 bg-red-600/10 hover:bg-red-600 border border-red-500/20 text-red-500 hover:text-white rounded-xl text-[10px] font-bold uppercase transition-all">
                      <span>Delete Project</span>
                   </button>
                </div>
             </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0B1221] border border-slate-700 w-full max-w-xl rounded-xl shadow-2xl tech-border">
             <div className="px-6 py-5 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
                <h3 className="text-xl font-bold text-white uppercase tracking-widest">{editingJob ? 'Edit Project' : 'New Proposal Project'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white"><X className="w-6 h-6" /></button>
             </div>
             <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Project Name</label>
                  <input 
                    type="text" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-sm text-slate-200 outline-none focus:border-blue-500" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Proposal Type</label>
                      <select 
                        value={formData.type} 
                        onChange={e => setFormData({...formData, type: e.target.value})} 
                        className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-xs text-slate-200 outline-none"
                      >
                        <option>Technical Proposal</option>
                        <option>Compliance Matrix</option>
                        <option>Price Volume</option>
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Priority</label>
                      <select 
                        value={formData.priority} 
                        onChange={e => setFormData({...formData, priority: e.target.value as any})} 
                        className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-xs text-slate-200 outline-none"
                      >
                        <option value="Low">Low</option>
                        <option value="Normal">Normal</option>
                        <option value="High">High</option>
                      </select>
                   </div>
                </div>
             </div>
             <div className="px-8 py-5 bg-slate-950/50 border-t border-slate-800 flex justify-end space-x-4">
                <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-500 uppercase">Cancel</button>
                <button onClick={handleSave} className="px-8 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase rounded shadow-lg tracking-widest transition-all">Save Project</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatTile: React.FC<{ icon: any, label: string, value: string, color: 'blue' | 'amber' | 'emerald' | 'purple' }> = ({ icon: Icon, label, value, color }) => {
  const colors = {
    blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    amber: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    purple: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
  };
  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 flex items-center space-x-4">
      <div className={`p-3 rounded-lg ${colors[color]}`}><Icon className="w-5 h-5" /></div>
      <div>
        <div className="text-2xl font-bold text-white tracking-tighter">{value}</div>
        <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">{label}</div>
      </div>
    </div>
  );
};

const DetailStat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
     <div className="text-[8px] text-slate-600 uppercase font-bold tracking-widest mb-1">{label}</div>
     <div className="text-xs font-bold text-slate-300">{value}</div>
  </div>
);

const StatusIndicator: React.FC<{ status: string }> = ({ status }) => {
  const styles = {
    queued: 'bg-slate-800 text-slate-500 border-slate-700',
    processing: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    failed: 'bg-red-500/10 text-red-400 border-red-500/20',
    paused: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase border ${styles[status as keyof typeof styles] || styles.queued}`}>
      {status}
    </span>
  );
};

export default Factory;