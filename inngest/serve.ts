import { serve } from 'inngest/next';
import { inngest } from './client';
// Import all functions
import { scanOpportunities } from './functions/scan-opportunities';
import { generateProposal } from './functions/generate-proposal';

export const handler = serve({
  client: inngest,
  functions: [
    scanOpportunities,
    generateProposal,
  ],
});

