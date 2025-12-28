import { createClient } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface DashboardSubscriptionCallbacks {
  onOpportunityInsert?: (payload: any) => void;
  onOpportunityUpdate?: (payload: any) => void;
  onOpportunityDelete?: (payload: any) => void;
  onProposalUpdate?: (payload: any) => void;
  onAgentRunComplete?: (payload: any) => void;
}

export function subscribeToDashboardUpdates(
  callbacks: DashboardSubscriptionCallbacks
): () => void {
  const supabase = createClient();
  const channels: RealtimeChannel[] = [];

  // Opportunities subscription
  if (callbacks.onOpportunityInsert || callbacks.onOpportunityUpdate || callbacks.onOpportunityDelete) {
    const oppChannel = supabase
      .channel('dashboard-opportunities')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'opportunities',
        },
        (payload) => callbacks.onOpportunityInsert?.(payload)
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'opportunities',
        },
        (payload) => callbacks.onOpportunityUpdate?.(payload)
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'opportunities',
        },
        (payload) => callbacks.onOpportunityDelete?.(payload)
      )
      .subscribe();
    channels.push(oppChannel);
  }

  // Proposals subscription
  if (callbacks.onProposalUpdate) {
    const propChannel = supabase
      .channel('dashboard-proposals')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'proposals',
        },
        (payload) => callbacks.onProposalUpdate?.(payload)
      )
      .subscribe();
    channels.push(propChannel);
  }

  // Agent runs subscription
  if (callbacks.onAgentRunComplete) {
    const agentChannel = supabase
      .channel('dashboard-agent-runs')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'agent_runs',
        },
        (payload) => {
          // Only trigger if status changed to completed
          if (payload.new?.status === 'completed') {
            callbacks.onAgentRunComplete?.(payload);
          }
        }
      )
      .subscribe();
    channels.push(agentChannel);
  }

  // Return unsubscribe function
  return () => {
    channels.forEach(channel => {
      supabase.removeChannel(channel);
    });
  };
}



