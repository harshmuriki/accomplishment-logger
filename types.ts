export interface Accomplishment {
  id: string;
  text: string;
  rating: number;
  timestamp: Date;
}

export type LoadingState = 'idle' | 'saving' | 'error' | 'success';