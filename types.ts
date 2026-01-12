export interface Accomplishment {
  id: string;
  text: string;
  rating: number;
  timestamp: Date;
  aiInsight?: string; // Optional AI generated compliment/insight
}

export type LoadingState = 'idle' | 'saving' | 'analyzing' | 'error' | 'success';