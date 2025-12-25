'use client';

import { useState, useEffect, useCallback } from 'react';
import { DashboardStats, OpportunityFilters, OpportunitySort, DashboardInsight } from '@/types/dashboard';
import { Opportunity } from '@/types';

interface UseDashboardOptions {
  filters?: OpportunityFilters;
  sort?: OpportunitySort;
  pagination?: { limit: number; offset: number };
}

interface UseDashboardReturn {
  stats: DashboardStats | null;
  opportunities: Opportunity[];
  total: number;
  insights: DashboardInsight[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  refetchStats: () => Promise<void>;
  refetchOpportunities: () => Promise<void>;
  refetchInsights: () => Promise<void>;
}

export function useDashboard(options: UseDashboardOptions = {}): UseDashboardReturn {
  const {
    filters = {},
    sort = { sortBy: 'createdAt', sortOrder: 'desc' },
    pagination = { limit: 25, offset: 0 },
  } = options;

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [total, setTotal] = useState(0);
  const [insights, setInsights] = useState<DashboardInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/dashboard/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data.stats);
    } catch (err: any) {
      console.error('Error fetching stats:', err);
      setError(err.message || 'Failed to fetch dashboard stats');
    }
  }, []);

  const fetchOpportunities = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.agency) params.append('agency', filters.agency);
      if (filters.minMatchScore !== undefined) params.append('minMatchScore', filters.minMatchScore.toString());
      if (filters.maxMatchScore !== undefined) params.append('maxMatchScore', filters.maxMatchScore.toString());
      if (filters.naicsCode) params.append('naicsCode', filters.naicsCode);
      if (filters.search) params.append('search', filters.search);
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);
      params.append('sortBy', sort.sortBy);
      params.append('sortOrder', sort.sortOrder);
      params.append('limit', pagination.limit.toString());
      params.append('offset', pagination.offset.toString());

      const response = await fetch(`/api/opportunities?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch opportunities');
      const data = await response.json();
      setOpportunities(data.opportunities || []);
      setTotal(data.total || 0);
    } catch (err: any) {
      console.error('Error fetching opportunities:', err);
      setError(err.message || 'Failed to fetch opportunities');
    }
  }, [filters, sort, pagination]);

  const fetchInsights = useCallback(async () => {
    try {
      const response = await fetch('/api/dashboard/insights');
      if (!response.ok) throw new Error('Failed to fetch insights');
      const data = await response.json();
      setInsights(data.insights || []);
    } catch (err: any) {
      console.error('Error fetching insights:', err);
      // Don't set error for insights as it's not critical
    }
  }, []);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    await Promise.all([
      fetchStats(),
      fetchOpportunities(),
      fetchInsights(),
    ]);
    setLoading(false);
  }, [fetchStats, fetchOpportunities, fetchInsights]);

  const refetchStats = useCallback(async () => {
    await fetchStats();
  }, [fetchStats]);

  const refetchOpportunities = useCallback(async () => {
    await fetchOpportunities();
  }, [fetchOpportunities]);

  const refetchInsights = useCallback(async () => {
    await fetchInsights();
  }, [fetchInsights]);

  useEffect(() => {
    refetch();
  }, []); // Only on mount

  // Refetch opportunities when filters/sort/pagination change
  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  return {
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
  };
}

