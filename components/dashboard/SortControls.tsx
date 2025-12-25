'use client';

import React from 'react';
import { ArrowUpDown } from 'lucide-react';
import { OpportunitySort } from '@/types/dashboard';

interface SortControlsProps {
  sort: OpportunitySort;
  onSortChange: (sort: OpportunitySort) => void;
}

const SortControls: React.FC<SortControlsProps> = ({ sort, onSortChange }) => {
  const sortOptions: Array<{ value: OpportunitySort['sortBy']; label: string }> = [
    { value: 'matchScore', label: 'Match Score' },
    { value: 'dueDate', label: 'Due Date' },
    { value: 'value', label: 'Value' },
    { value: 'createdAt', label: 'Created Date' },
    { value: 'updatedAt', label: 'Updated Date' },
  ];

  return (
    <div className="flex items-center space-x-2">
      <ArrowUpDown className="w-4 h-4 text-slate-400" />
      <select
        value={sort.sortBy}
        onChange={(e) => onSortChange({ ...sort, sortBy: e.target.value as OpportunitySort['sortBy'] })}
        className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-blue-500 focus:outline-none"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <button
        onClick={() => onSortChange({ ...sort, sortOrder: sort.sortOrder === 'asc' ? 'desc' : 'asc' })}
        className="px-3 py-2 bg-slate-900/40 border border-slate-800 rounded-lg hover:border-slate-700 transition-all text-xs font-bold text-slate-400 uppercase tracking-wider"
      >
        {sort.sortOrder === 'asc' ? '↑' : '↓'}
      </button>
    </div>
  );
};

export default SortControls;

