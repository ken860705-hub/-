import React, { useState } from 'react';
import { Volume2, Copy, Check, Sparkles, Globe, Settings2, Sliders } from 'lucide-react';
import { SubtitleCue, SubtitleSettings } from '../types';
import { SUPPORTED_LANGUAGES } from '../constants/languages';

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

  const targetLang = SUPPORTED_LANGUAGES.find((l) => l.code === subtitleSettings.targetLanguage) || SUPPORTED_LANGUAGES[0];

  const translatedText = currentCue?.translations?.[subtitleSettings.targetLanguage] ||
    (currentCue ? currentCue.translations['zh-TW'] || currentCue.originalText : '');

  const originalText = currentCue?.originalText || '';

  // Copy to clipboard
  const handleCopy = () => {
    if (!translatedText) return;
    const fullText = subtitleSettings.bilingualMode
      ? `${originalText}\n${translatedText}`
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
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

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
    backgroundColor: `rgba(15, 23, 42, ${subtitleSettings.bgOpacity / 100})`,
    backdropFilter: subtitleSettings.bgOpacity > 20 ? 'blur(12px)' : 'none',
  };

  // Split words for interactive click
  const words = originalText.split(/(\s+)/);

  return (
    <div
      className={`w-full transition-all duration-300 ${
        subtitleSettings.position === 'bottom-dock'
          ? 'border-t border-slate-800/80 bg-slate-950/95 py-3 px-4 shadow-2xl relative z-20'
          : 'absolute bottom-12 left-0 right-0 px-4 pointer-events-auto z-30'
      }`}
    >
      <div
        style={bgStyle}
        className={`max-w-4xl mx-auto rounded-2xl p-3 sm:p-4 border transition-all ${
          subtitleSettings.highContrastBorder
            ? 'border-blue-500/50 shadow-[0_0_20px_rgba(37,99,235,0.25)]'
            : 'border-slate-800/60 shadow-lg'
        }`}
      >
        {/* Top dock meta bar */}
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 pb-1 border-b border-white/5">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 font-medium text-blue-400">
              <Globe className="w-3.5 h-3.5" />
              <span>{targetLang.flag} {targetLang.nativeName} 自動翻譯</span>
            </span>
            {isTranslating && (
              <span className="flex items-center gap-1 text-[11px] text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full animate-pulse">
                <Sparkles className="w-3 h-3" />
                AI 即時生成中...
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {/* Quick Speak Button */}
            <button
              onClick={handleSpeak}
              disabled={!translatedText}
              className={`p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors disabled:opacity-40 ${
                isSpeaking ? 'text-blue-400 bg-blue-500/20' : ''
              }`}
              title="朗讀翻譯字幕 (TTS)"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>

            {/* Copy Subtitle Button */}
            <button
              onClick={handleCopy}
              disabled={!translatedText}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors disabled:opacity-40"
              title="複製字幕文字"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            {/* Subtitle Appearance Settings */}
            <button
              onClick={onOpenSettings}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
              title="調整字幕樣式"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Subtitle Text Content */}
        {currentCue ? (
          <div className="text-center space-y-1 sm:space-y-1.5">
            {/* Original Subtitle (Bilingual mode) */}
            {subtitleSettings.bilingualMode && originalText && (
              <div className={`${fontSizes.orig} text-slate-300 font-medium tracking-wide flex flex-wrap items-center justify-center gap-x-1`}>
                {subtitleSettings.showVocabHints ? (
                  words.map((chunk, idx) => {
                    const cleanWord = chunk.replace(/^[^\w\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]+|[^\w\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]+$/g, '');
                    if (!cleanWord || /^\s+$/.test(chunk)) {
                      return <span key={idx}>{chunk}</span>;
                    }
                    return (
                      <span
                        key={idx}
                        onClick={() => onWordClick(cleanWord, originalText)}
                        className="cursor-pointer hover:text-blue-400 hover:underline decoration-blue-400/60 transition-colors rounded px-0.5"
                        title={`點擊查詢 "${cleanWord}" 的單字語法解釋`}
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

            {/* Translated Subtitle */}
            <div className={`${fontSizes.trans} ${colorClasses} tracking-wider transition-all duration-200`}>
              {translatedText || (
                <span className="italic opacity-60">翻譯準備中...</span>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-2 text-xs sm:text-sm text-slate-500 flex items-center justify-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-500/60 animate-ping"></span>
            <span>正在同步監聽影片音訊與時間軸... 自動翻譯字幕將顯示於此</span>
          </div>
        )}

        {/* Word click hint footer */}
        {subtitleSettings.bilingualMode && subtitleSettings.showVocabHints && currentCue && (
          <div className="text-[10px] text-slate-500 text-center mt-1.5 hidden sm:block">
            💡 提示：點擊上方原文中的任何單字，即可使用 Gemini AI 查詢詳細釋義與文法例句
          </div>
        )}
      </div>
    </div>
  );
};
