'use client';

import React from 'react';

export const StatusTileSkeleton: React.FC = () => {
  return (
    <div className="p-4 border border-slate-800 rounded-xl bg-slate-900/40 animate-pulse">
      <div className="flex justify-between items-center mb-1">
        <div className="h-3 w-24 bg-slate-700 rounded"></div>
        <div className="h-4 w-4 bg-slate-700 rounded"></div>
      </div>
      <div className="flex items-baseline space-x-2">
        <div className="h-8 w-16 bg-slate-700 rounded"></div>
        <div className="h-3 w-12 bg-slate-700 rounded"></div>
      </div>
    </div>
  );
};

export const OpportunityCardSkeleton: React.FC = () => {
  return (
    <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="h-4 w-32 bg-slate-700 rounded mb-2"></div>
          <div className="h-6 w-full bg-slate-700 rounded mb-2"></div>
          <div className="h-5 w-3/4 bg-slate-700 rounded"></div>
        </div>
        <div className="h-8 w-12 bg-slate-700 rounded"></div>
      </div>
      <div className="h-16 w-full bg-slate-700 rounded mb-4"></div>
      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
        <div className="h-4 w-24 bg-slate-700 rounded"></div>
        <div className="h-6 w-16 bg-slate-700 rounded"></div>
      </div>
    </div>
  );
};

export const InsightsPanelSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3].map(i => (
        <div key={i} className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl">
          <div className="h-5 w-3/4 bg-slate-700 rounded mb-2"></div>
          <div className="h-4 w-full bg-slate-700 rounded mb-1"></div>
          <div className="h-4 w-5/6 bg-slate-700 rounded"></div>
        </div>
      ))}
    </div>
  );
};



