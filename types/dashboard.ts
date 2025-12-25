export interface DashboardStats {
  totalOpportunities: number;
  newOpportunities: number;
  activeProposals: number;
  submittedProposals: number;
  totalValueTracked: string;
  averageMatchScore: number;
  activeAgents: number;
  upcomingDeadlines: number;
  trends: {
    opportunitiesChange: number;
    proposalsChange: number;
  };
}

export interface DashboardInsight {
  id: string;
  type: 'opportunity' | 'deadline' | 'proposal' | 'agent';
  title: string;
  description: string;
  confidence: number;
  actionUrl?: string;
  priority: 'high' | 'medium' | 'low';
}

export interface OpportunityFilters {
  status?: string;
  agency?: string;
  minMatchScore?: number;
  maxMatchScore?: number;
  naicsCode?: string;
  minValue?: string;
  maxValue?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface OpportunitySort {
  sortBy: 'matchScore' | 'dueDate' | 'value' | 'createdAt' | 'updatedAt';
  sortOrder: 'asc' | 'desc';
}

export interface OpportunityAnalysis {
  winProbability: number;
  riskAssessment: {
    level: 'Low' | 'Medium' | 'High';
    reasoning: string;
    factors: string[];
  };
  complianceStatus: {
    isCompliant: boolean;
    score: number;
    issues: string[];
  };
  recommendedActions: string[];
  matchExplanation: string;
  similarOpportunities: Array<{
    id: string;
    title: string;
    matchScore: number;
  }>;
}

export interface DashboardContext {
  user: {
    name: string;
    org: string;
  };
  opportunities: {
    total: number;
    byStatus: Record<string, number>;
    byAgency: Record<string, number>;
    highMatch: Array<{ id: string; matchScore: number }>;
    upcomingDeadlines: Array<{ id: string; dueDate: string }>;
  };
  proposals: {
    active: number;
    completed: number;
    metrics: {
      completionRate: number;
      averageTimeToComplete: number;
    };
  };
  agents: {
    active: number;
    recentRuns: Array<{ id: string; opportunitiesFound: number }>;
  };
  pastPerformance: {
    relevant: Array<{ id: string; title: string; agency: string }>;
    patterns: {
      topAgencies: string[];
      winRate: number;
    };
  };
}

