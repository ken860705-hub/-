import React, { useState } from 'react';
import {
  Volume2,
  Copy,
  Check,
  Sparkles,
  Globe,
  Sliders,
  ShieldCheck,
  Stethoscope,
  BookOpen,
} from 'lucide-react';
import { SubtitleCue, SubtitleSettings, MedicalEntity } from '../types';
import { SUPPORTED_LANGUAGES } from '../constants/languages';
import { MEDICAL_SPECIALTIES } from '../constants/medicalSpecialties';

interface SubtitleDockProps {
  currentCue: SubtitleCue | null;
  subtitleSettings: SubtitleSettings;
  onOpenSettings: () => void;
  onWordClick: (word: string, contextSentence: string) => void;
  isTranslating?: boolean;
}

export const SubtitleDock: React.FC<SubtitleDockProps> = ({
  currentCue,
  subtitleSettings,
  onOpenSettings,
  onWordClick,
  isTranslating = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const targetLang =
    SUPPORTED_LANGUAGES.find((l) => l.code === subtitleSettings.targetLanguage) || SUPPORTED_LANGUAGES[0];

  const currentSpecialty =
    MEDICAL_SPECIALTIES.find((s) => s.id === subtitleSettings.specialty) || MEDICAL_SPECIALTIES[0];

  const translatedText =
    currentCue?.translations?.[subtitleSettings.targetLanguage] ||
    (currentCue ? currentCue.translations['zh-TW'] || currentCue.originalText : '');

  const originalText = currentCue?.originalText || '';

  // Copy to clipboard
  const handleCopy = () => {
    if (!translatedText) return;
    const fullText = subtitleSettings.bilingualMode
      ? `[Original] ${originalText}\n[Translated - ${targetLang.nativeName}] ${translatedText}`
      : translatedText;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Text-To-Speech
  const handleSpeak = () => {
    if (!translatedText || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(translatedText);
    utterance.lang = targetLang.speechCode;
    utterance.rate = 0.95; // slightly deliberate for medical clarity

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Font size classes
  const fontSizes = {
    sm: { orig: 'text-xs', trans: 'text-sm sm:text-base font-semibold' },
    base: { orig: 'text-sm', trans: 'text-base sm:text-lg font-bold' },
    lg: { orig: 'text-base', trans: 'text-lg sm:text-xl font-bold' },
    xl: { orig: 'text-lg', trans: 'text-xl sm:text-2xl font-black' },
    '2xl': { orig: 'text-xl', trans: 'text-2xl sm:text-3xl font-black' },
  }[subtitleSettings.fontSize] || { orig: 'text-sm', trans: 'text-lg sm:text-xl font-bold' };

  // Color classes for translation
  const colorClasses = {
    yellow: 'text-amber-300 subtitle-gold-glow',
    white: 'text-white subtitle-active-glow',
    cyan: 'text-cyan-300 subtitle-active-glow',
    green: 'text-emerald-300 subtitle-active-glow',
  }[subtitleSettings.fontColor];

  // Opacity
  const bgStyle = {
    backgroundColor: `rgba(10, 15, 29, ${subtitleSettings.bgOpacity / 100})`,
    backdropFilter: subtitleSettings.bgOpacity > 20 ? 'blur(16px)' : 'none',
  };

  // Helper to color medical entities in text
  const entityCategoryBadges: Record<string, { label: string; bg: string; text: string; border: string }> = {
    anatomy: { label: '解剖', bg: 'bg-blue-500/15', text: 'text-blue-300', border: 'border-blue-500/30' },
    procedure: { label: '術式', bg: 'bg-purple-500/15', text: 'text-purple-300', border: 'border-purple-500/30' },
    pathology: { label: '病理', bg: 'bg-rose-500/15', text: 'text-rose-300', border: 'border-rose-500/30' },
    drug: { label: '藥理', bg: 'bg-emerald-500/15', text: 'text-emerald-300', border: 'border-emerald-500/30' },
    imaging: { label: '影像', bg: 'bg-amber-500/15', text: 'text-amber-300', border: 'border-amber-500/30' },
    lab: { label: '檢驗', bg: 'bg-teal-500/15', text: 'text-teal-300', border: 'border-teal-500/30' },
  };

  // Split words for interactive click
  const words = originalText.split(/(\s+)/);

  return (
    <div
      className={`w-full transition-all duration-300 ${
        subtitleSettings.position === 'bottom-dock'
          ? 'border-t border-slate-800/90 bg-slate-950/95 py-3 px-3 sm:px-5 shadow-2xl relative z-20'
          : 'absolute bottom-10 left-0 right-0 px-3 sm:px-6 pointer-events-auto z-30'
      }`}
    >
      <div
        style={bgStyle}
        className={`max-w-5xl mx-auto rounded-2xl p-3 sm:p-4 border transition-all ${
          subtitleSettings.highContrastBorder
            ? 'border-cyan-500/40 shadow-[0_0_25px_rgba(6,182,212,0.2)]'
            : 'border-slate-800/80 shadow-xl'
        }`}
      >
        {/* Top dock meta bar: Medical Specialty & MeSH Verification */}
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2 pb-1.5 border-b border-white/5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1 font-semibold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-lg border border-cyan-800/40">
              <Stethoscope className="w-3.5 h-3.5 text-cyan-400" />
              <span>{currentSpecialty.icon} {currentSpecialty.name}</span>
            </span>

            {subtitleSettings.showMedicalConfidence && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-800/40">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>MeSH / ICD-10 醫學級翻譯認證</span>
              </span>
            )}

            <span className="flex items-center gap-1 font-medium text-slate-300">
              <Globe className="w-3 h-3 text-blue-400" />
              <span>{targetLang.flag} {targetLang.nativeName}</span>
            </span>

            {isTranslating && (
              <span className="flex items-center gap-1 text-[11px] text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full animate-pulse border border-amber-400/20">
                <Sparkles className="w-3 h-3" />
                Gemini 臨床翻譯處理中...
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {/* Quick Speak Button */}
            <button
              onClick={handleSpeak}
              disabled={!translatedText}
              className={`p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors disabled:opacity-40 ${
                isSpeaking ? 'text-cyan-400 bg-cyan-500/20' : ''
              }`}
              title="朗讀醫學翻譯字幕 (TTS 語音發音)"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>

            {/* Copy Subtitle Button */}
            <button
              onClick={handleCopy}
              disabled={!translatedText}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors disabled:opacity-40"
              title="複製醫學字幕文字"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            {/* Subtitle Appearance Settings */}
            <button
              onClick={onOpenSettings}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
              title="調整醫學字幕設定與專科模式"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Subtitle Text Content */}
        {currentCue ? (
          <div className="text-center space-y-1 sm:space-y-2">
            {/* Original Spoken Text (Bilingual Mode) */}
            {subtitleSettings.bilingualMode && originalText && (
              <div
                className={`${fontSizes.orig} text-slate-300 font-medium tracking-wide flex flex-wrap items-center justify-center gap-x-1 leading-relaxed`}
              >
                {subtitleSettings.showVocabHints ? (
                  words.map((chunk, idx) => {
                    const cleanWord = chunk.replace(
                      /^[^\w\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]+|[^\w\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]+$/g,
                      ''
                    );
                    if (!cleanWord || /^\s+$/.test(chunk)) {
                      return <span key={idx}>{chunk}</span>;
                    }

                    // Check if this word matches any medical entity
                    const matchedEntity = currentCue.medicalEntities?.find((e) =>
                      e.term.toLowerCase().includes(cleanWord.toLowerCase())
                    );

                    const badgeStyle = matchedEntity ? entityCategoryBadges[matchedEntity.category] : null;

                    return (
                      <span
                        key={idx}
                        onClick={() => onWordClick(matchedEntity ? matchedEntity.term : cleanWord, originalText)}
                        className={`cursor-pointer transition-all rounded px-1 py-0.5 ${
                          badgeStyle
                            ? `${badgeStyle.bg} ${badgeStyle.text} border ${badgeStyle.border} font-semibold hover:scale-105`
                            : 'hover:text-cyan-300 hover:underline decoration-cyan-400/60'
                        }`}
                        title={
                          matchedEntity
                            ? `[${badgeStyle?.label}] 點擊查詢 MeSH/ICD 醫學辭典: "${matchedEntity.term}"`
                            : `點擊查詢醫學術語: "${cleanWord}"`
                        }
                      >
                        {chunk}
                      </span>
                    );
                  })
                ) : (
                  <span>{originalText}</span>
                )}
              </div>
            )}

            {/* Translated Medical Subtitle */}
            <div className={`${fontSizes.trans} ${colorClasses} tracking-wider transition-all duration-200 leading-snug`}>
              {translatedText || <span className="italic opacity-60">醫學即時翻譯生成中...</span>}
            </div>

            {/* Medical Entities Quick Badge Strip */}
            {subtitleSettings.highlightMedicalEntities && currentCue.medicalEntities && currentCue.medicalEntities.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
                <span className="text-[10px] text-slate-500 font-medium">關鍵醫學實體：</span>
                {currentCue.medicalEntities.map((ent, idx) => {
                  const badge = entityCategoryBadges[ent.category] || entityCategoryBadges.anatomy;
                  return (
                    <button
                      key={idx}
                      onClick={() => onWordClick(ent.term, originalText)}
                      className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border ${badge.bg} ${badge.border} ${badge.text} hover:opacity-80 transition-opacity`}
                    >
                      <span className="font-bold text-[9px] uppercase tracking-wider">[{badge.label}]</span>
                      <span className="font-medium">{ent.term}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-2.5 text-xs sm:text-sm text-slate-500 flex items-center justify-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            <span>正在同步監聽臨床手術音訊與時間軸... 醫學專科翻譯字幕將自動顯示於此</span>
          </div>
        )}

        {/* Clinical Note Footer */}
        {subtitleSettings.bilingualMode && subtitleSettings.showVocabHints && currentCue && (
          <div className="text-[10px] text-slate-500 text-center mt-1.5 hidden sm:flex items-center justify-center gap-2">
            <BookOpen className="w-3 h-3 text-cyan-400" />
            <span>點擊上方任意解剖、病理或藥物名詞，即可查詢 MeSH 臨床定義、適應症與 PubMed 論文索引</span>
          </div>
        )}
      </div>
    </div>
  );
};
