export interface Opportunity {
  id: string;
  title: string;
  agency: string;
  value: string;
  dueDate: string;
  status: 'new' | 'analyzing' | 'drafting' | 'submitted';
  matchScore: number;
  naicsCode: string;
  description: string;
}

export interface Artifact {
  id: string;
  name: string;
  type: 'pdf' | 'docx' | 'pptx' | 'xlsx' | 'txt';
  status: 'ready' | 'processing';
  opportunityId: string;
  size: string;
  date: string;
  oppName?: string;
}

export enum ConnectionState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  ERROR = 'error',
}