'use client';

import React, { useState } from 'react';
import { X, Filter, ChevronDown } from 'lucide-react';
import { OpportunityFilters } from '@/types/dashboard';

interface FilterPanelProps {
  filters: OpportunityFilters;
  onFiltersChange: (filters: OpportunityFilters) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFiltersChange,
  isOpen,
  onToggle,
}) => {
  const [localFilters, setLocalFilters] = useState<OpportunityFilters>(filters);

  const handleChange = (key: keyof OpportunityFilters, value: any) => {
    const updated = { ...localFilters, [key]: value || undefined };
    setLocalFilters(updated);
    onFiltersChange(updated);
  };

  const clearFilters = () => {
    setLocalFilters({});
    onFiltersChange({});
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="flex items-center space-x-2 px-4 py-2 bg-slate-900/40 border border-slate-800 rounded-xl hover:border-slate-700 transition-all"
      >
        <Filter className="w-4 h-4 text-slate-400" />
        <span className="text-sm text-slate-300">Filters</span>
        {hasActiveFilters && (
          <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
            {Object.keys(filters).length}
          </span>
        )}
        <ChevronDown className="w-4 h-4 text-slate-500" />
      </button>
    );
  }

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-bold text-slate-300 uppercase tracking-wider">Filters</span>
        </div>
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-slate-500 hover:text-slate-300"
            >
              Clear All
            </button>
          )}
          <button onClick={onToggle} className="p-1 hover:bg-slate-800 rounded">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Status Filter */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Status
          </label>
          <select
            value={localFilters.status || ''}
            onChange={(e) => handleChange('status', e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-blue-500 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="new">New</option>
            <option value="analyzing">Analyzing</option>
            <option value="drafting">Drafting</option>
            <option value="submitted">Submitted</option>
          </select>
        </div>

        {/* Agency Filter */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Agency
          </label>
          <input
            type="text"
            value={localFilters.agency || ''}
            onChange={(e) => handleChange('agency', e.target.value)}
            placeholder="Filter by agency..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Match Score Range */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Match Score Range
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              min="0"
              max="100"
              value={localFilters.minMatchScore || ''}
              onChange={(e) => handleChange('minMatchScore', e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="Min"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-blue-500 focus:outline-none"
            />
            <span className="text-slate-500">-</span>
            <input
              type="number"
              min="0"
              max="100"
              value={localFilters.maxMatchScore || ''}
              onChange={(e) => handleChange('maxMatchScore', e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="Max"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* NAICS Code */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            NAICS Code
          </label>
          <input
            type="text"
            value={localFilters.naicsCode || ''}
            onChange={(e) => handleChange('naicsCode', e.target.value)}
            placeholder="Filter by NAICS..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Date Range */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            From Date
          </label>
          <input
            type="date"
            value={localFilters.dateFrom || ''}
            onChange={(e) => handleChange('dateFrom', e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            To Date
          </label>
          <input
            type="date"
            value={localFilters.dateTo || ''}
            onChange={(e) => handleChange('dateTo', e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;

