
export type AppStatus = 'idle' | 'loading' | 'success' | 'error';
export type ViewMode = 'home' | 'history';

export interface TranscriptSegment {
  timestamp: string;
  text: string;
}

export interface TranscriptionResult {
  title?: string; // Added title
  duration: string;
  language: string;
  segments: TranscriptSegment[];
}

export interface HistoryItem {
  id: string;
  created_at: string;
  video_url: string;
  video_title: string;
  duration: string;
  status: 'success' | 'error';
  content: TranscriptionResult | null;
}

export interface TranscriptionState {
  // Navigation
  view: ViewMode;
  setView: (view: ViewMode) => void;

  // Transcription
  url: string;
  status: AppStatus;
  transcript: TranscriptionResult | null;
  errorMessage: string | null;
  
  // Real-time Loading State
  progress: number;
  loadingMessage: string;

  // History
  history: HistoryItem[];
  fetchHistory: () => Promise<void>;

  // Actions
  setUrl: (url: string) => void;
  fetchTranscription: () => Promise<void>;
  fixGrammar: () => Promise<string>;
  updateTranscript: (newText: string) => void;
  reset: () => void;
}