'use client';

import React, { useState, useEffect } from 'react';
import { X, FileText, Sparkles, FolderOpen, Clock, CheckCircle2, AlertTriangle, Download, Share2, Edit2, Trash2, Plus } from 'lucide-react';
import { Opportunity } from '@/types';
import { OpportunityAnalysis } from '@/types/dashboard';

interface OpportunityDetailModalProps {
  opportunity: Opportunity | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (opp: Opportunity) => void;
  onDelete?: (id: string) => void;
  onCreateProposal?: (oppId: string) => void;
}

const OpportunityDetailModal: React.FC<OpportunityDetailModalProps> = ({
  opportunity,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onCreateProposal,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'description' | 'analysis' | 'documents' | 'proposals' | 'activity' | 'notes'>('overview');
  const [analysis, setAnalysis] = useState<OpportunityAnalysis | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  useEffect(() => {
    if (isOpen && opportunity) {
      // Fetch AI analysis
      setLoadingAnalysis(true);
      fetch(`/api/opportunities/${opportunity.id}/insights`)
        .then(res => res.json())
        .then(data => {
          setAnalysis(data.analysis);
          setLoadingAnalysis(false);
        })
        .catch(err => {
          console.error('Error fetching analysis:', err);
          setLoadingAnalysis(false);
        });
    }
  }, [isOpen, opportunity]);

  if (!isOpen || !opportunity) return null;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'description', label: 'Description', icon: FileText },
    { id: 'analysis', label: 'AI Analysis', icon: Sparkles },
    { id: 'documents', label: 'Documents', icon: FolderOpen },
    { id: 'proposals', label: 'Proposals', icon: FolderOpen },
    { id: 'activity', label: 'Activity', icon: Clock },
    { id: 'notes', label: 'Notes', icon: FileText },
  ];

  const getMatchColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400';
    if (score >= 70) return 'text-amber-400';
    return 'text-red-400';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-950 text-blue-400';
      case 'analyzing': return 'bg-amber-950 text-amber-400';
      case 'drafting': return 'bg-purple-950 text-purple-400';
      case 'submitted': return 'bg-emerald-950 text-emerald-400';
      default: return 'bg-slate-950 text-slate-400';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-6xl max-h-[90vh] bg-[#0B1221] border border-slate-800 rounded-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-2">{opportunity.title}</h2>
            <div className="flex items-center space-x-4 text-sm text-slate-400">
              <span>{opportunity.agency}</span>
              <span>•</span>
              <span>{opportunity.naicsCode}</span>
              <span>•</span>
              <span className={`px-2 py-1 rounded text-xs uppercase font-bold ${getStatusColor(opportunity.status)}`}>
                {opportunity.status}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onCreateProposal?.(opportunity.id)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-lg transition-all flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Proposal</span>
            </button>
            <button
              onClick={() => onEdit?.(opportunity)}
              className="p-2 hover:bg-slate-800 rounded-lg transition-all"
              title="Edit"
            >
              <Edit2 className="w-5 h-5 text-slate-400" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800 rounded-lg transition-all"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center space-x-1 px-6 border-b border-slate-800 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-3 text-sm font-bold transition-all border-b-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Match Score</div>
                  <div className={`text-3xl font-bold ${getMatchColor(opportunity.matchScore || 0)}`}>
                    {opportunity.matchScore}%
                  </div>
                </div>
                <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Value</div>
                  <div className="text-2xl font-bold text-slate-200">{opportunity.value || 'N/A'}</div>
                </div>
                <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Due Date</div>
                  <div className="text-2xl font-bold text-slate-200">
                    {opportunity.dueDate ? new Date(opportunity.dueDate).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
              </div>

              {/* Key Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">Key Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500">Agency:</span>
                    <span className="text-slate-200 ml-2">{opportunity.agency}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">NAICS Code:</span>
                    <span className="text-slate-200 ml-2">{opportunity.naicsCode || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Status:</span>
                    <span className="text-slate-200 ml-2 capitalize">{opportunity.status}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Created:</span>
                    <span className="text-slate-200 ml-2">
                      {opportunity.createdAt ? new Date(opportunity.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'description' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Full Description</h3>
              <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl">
                <p className="text-slate-300 whitespace-pre-wrap">
                  {opportunity.description || 'No description available.'}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'analysis' && (
            <div className="space-y-6">
              {loadingAnalysis ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-slate-400 mt-4">Analyzing opportunity...</p>
                </div>
              ) : analysis ? (
                <>
                  {/* Win Probability */}
                  <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-xl">
                    <h3 className="text-lg font-bold text-white mb-4">Win Probability</h3>
                    <div className={`text-5xl font-bold ${getMatchColor(analysis.winProbability)} mb-2`}>
                      {analysis.winProbability}%
                    </div>
                    <p className="text-slate-400 text-sm">{analysis.matchExplanation}</p>
                  </div>

                  {/* Risk Assessment */}
                  <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-xl">
                    <h3 className="text-lg font-bold text-white mb-4">Risk Assessment</h3>
                    <div className="flex items-center space-x-3 mb-3">
                      <AlertTriangle className={`w-5 h-5 ${
                        analysis.riskAssessment.level === 'High' ? 'text-red-400' :
                        analysis.riskAssessment.level === 'Medium' ? 'text-amber-400' :
                        'text-green-400'
                      }`} />
                      <span className="text-xl font-bold text-slate-200">{analysis.riskAssessment.level} Risk</span>
                    </div>
                    <p className="text-slate-300 mb-4">{analysis.riskAssessment.reasoning}</p>
                    {analysis.riskAssessment.factors.length > 0 && (
                      <div>
                        <h4 className="text-sm font-bold text-slate-400 mb-2">Key Factors:</h4>
                        <ul className="list-disc list-inside space-y-1 text-slate-300">
                          {analysis.riskAssessment.factors.map((factor, i) => (
                            <li key={i} className="text-sm">{factor}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Compliance Status */}
                  <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-xl">
                    <h3 className="text-lg font-bold text-white mb-4">Compliance Status</h3>
                    <div className="flex items-center space-x-3 mb-3">
                      {analysis.complianceStatus.isCompliant ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-amber-400" />
                      )}
                      <span className="text-xl font-bold text-slate-200">
                        {analysis.complianceStatus.isCompliant ? 'Compliant' : 'Review Required'}
                      </span>
                      <span className="text-sm text-slate-400">({analysis.complianceStatus.score}% score)</span>
                    </div>
                    {analysis.complianceStatus.issues.length > 0 && (
                      <div>
                        <h4 className="text-sm font-bold text-slate-400 mb-2">Issues:</h4>
                        <ul className="list-disc list-inside space-y-1 text-slate-300">
                          {analysis.complianceStatus.issues.map((issue, i) => (
                            <li key={i} className="text-sm">{issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Recommended Actions */}
                  {analysis.recommendedActions.length > 0 && (
                    <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-xl">
                      <h3 className="text-lg font-bold text-white mb-4">Recommended Actions</h3>
                      <ul className="space-y-2">
                        {analysis.recommendedActions.map((action, i) => (
                          <li key={i} className="flex items-start space-x-3 text-slate-300">
                            <span className="text-blue-400 mt-1">•</span>
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Analysis not available</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Documents</h3>
              {opportunity.rfpDocumentUrl ? (
                <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-blue-400" />
                      <span className="text-slate-200">RFP Document</span>
                    </div>
                    <a
                      href={opportunity.rfpDocumentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-lg transition-all flex items-center space-x-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No documents available</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'proposals' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Related Proposals</h3>
              <div className="text-center py-12 text-slate-400">
                <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No proposals found for this opportunity</p>
                <button
                  onClick={() => onCreateProposal?.(opportunity.id)}
                  className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-lg transition-all"
                >
                  Create Proposal
                </button>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Activity Log</h3>
              <div className="text-center py-12 text-slate-400">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No activity recorded</p>
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Notes</h3>
              <div className="text-center py-12 text-slate-400">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No notes available</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OpportunityDetailModal;



