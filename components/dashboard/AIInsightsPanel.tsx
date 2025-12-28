'use client';

import React from 'react';
import { Sparkles, RefreshCw, ArrowRight } from 'lucide-react';
import { DashboardInsight } from '@/types/dashboard';

interface AIInsightsPanelProps {
  insights: DashboardInsight[];
  loading?: boolean;
  onRefresh?: () => void;
  onInsightClick?: (insight: DashboardInsight) => void;
}

const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({
  insights,
  loading,
  onRefresh,
  onInsightClick,
}) => {
  const priorityColors = {
    high: 'border-red-500/20 bg-red-500/5',
    medium: 'border-amber-500/20 bg-amber-500/5',
    low: 'border-blue-500/20 bg-blue-500/5',
  };

  const priorityLabels = {
    high: 'HIGH PRIORITY',
    medium: 'MEDIUM',
    low: 'LOW',
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl animate-pulse">
            <div className="h-5 w-3/4 bg-slate-700 rounded mb-2"></div>
            <div className="h-4 w-full bg-slate-700 rounded mb-1"></div>
            <div className="h-4 w-5/6 bg-slate-700 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (insights.length === 0) {
    return (
      <div className="p-8 text-center border border-slate-800 rounded-xl bg-slate-900/20">
        <Sparkles className="w-8 h-8 text-slate-600 mx-auto mb-3" />
        <p className="text-sm text-slate-500">No insights available yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-blue-500" />
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">AI Insights</h3>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-2 hover:bg-slate-800 rounded-lg transition-all"
            title="Refresh insights"
          >
            <RefreshCw className="w-4 h-4 text-slate-400" />
          </button>
        )}
      </div>

      {insights.map((insight) => (
        <div
          key={insight.id}
          onClick={() => onInsightClick?.(insight)}
          className={`p-4 border rounded-xl cursor-pointer transition-all hover:border-opacity-40 ${
            priorityColors[insight.priority]
          } ${onInsightClick ? 'hover:bg-opacity-10' : ''}`}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {priorityLabels[insight.priority]}
                </span>
                <span className="text-xs text-slate-600">
                  {insight.confidence}% confidence
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-200 mb-2">{insight.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{insight.description}</p>
            </div>
            {insight.actionUrl && onInsightClick && (
              <ArrowRight className="w-4 h-4 text-slate-500 flex-shrink-0 ml-2" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AIInsightsPanel;



