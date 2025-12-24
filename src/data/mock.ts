import { Opportunity } from '../types';

export const MOCK_OPPORTUNITIES: Opportunity[] = [
  {
    id: '1',
    title: 'Autonomous Drone Swarm Control Systems',
    agency: 'DARPA',
    value: '$25M - $50M',
    dueDate: '2025-10-15',
    status: 'analyzing',
    matchScore: 94,
    naicsCode: '541715',
    description: 'Development of decentralized command and control architecture for heterogeneous drone swarms in contested environments.'
  },
  {
    id: '2',
    title: 'Cybersecurity Infrastructure Upgrade - Phase III',
    agency: 'Dept of Energy',
    value: '$10M - $15M',
    dueDate: '2025-11-01',
    status: 'new',
    matchScore: 88,
    naicsCode: '541512',
    description: 'Modernization of legacy SCADA systems including zero-trust architecture implementation across regional power grids.'
  },
  {
    id: '3',
    title: 'AI-Enhanced Logistics Optimization',
    agency: 'US Army',
    value: '$5M - $8M',
    dueDate: '2025-09-30',
    status: 'drafting',
    matchScore: 76,
    naicsCode: '541614',
    description: 'Predictive maintenance and supply chain resilience modeling using multimodal data streams for forward operating bases.'
  }
];