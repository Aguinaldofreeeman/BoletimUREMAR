export interface BulletinLink {
  label: string;
  url: string;
}

export interface BulletinTable {
  headers: string[];
  rows: string[][];
}

export interface BulletinItem {
  id: string;
  title: string;
  category: string;
  department?: string;
  targetAudience?: string;
  dateInfo?: string;
  location?: string;
  content: string;
  importantNotes?: string[];
  links?: BulletinLink[];
  school?: string;
  tags?: string[];
  table?: BulletinTable;
}

export interface Bulletin {
  id: string;
  title: string;
  institution: string;
  edition: string;
  date: string;
  leader: string;
  email: string;
  summary: string;
  items: BulletinItem[];
  createdAt: string;
  updatedAt: string;
  status: 'published' | 'draft';
}

export interface SocialPost {
  platform: 'whatsapp' | 'instagram' | 'facebook' | 'twitter' | 'linkedin';
  title: string;
  content: string;
  characterCount: number;
  hashtags: string[];
}

export interface SocialDispatchLog {
  id: string;
  platform: string;
  timestamp: string;
  status: 'success' | 'failed' | 'simulated';
  responseMessage: string;
  payloadSummary: string;
}

export interface SocialIntegrationConfig {
  webhookUrl: string;
  apiKey: string;
  autoPublish: boolean;
  activeChannels: ('whatsapp' | 'instagram' | 'facebook' | 'twitter' | 'linkedin')[];
  history: SocialDispatchLog[];
}
