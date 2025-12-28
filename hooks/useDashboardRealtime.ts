'use client';

import { useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface UseDashboardRealtimeOptions {
  onOpportunityChange?: (payload: any) => void;
  onProposalChange?: (payload: any) => void;
  onAgentChange?: (payload: any) => void;
}

export function useDashboardRealtime(options: UseDashboardRealtimeOptions = {}) {
  const { onOpportunityChange, onProposalChange, onAgentChange } = options;
  const supabase = createClient();

  useEffect(() => {
    const channels: RealtimeChannel[] = [];

    // Subscribe to opportunities changes
    if (onOpportunityChange) {
      const oppChannel = supabase
        .channel('opportunities-realtime')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'opportunities',
          },
          (payload) => {
            onOpportunityChange(payload);
          }
        )
        .subscribe();
      channels.push(oppChannel);
    }

    // Subscribe to proposals changes
    if (onProposalChange) {
      const propChannel = supabase
        .channel('proposals-realtime')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'proposals',
          },
          (payload) => {
            onProposalChange(payload);
          }
        )
        .subscribe();
      channels.push(propChannel);
    }

    // Subscribe to search_agents changes
    if (onAgentChange) {
      const agentChannel = supabase
        .channel('agents-realtime')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'search_agents',
          },
          (payload) => {
            onAgentChange(payload);
          }
        )
        .subscribe();
      channels.push(agentChannel);
    }

    return () => {
      channels.forEach(channel => {
        supabase.removeChannel(channel);
      });
    };
  }, [supabase, onOpportunityChange, onProposalChange, onAgentChange]);
}



