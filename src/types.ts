export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  speechCode: string; // For Web Speech synthesis & recognition
}

export interface SubtitleCue {
  id: string;
  startTime: number; // in seconds
  endTime: number; // in seconds
  originalText: string;
  translations: Record<string, string>; // language code -> translated text
}

export interface VideoItem {
  id: string;
  title: string;
  category: string;
  originalLanguage: string;
  videoUrl: string;
  duration: number; // seconds
  thumbnail: string;
  description: string;
  defaultCues: SubtitleCue[];
  isCustomUrl?: boolean;
  isLocalFile?: boolean;
  isLiveMic?: boolean;
  isEmbed?: boolean;
}

export type SubtitleFontSize = 'sm' | 'base' | 'lg' | 'xl' | '2xl';
export type SubtitleColor = 'yellow' | 'white' | 'cyan' | 'green';
export type SubtitlePosition = 'bottom-dock' | 'video-overlay';

export interface SubtitleSettings {
  targetLanguage: string; // code, e.g. 'zh-TW'
  sourceLanguage: string; // 'auto' or code
  bilingualMode: boolean; // show original + translated
  fontSize: SubtitleFontSize;
  fontColor: SubtitleColor;
  bgOpacity: number; // 0 to 100
  position: SubtitlePosition;
  autoTTS: boolean;
  showVocabHints: boolean;
  highContrastBorder: boolean;
}

export type DeviceMode = 'auto' | 'desktop' | 'tablet' | 'mobile';

export interface VocabAnalysis {
  term: string;
  pronunciation: string;
  partOfSpeech: string;
  definition: string;
  nuance: string;
  exampleOriginal: string;
  exampleTranslated: string;
}

export interface VideoSummary {
  title?: string;
  overview: string;
  takeaways: string[];
  keywords: { word: string; translation: string }[];
}

export interface BrowserHistoryItem {
  id: string;
  url: string;
  title: string;
  timestamp: number;
}
