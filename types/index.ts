export interface Opportunity {
  id: string;
  samGovId?: string | null;
  title: string;
  agency: string;
  value: string | null;
  dueDate: string | Date | null;
  status: 'new' | 'analyzing' | 'drafting' | 'submitted';
  matchScore: number;
  naicsCode: string | null;
  description: string | null;
  rfpDocumentUrl?: string | null;
  rfpContent?: string | null;
  metadata?: Record<string, any> | null;
  organizationId?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
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

