import React from 'react';
import { Opportunity } from '../types';
import { Edit2, Trash2, Zap } from 'lucide-react';

interface Props {
  data: Opportunity;
  onSelect: (id: string) => void;
  onEdit?: (opp: Opportunity) => void;
  onDelete?: (id: string) => void;
}

const OpportunityCard: React.FC<Props> = ({ data, onSelect, onEdit, onDelete }) => {
  const getMatchColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400';
    if (score >= 70) return 'text-amber-400';
    return 'text-red-400';
  };

  return (
    <div 
      onClick={() => onSelect(data.id)}
      className="group relative p-6 bg-slate-900 border border-slate-800 hover:border-blue-500/50 transition-all duration-300 rounded-xl cursor-pointer hover:shadow-lg hover:shadow-blue-900/20"
    >
      <div className="absolute top-0 right-0 p-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
        <button 
          onClick={(e) => { e.stopPropagation(); onEdit?.(data); }}
          className="p-1.5 bg-slate-800 hover:bg-blue-600/20 text-slate-400 hover:text-blue-400 rounded transition-colors"
        >
          <Edit2 className="w-3 h-3" />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete?.(data.id); }}
          className="p-1.5 bg-slate-800 hover:bg-red-600/20 text-slate-400 hover:text-red-400 rounded transition-colors"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 text-xs text-slate-500 font-mono mb-1">
            <span>{data.naicsCode}</span>
            <span>•</span>
            <span>{data.agency}</span>
          </div>
          <h3 className="text-lg font-semibold text-slate-100 group-hover:text-blue-200 transition-colors line-clamp-2 pr-12">
            {data.title}
          </h3>
        </div>
        <div className="text-right pl-4">
          <div className={`text-xl font-bold font-mono ${getMatchColor(data.matchScore)}`}>
            {data.matchScore}%
          </div>
          <div className="text-[10px] text-slate-500 uppercase tracking-widest">Match</div>
        </div>
      </div>

      <p className="text-sm text-slate-400 line-clamp-2 mb-4">
        {data.description}
      </p>

      <div className="flex items-center justify-between text-xs font-mono pt-4 border-t border-slate-800">
        <div className="flex items-center space-x-4 text-slate-400">
          <div>
            <span className="text-slate-600 block text-[10px] uppercase">Value</span>
            <span className="text-slate-300">{data.value}</span>
          </div>
          <div>
            <span className="text-slate-600 block text-[10px] uppercase">Due</span>
            <span className="text-slate-300">{data.dueDate}</span>
          </div>
        </div>
        <div className={`px-2 py-1 rounded text-[10px] uppercase font-bold
          ${data.status === 'new' ? 'bg-blue-950 text-blue-400' : ''}
          ${data.status === 'analyzing' ? 'bg-amber-950 text-amber-400 animate-pulse' : ''}
          ${data.status === 'drafting' ? 'bg-purple-950 text-purple-400' : ''}
          ${data.status === 'submitted' ? 'bg-emerald-950 text-emerald-400' : ''}
        `}>
          {data.status}
        </div>
      </div>
    </div>
  );
};

export default OpportunityCard;
