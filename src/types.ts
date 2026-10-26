export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  speechCode: string; // For Web Speech synthesis & recognition
}

export type MedicalSpecialty =
  | 'surgery'
  | 'cardiology'
  | 'oncology'
  | 'neurology'
  | 'radiology'
  | 'pharmacology'
  | 'critical_care'
  | 'general';

export interface MedicalEntity {
  term: string;
  category: 'anatomy' | 'procedure' | 'pathology' | 'drug' | 'imaging' | 'lab';
}

export interface SubtitleCue {
  id: string;
  startTime: number; // in seconds
  endTime: number; // in seconds
  originalText: string;
  translations: Record<string, string>; // language code -> translated text
  medicalEntities?: MedicalEntity[];
  clinicalSignificance?: string;
}

export interface VideoItem {
  id: string;
  title: string;
  category: string;
  specialty: MedicalSpecialty;
  originalLanguage: string;
  videoUrl: string;
  duration: number; // seconds
  thumbnail: string;
  description: string;
  surgicalProcedure?: string;
  icdCode?: string;
  meshTerms?: string[];
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
  specialty: MedicalSpecialty;
  bilingualMode: boolean; // show original + translated
  fontSize: SubtitleFontSize;
  fontColor: SubtitleColor;
  bgOpacity: number; // 0 to 100
  position: SubtitlePosition;
  autoTTS: boolean;
  showVocabHints: boolean;
  highlightMedicalEntities: boolean; // Highlight anatomy, drugs, procedures
  showMedicalConfidence: boolean; // Show MeSH verified badge
  highContrastBorder: boolean;
}

export type DeviceMode = 'auto' | 'desktop' | 'tablet' | 'mobile';

export interface MedicalTermAnalysis {
  term: string;
  officialTranslation: string;
  category: string;
  etymology?: string;
  pronunciation?: string;
  definition: string;
  clinicalRelevance: string;
  precautions?: string;
  meshOrIcdCode?: string;
  exampleOriginal: string;
  exampleTranslated: string;
  pubmedKeywords?: string[];
}

export interface ClinicalSoapReport {
  title?: string;
  executiveSummary: string;
  soap: {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
  };
  surgicalSteps: string[];
  keyEntities: Array<{
    term: string;
    category: string;
    explanation: string;
  }>;
  cmeQuestion: {
    question: string;
    options: string[];
    correctOptionIndex: number;
    explanation: string;
  };
}

export interface BrowserHistoryItem {
  id: string;
  url: string;
  title: string;
  timestamp: number;
}
