export interface Accomplishment {
  id: string;
  text: string;
  rating: number;
  timestamp: Date;
}

export type LoadingState = 'idle' | 'saving' | 'error' | 'success';

export type TimeframeType = 'month' | 'year';

export interface Insight {
  id: string;
  timeframeType: TimeframeType;
  timeframeKey: string;        // "2026-02" for month, "2026" for year
  content: string;              // AI-generated markdown text
  generatedAt: Date;
  accomplishmentCount: number;
  accomplishmentIds: string[];  // For staleness detection
}