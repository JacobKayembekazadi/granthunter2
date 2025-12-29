'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  FolderOpen, Download, FileText, File, Plus, Search,
  Trash2, Edit2, X, Save, FileCode, Upload, HelpCircle, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

interface Artifact {
  id: string;
  name: string;
  type: string;
  status: 'ready' | 'processing';
  size: string;
  date: string;
  opportunityId?: string;
  oppName?: string;
  storageUrl?: string;
}

interface Opportunity {
  id: string;
  title: string;
}

const Artifacts: React.FC = () => {
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArtifact, setEditingArtifact] = useState<Artifact | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    type: 'pdf',
    opportunityId: '',
    status: 'ready' as 'ready' | 'processing',
  });

  // Fetch artifacts from API
  const fetchArtifacts = async () => {
    try {
      const response = await fetch('/api/artifacts');
      if (response.ok) {
        const data = await response.json();
        setArtifacts(data.artifacts || []);
      }
    } catch (error) {
      console.error('Error fetching artifacts:', error);
      toast.error('Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  // Fetch opportunities for dropdown
  const fetchOpportunities = async () => {
    try {
      const response = await fetch('/api/opportunities');
      if (response.ok) {
        const data = await response.json();
        setOpportunities(data.opportunities || []);
      }
    } catch (error) {
      console.error('Error fetching opportunities:', error);
    }
  };

  useEffect(() => {
    fetchArtifacts();
    fetchOpportunities();
  }, []);

  const getIcon = (type: string) => {
    const icons: Record<string, JSX.Element> = {
      docx: <FileText className="w-5 h-5 text-blue-400" />,
      doc: <FileText className="w-5 h-5 text-blue-400" />,
      pdf: <File className="w-5 h-5 text-red-400" />,
      xlsx: <FileText className="w-5 h-5 text-emerald-400" />,
      xls: <FileText className="w-5 h-5 text-emerald-400" />,
      pptx: <FileCode className="w-5 h-5 text-orange-400" />,
      ppt: <FileCode className="w-5 h-5 text-orange-400" />,
    };
    return icons[type] || <File className="w-5 h-5 text-slate-400" />;
  };

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/artifacts/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setArtifacts(prev => [data.artifact, ...prev]);
        toast.success(`Uploaded: ${file.name}`);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to upload file");
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error("Failed to upload file");
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleOpenModal = (art?: Artifact) => {
    if (art) {
      setEditingArtifact(art);
      setFormData({
        name: art.name,
        type: art.type,
        opportunityId: art.opportunityId || '',
        status: art.status,
      });
      setIsModalOpen(true);
    }
  };

  const handleSave = async () => {
    if (!formData.name) {
      toast.error("Please enter a file name");
      return;
    }

    try {
      if (editingArtifact) {
        // Update existing artifact
        const response = await fetch(`/api/artifacts/${editingArtifact.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          await fetchArtifacts();
          toast.success("File updated successfully");
        }
      }
    } catch (error) {
      toast.error("Failed to save file");
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/artifacts/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setArtifacts(prev => prev.filter(a => a.id !== id));
        toast.success("File deleted");
      }
    } catch (error) {
      toast.error("Failed to delete file");
    }
  };

  const handleDownload = (artifact: Artifact) => {
    if (artifact.storageUrl) {
      window.open(artifact.storageUrl, '_blank');
    } else {
      toast.info(`Download not available for: ${artifact.name}`);
    }
  };

  const filteredArtifacts = useMemo(() => {
    return artifacts.filter(a =>
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.oppName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [artifacts, searchQuery]);

  const stats = {
    total: artifacts.length,
    ready: artifacts.filter(a => a.status === 'ready').length,
    processing: artifacts.filter(a => a.status === 'processing').length,
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
      />

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-600/20 to-blue-600/20 border border-emerald-500/30 rounded-2xl p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-emerald-500/20 rounded-xl">
              <FolderOpen className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Files & Documents</h2>
              <p className="text-slate-400 text-sm max-w-2xl">
                <strong className="text-white">All your proposal documents in one place.</strong> Upload and organize
                proposals, past performance documents, and supporting files for your contract submissions.
              </p>
            </div>
          </div>
          <button onClick={() => setShowHelp(!showHelp)} className="p-2 hover:bg-white/10 rounded-lg">
            <HelpCircle className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {showHelp && (
          <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm">1</div>
              <div>
                <h4 className="text-white font-semibold text-sm">Upload Files</h4>
                <p className="text-slate-500 text-xs mt-1">Click "Upload File" to add documents (PDF, Word, Excel, PowerPoint).</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm">2</div>
              <div>
                <h4 className="text-white font-semibold text-sm">Link to Opportunities</h4>
                <p className="text-slate-500 text-xs mt-1">Associate files with specific RFPs for better organization.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm">3</div>
              <div>
                <h4 className="text-white font-semibold text-sm">Download Anytime</h4>
                <p className="text-slate-500 text-xs mt-1">Access and download your documents when needed.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-slate-800 text-slate-400"><FolderOpen className="w-5 h-5" /></div>
          <div>
            <div className="text-xl font-bold text-white">{stats.total}</div>
            <div className="text-xs text-slate-500">Total Files</div>
          </div>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400"><FileText className="w-5 h-5" /></div>
          <div>
            <div className="text-xl font-bold text-white">{stats.ready}</div>
            <div className="text-xs text-slate-500">Ready</div>
          </div>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-amber-500/10 text-amber-400"><Upload className="w-5 h-5" /></div>
          <div>
            <div className="text-xl font-bold text-white">{stats.processing}</div>
            <div className="text-xs text-slate-500">Processing</div>
          </div>
        </div>
      </div>

      {/* Header with Search and Upload */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-900/50 border border-slate-800 rounded-xl px-10 py-3 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50 w-full md:w-80"
          />
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 disabled:cursor-not-allowed text-white px-5 py-3 rounded-xl text-sm font-semibold transition-colors"
        >
          {uploading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Upload File
            </>
          )}
        </button>
      </div>

      {/* Files Table */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-900/80 text-slate-500 text-xs uppercase border-b border-slate-800">
            <tr>
              <th className="px-6 py-4 font-semibold">File Name</th>
              <th className="px-6 py-4 font-semibold">Linked Opportunity</th>
              <th className="px-6 py-4 font-semibold">Date Added</th>
              <th className="px-6 py-4 font-semibold">Size</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {filteredArtifacts.map((file) => (
              <tr key={file.id} className="hover:bg-slate-800/30 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-800 border border-slate-700/50 rounded-lg group-hover:border-emerald-500/30">
                      {getIcon(file.type)}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-200 block">{file.name}</span>
                      <span className="text-xs text-slate-500 uppercase">{file.type.toUpperCase()}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-slate-400 text-sm">{file.oppName || 'Not linked'}</span>
                </td>
                <td className="px-6 py-4 text-slate-500">{file.date}</td>
                <td className="px-6 py-4 text-slate-500">{file.size}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
                    ${file.status === 'ready' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${file.status === 'ready' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                    {file.status === 'ready' ? 'Ready' : 'Processing'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleDownload(file)} className="p-2 text-slate-500 hover:text-emerald-400" title="Download">
                      <Download className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleOpenModal(file)} className="p-2 text-slate-500 hover:text-blue-400" title="Edit">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(file.id)} className="p-2 text-slate-500 hover:text-red-400" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredArtifacts.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center">
                  <FolderOpen className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                  <h4 className="text-white font-semibold mb-2">No files found</h4>
                  <p className="text-slate-500 text-sm mb-6">{searchQuery ? 'Try a different search' : 'Upload your first file to get started'}</p>
                  {!searchQuery && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold"
                    >
                      Upload Your First File
                    </button>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {isModalOpen && editingArtifact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-8 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-white">Edit File Details</h3>
                <p className="text-slate-500 text-sm mt-1">Update file information</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-800 rounded-lg">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300">File Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300">Link to Opportunity</label>
                <select
                  value={formData.opportunityId}
                  onChange={e => setFormData({ ...formData, opportunityId: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:border-emerald-500 outline-none"
                >
                  <option value="">Not linked</option>
                  {opportunities.map(opp => (
                    <option key={opp.id} value={opp.id}>{opp.title}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button onClick={handleSave} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold">
                <Save className="w-4 h-4" />
                Save Changes
              </button>
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-semibold">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Artifacts;