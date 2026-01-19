export type AppStatus = 'idle' | 'loading' | 'success' | 'error';

export interface TranscriptSegment {
  timestamp: string;
  text: string;
}

export interface TranscriptionResult {
  duration: string;
  language: string;
  segments: TranscriptSegment[];
}

export interface TranscriptionState {
  url: string;
  status: AppStatus;
  transcript: TranscriptionResult | null;
  errorMessage: string | null;
  
  // Actions
  setUrl: (url: string) => void;
  fetchTranscription: () => Promise<void>;
  reset: () => void;
}
