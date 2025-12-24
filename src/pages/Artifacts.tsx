import React, { useState, useMemo } from 'react';
import { 
  FolderOpen, Download, FileText, File, MoreVertical, 
  Plus, Search, Trash2, Edit2, X, Save, FileCode, 
  ExternalLink, Filter, Database, Archive
} from 'lucide-react';
import { Artifact } from '../types';
import { MOCK_OPPORTUNITIES } from '../data/mock';
import { toast } from 'sonner';

const INITIAL_ARTIFACTS: Artifact[] = [
  { id: 'ART-001', name: 'Proposal_Draft_v1.2.docx', type: 'docx', size: '2.4 MB', date: '2025-10-24', opportunityId: '1', status: 'ready', oppName: 'Drone Swarm' },
  { id: 'ART-002', name: 'Budget_Analysis.xlsx', type: 'xlsx', size: '1.1 MB', date: '2025-10-24', opportunityId: '1', status: 'ready', oppName: 'Drone Swarm' },
  { id: 'ART-003', name: 'Technical_Vol_Final.pdf', type: 'pdf', size: '4.8 MB', date: '2025-10-23', opportunityId: '2', status: 'ready', oppName: 'Cyber Infra' },
  { id: 'ART-004', name: 'Past_Performance.pptx', type: 'pptx', size: '12 MB', date: '2025-10-22', opportunityId: '2', status: 'processing', oppName: 'Cyber Infra' },
];

const Artifacts: React.FC = () => {
  const [artifacts, setArtifacts] = useState<Artifact[]>(INITIAL_ARTIFACTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArtifact, setEditingArtifact] = useState<Artifact | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Artifact>>({
    name: '',
    type: 'pdf',
    opportunityId: '',
    status: 'ready'
  });

  const getIcon = (type: string) => {
    switch(type) {
      case 'docx': return <FileText className="w-5 h-5 text-blue-400" />;
      case 'pdf': return <File className="w-5 h-5 text-red-400" />;
      case 'xlsx': return <FileText className="w-5 h-5 text-emerald-400" />;
      case 'pptx': return <FileCode className="w-5 h-5 text-orange-400" />;
      default: return <File className="w-5 h-5 text-slate-400" />;
    }
  };

  const handleOpenModal = (art?: Artifact) => {
    if (art) {
      setEditingArtifact(art);
      setFormData(art);
    } else {
      setEditingArtifact(null);
      setFormData({
        name: '',
        type: 'pdf',
        opportunityId: MOCK_OPPORTUNITIES[0]?.id || '',
        status: 'ready'
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name) {
      toast.error("Artifact identifier required");
      return;
    }

    const selectedOpp = MOCK_OPPORTUNITIES.find(o => o.id === formData.opportunityId);
    const dateStr = new Date().toISOString().split('T')[0];

    if (editingArtifact) {
      setArtifacts(prev => prev.map(a => a.id === editingArtifact.id ? { 
        ...a, 
        ...formData, 
        oppName: selectedOpp?.title || 'Unknown' 
      } as Artifact : a));
      toast.success("Intel metadata revised");
    } else {
      const newArt: Artifact = {
        id: `ART-${Math.floor(Math.random() * 900) + 100}`,
        size: `${(Math.random() * 5 + 0.1).toFixed(1)} MB`,
        date: dateStr,
        oppName: selectedOpp?.title || 'Unknown',
        ...(formData as Artifact)
      };
      setArtifacts(prev => [newArt, ...prev]);
      toast.success("New artifact indexed to repository");
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setArtifacts(prev => prev.filter(a => a.id !== id));
    toast.success("Artifact purged from repository");
  };

  const handleDownload = (name: string) => {
    toast.info(`Downloading binary: ${name}`);
  };

  const filteredArtifacts = useMemo(() => {
    return artifacts.filter(a => 
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.oppName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [artifacts, searchQuery]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* HUD Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white font-mono flex items-center tracking-tight">
            <Archive className="w-6 h-6 mr-3 text-blue-500" />
            INTEL REPOSITORY
          </h2>
          <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-widest">Secure Multi-Theater Artifact Storage</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="relative group">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400" />
            <input 
              type="text" 
              placeholder="SEARCH_REPOSITORY..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900/50 border border-slate-800 rounded px-10 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500/50 w-full md:w-64"
            />
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded text-xs font-bold font-mono uppercase tracking-wider flex items-center space-x-2 shadow-lg shadow-blue-900/40"
          >
            <Plus className="w-4 h-4" />
            <span>Archive Intel</span>
          </button>
        </div>
      </div>

      {/* Main Table HUD */}
      <div className="bg-[#0B1221]/60 border border-slate-800 rounded-xl overflow-hidden tech-border relative">
        <div className="absolute top-0 right-0 p-3 opacity-5 pointer-events-none">
           <Database className="w-24 h-24" />
        </div>

        <table className="w-full text-sm text-left font-mono">
          <thead className="bg-slate-950/80 text-slate-500 text-[10px] uppercase tracking-[0.2em] border-b border-slate-800">
            <tr>
              <th className="px-6 py-4 font-semibold">Artifact_UID</th>
              <th className="px-6 py-4 font-semibold">Project_Association</th>
              <th className="px-6 py-4 font-semibold">Modified_Timestamp</th>
              <th className="px-6 py-4 font-semibold">Binary_Size</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 text-right font-semibold">Operations</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {filteredArtifacts.map((file) => (
              <tr key={file.id} className="hover:bg-slate-800/20 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-slate-900/80 border border-slate-800 rounded group-hover:border-blue-500/30 transition-colors">
                      {getIcon(file.type)}
                    </div>
                    <div>
                      <span className="font-bold text-slate-200 text-xs block">{file.name}</span>
                      <span className="text-[9px] text-slate-500 uppercase">{file.id} // {file.type}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-slate-400 text-[11px] font-medium">{file.oppName}</span>
                </td>
                <td className="px-6 py-4 text-slate-500 text-[10px]">{file.date}</td>
                <td className="px-6 py-4 text-slate-500 text-[10px]">{file.size}</td>
                <td className="px-6 py-4">
                  <div className={`inline-flex items-center space-x-1.5 px-2 py-0.5 rounded text-[9px] font-bold uppercase
                    ${file.status === 'ready' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse'}
                  `}>
                    <div className={`w-1 h-1 rounded-full ${file.status === 'ready' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                    <span>{file.status}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleDownload(file.name)}
                      className="p-1.5 text-slate-500 hover:text-blue-400" 
                      title="Download Binary"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => handleOpenModal(file)}
                      className="p-1.5 text-slate-500 hover:text-emerald-400" 
                      title="Modify Metadata"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(file.id)}
                      className="p-1.5 text-slate-500 hover:text-red-400" 
                      title="Purge Artifact"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredArtifacts.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-600 font-mono text-xs italic">
                  NO ARTIFACTS MATCHING CURRENT FILTERS FOUND IN REPOSITORY.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* CRUD Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#0B1221] border border-slate-700 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden tech-border">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <h3 className="text-lg font-bold text-white font-mono uppercase tracking-widest flex items-center">
                <Archive className="w-4 h-4 mr-2 text-blue-500" />
                <span>{editingArtifact ? 'Revise Artifact' : 'Archive New Intel'}</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Artifact Identifier (Filename)</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="Intel_Payload_001.pdf"
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-slate-200 font-mono focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Binary Type</label>
                  <select 
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value as any})}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-slate-200 font-mono focus:border-blue-500 focus:outline-none"
                  >
                    <option value="pdf">ADOBE_PDF</option>
                    <option value="docx">MS_WORD_DOCX</option>
                    <option value="pptx">MS_PPTX_SLIDES</option>
                    <option value="xlsx">MS_EXCEL_SHEET</option>
                    <option value="txt">PLAINTEXT_UTF8</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Status Code</label>
                  <select 
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value as any})}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-slate-200 font-mono focus:border-blue-500 focus:outline-none"
                  >
                    <option value="ready">OPERATIONAL_READY</option>
                    <option value="processing">NEURAL_PROCESSING</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Mission Association</label>
                <select 
                  value={formData.opportunityId}
                  onChange={e => setFormData({...formData, opportunityId: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-slate-200 font-mono focus:border-blue-500 focus:outline-none"
                >
                  <option value="">-- SELECT TARGET MISSION --</option>
                  {MOCK_OPPORTUNITIES.map(opp => (
                    <option key={opp.id} value={opp.id}>{opp.title}</option>
                  ))}
                </select>
              </div>
              
              <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded flex items-start space-x-3 mt-4">
                 <Filter className="w-4 h-4 text-blue-400 mt-0.5" />
                 <p className="text-[9px] font-mono text-slate-400 leading-relaxed uppercase">
                   Warning: Artifacts are subject to periodic neural cleaning. Ensure project association is accurate for retention indexing.
                 </p>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-950/50 border-t border-slate-800 flex justify-end space-x-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs font-bold font-mono text-slate-500 uppercase hover:text-white transition-colors"
              >
                Abort
              </button>
              <button 
                onClick={handleSave}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold font-mono uppercase rounded shadow-lg shadow-blue-900/40"
              >
                <Save className="w-4 h-4" />
                <span>Commit Entry</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Artifacts;