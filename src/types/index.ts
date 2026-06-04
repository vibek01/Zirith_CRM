export const DEAL_STAGES = [
  'prospecting',
  'connection sent',
  'value delivered',
  'pitch dropped',
  'follow-up',
  'meeting booked',
  'closed won',
  'closed lost',
  'unqualified',
] as const;

export type DealStage = typeof DEAL_STAGES[number];

export interface DealType {
  _id?: string;
  id?: string;
  companyName: string;
  website?: string;
  instagramLink?: string;
  linkedInUrl?: string;
  email?: string;
  contactName?: string;
  currentStage: DealStage;
  assignedOwnerId?: string;
  lastActivityDate: string | Date;
  createdAt: string | Date;
  notes?: { text: string; createdAt: string | Date }[];
}
