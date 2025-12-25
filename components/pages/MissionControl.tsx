'use client';

import React, { useState, useEffect, useCallback } from 'react';
import OpportunityCard from '@/components/OpportunityCard';
import NavigatorInterface from '@/components/NavigatorInterface';
import OpportunityDetailModal from '@/components/dashboard/OpportunityDetailModal';
import StatusTile from '@/components/dashboard/StatusTile';
import FilterPanel from '@/components/dashboard/FilterPanel';
import SortControls from '@/components/dashboard/SortControls';
import AIInsightsPanel from '@/components/dashboard/AIInsightsPanel';
import EmptyState from '@/components/dashboard/EmptyState';
import { StatusTileSkeleton, OpportunityCardSkeleton, InsightsPanelSkeleton } from '@/components/dashboard/LoadingState';
import { useDashboard } from '@/hooks/useDashboard';
import { useDashboardRealtime } from '@/hooks/useDashboardRealtime';
import { 
  Globe, Target, Layers, Search, Plus, X, Network, Database, Server,
  ArrowRight, BarChart3, Clock, FileText, Sparkles, Download, CheckCircle2
} from 'lucide-react';
import { Opportunity } from '@/types';
import { OpportunityFilters, OpportunitySort, DashboardInsight } from '@/types/dashboard';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

const MissionControl: React.FC = () => {
  const router = useRouter();
  const [userName, setUserName] = useState<string>('Operator');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [filters, setFilters] = useState<OpportunityFilters>({});
  const [sort, setSort] = useState<OpportunitySort>({ sortBy: 'createdAt', sortOrder: 'desc' });
  const [currentPage, setCurrentPage] = useState(0);
  const [activeDots, setActiveDots] = useState<{x: number, y: number}[]>([]);
  const pageSize = 25;

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/users/me');
        if (response.ok) {
          const data = await response.json();
          setUserName(data.user?.fullName || data.user?.email?.split('@')[0] || 'Operator');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    fetchUser();
  }, []);

  // Use dashboard hook for data fetching
  const {
    stats,
    opportunities,
    total,
    insights,
    loading,
    error,
    refetch,
    refetchStats,
    refetchOpportunities,
    refetchInsights,
  } = useDashboard({
    filters: { ...filters, search: searchQuery || undefined },
    sort,
    pagination: { limit: pageSize, offset: currentPage * pageSize },
  });

  // Real-time updates
  useDashboardRealtime({
    onOpportunityChange: (payload) => {
      // Refresh opportunities when changes occur
      refetchOpportunities();
      refetchStats();
    },
    onProposalChange: (payload) => {
      // Refresh stats when proposals change
      refetchStats();
    },
  });

  // Animated dots effect
  useEffect(() => {
    const generateDots = () => {
      const dots = Array.from({length: 8}, () => ({
        x: Math.floor(Math.random() * 100),
        y: Math.floor(Math.random() * 100)
      }));
      setActiveDots(dots);
    };
    generateDots();
    const timer = setInterval(generateDots, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleOpportunitySelect = useCallback((id: string) => {
    const opp = opportunities.find(o => o.id === id);
    if (opp) {
      setSelectedOpportunity(opp);
      setIsDetailModalOpen(true);
    }
  }, [opportunities]);

  const handleDeleteOpportunity = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/opportunities/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        toast.success('Opportunity deleted');
        refetchOpportunities();
        refetchStats();
      } else {
        toast.error('Failed to delete opportunity');
      }
    } catch (error) {
      toast.error('Error deleting opportunity');
    }
  }, [refetchOpportunities, refetchStats]);

  const handleCreateProposal = useCallback((oppId: string) => {
    router.push(`/factory?opportunityId=${oppId}`);
  }, [router]);

  const handleExport = useCallback(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value.toString());
    });
    params.append('sortBy', sort.sortBy);
    params.append('sortOrder', sort.sortOrder);
    
    window.open(`/api/opportunities/export?${params.toString()}`, '_blank');
  }, [filters, sort]);

  const handleInsightClick = useCallback((insight: DashboardInsight) => {
    if (insight.actionUrl) {
      router.push(insight.actionUrl);
    }
  }, [router]);

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Filter opportunities by search query (client-side filtering for better UX)
  const filteredOpportunities = opportunities.filter(opp => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      opp.title?.toLowerCase().includes(query) ||
      opp.description?.toLowerCase().includes(query) ||
      opp.agency?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-900/10 via-slate-900/40 to-slate-900/10 border border-blue-500/10 rounded-2xl p-6 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-[10px] font-bold uppercase rounded-md border border-blue-500/30">AI Insights</span>
            </div>
            <h2 className="text-xl font-bold text-white leading-tight">
              {getGreeting()}, <span className="text-blue-400">{userName}</span>.
              {stats && stats.newOpportunities > 0 && (
                <> There {stats.newOpportunities === 1 ? 'is' : 'are'} <span className="text-blue-400">{stats.newOpportunities} new {stats.newOpportunities === 1 ? 'lead' : 'leads'}</span> available.</>
              )}
            </h2>
            {insights && insights.length > 0 && (
              <p className="text-sm text-slate-400">
                {insights[0].description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          {loading ? (
            <>
              <StatusTileSkeleton />
              <StatusTileSkeleton />
              <StatusTileSkeleton />
              <StatusTileSkeleton />
            </>
          ) : stats ? (
            <>
              <StatusTile
                icon={Target}
                label="Total Opportunities"
                value={stats.totalOpportunities.toString()}
                sub="TRACKED"
                color="blue"
                trend={stats.trends.opportunitiesChange !== 0 ? {
                  value: stats.trends.opportunitiesChange,
                  isPositive: stats.trends.opportunitiesChange > 0,
                } : undefined}
              />
              <StatusTile
                icon={FileText}
                label="New Leads"
                value={stats.newOpportunities.toString()}
                sub="THIS WEEK"
                color="emerald"
              />
              <StatusTile
                icon={Layers}
                label="Active Proposals"
                value={stats.activeProposals.toString()}
                sub="IN PROGRESS"
                color="purple"
              />
              <StatusTile
                icon={CheckCircle2}
                label="Submitted"
                value={stats.submittedProposals.toString()}
                sub="COMPLETED"
                color="amber"
              />
            </>
          ) : null}
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-6">
          {/* Filters and Search */}
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex-1 w-full md:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search opportunities..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-900/40 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder:text-slate-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <FilterPanel
                  filters={filters}
                  onFiltersChange={setFilters}
                  isOpen={isFilterPanelOpen}
                  onToggle={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
                />
                <SortControls sort={sort} onSortChange={setSort} />
                <button
                  onClick={handleExport}
                  className="px-4 py-2 bg-slate-900/40 border border-slate-800 rounded-xl hover:border-slate-700 transition-all flex items-center space-x-2"
                  title="Export to CSV"
                >
                  <Download className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>
          </div>

          {/* Opportunity Feed */}
          <div>
            <div className="flex items-center justify-between px-2 mb-4">
              <div className="flex items-center space-x-3">
                <div className="h-4 w-1 bg-blue-500 rounded-full"></div>
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest">
                  Opportunity Feed ({total})
                </h3>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <OpportunityCardSkeleton />
                <OpportunityCardSkeleton />
                <OpportunityCardSkeleton />
                <OpportunityCardSkeleton />
              </div>
            ) : filteredOpportunities.length === 0 ? (
              <EmptyState
                icon={Target}
                title="No opportunities found"
                description="Try adjusting your filters or search query to find opportunities."
                actionLabel="Clear Filters"
                onAction={() => {
                  setFilters({});
                  setSearchQuery('');
                }}
              />
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredOpportunities.map(opp => (
                    <OpportunityCard
                      key={opp.id}
                      data={opp}
                      onSelect={handleOpportunitySelect}
                      onDelete={handleDeleteOpportunity}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {total > pageSize && (
                  <div className="flex items-center justify-center space-x-2 mt-6">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                      disabled={currentPage === 0}
                      className="px-4 py-2 bg-slate-900/40 border border-slate-800 rounded-lg hover:border-slate-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm text-slate-300"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-slate-400">
                      Page {currentPage + 1} of {Math.ceil(total / pageSize)}
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => p + 1)}
                      disabled={(currentPage + 1) * pageSize >= total}
                      className="px-4 py-2 bg-slate-900/40 border border-slate-800 rounded-lg hover:border-slate-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm text-slate-300"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Global Activity Map */}
          <div className="bg-[#0B1221]/60 border border-slate-800 rounded-xl p-6 relative overflow-hidden h-64 tech-border">
            <div className="absolute top-4 left-4 z-10 flex items-center space-x-2">
              <Globe className="w-4 h-4 text-blue-500 animate-spin-slow" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Global Activity Map</span>
            </div>
            <div className="relative h-full w-full flex items-center justify-center opacity-40">
              {activeDots.map((dot, i) => (
                <div
                  key={i}
                  className="absolute w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,1)]"
                  style={{ left: `${dot.x}%`, top: `${dot.y}%` }}
                >
                  <div className="absolute -inset-2 bg-blue-400/20 rounded-full animate-ping"></div>
                </div>
              ))}
              <BarChart3 className="w-32 h-32 text-slate-800" />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="sticky top-0 space-y-6">
            <NavigatorInterface />

            {/* AI Insights Panel */}
            <div className="bg-[#0B1221]/80 border border-slate-800 rounded-xl p-6 tech-border">
              {loading ? (
                <InsightsPanelSkeleton />
              ) : (
                <AIInsightsPanel
                  insights={insights}
                  loading={loading}
                  onRefresh={refetchInsights}
                  onInsightClick={handleInsightClick}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Opportunity Detail Modal */}
      <OpportunityDetailModal
        opportunity={selectedOpportunity}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onDelete={handleDeleteOpportunity}
        onCreateProposal={handleCreateProposal}
      />

      {/* Error Display */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-900/90 border border-red-500/50 rounded-xl p-4 shadow-lg z-50">
          <p className="text-sm text-red-200">{error}</p>
          <button
            onClick={() => refetch()}
            className="mt-2 text-xs text-red-400 hover:text-red-200 underline"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
};

export default MissionControl;
