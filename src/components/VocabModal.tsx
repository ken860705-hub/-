import React, { useEffect, useState } from 'react';
import { X, Volume2, Sparkles, BookOpen, Quote, Lightbulb } from 'lucide-react';
import { VocabAnalysis, SubtitleSettings } from '../types';
import { explainVocabulary } from '../services/geminiService';
import { SUPPORTED_LANGUAGES } from '../constants/languages';

interface VocabModalProps {
  isOpen: boolean;
  onClose: () => void;
  word: string;
  contextSentence: string;
  subtitleSettings: SubtitleSettings;
}

export const VocabModal: React.FC<VocabModalProps> = ({
  isOpen,
  onClose,
  word,
  contextSentence,
  subtitleSettings,
}) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<VocabAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const targetLang = SUPPORTED_LANGUAGES.find((l) => l.code === subtitleSettings.targetLanguage) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    if (!isOpen || !word) return;

    let isMounted = true;
    setLoading(true);
    setError(null);
    setData(null);

    explainVocabulary(word, contextSentence, targetLang.nativeName)
      .then((res) => {
        if (isMounted) setData(res);
      })
      .catch((err) => {
        if (isMounted) setError(err.message || '查詢失敗');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, word, contextSentence, subtitleSettings.targetLanguage]);

  if (!isOpen) return null;

  const handleSpeakWord = () => {
    if (!word || !window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US'; // or auto
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-400/10 text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-200">Gemini 智能單字與文法解析</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {loading && (
            <div className="py-10 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-slate-400">正在分析「{word}」在影片上下文中的語意...</p>
            </div>
          )}

          {error && (
            <div className="py-6 text-center text-xs text-red-400">
              抱歉，解析過程遇到錯誤，請重試。
            </div>
          )}

          {data && (
            <div className="space-y-4 text-xs">
              {/* Word & Phonetics */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-xl font-bold text-white tracking-wide">{data.term || word}</h3>
                  <div className="flex items-center gap-2 mt-1 text-slate-400 font-mono text-xs">
                    <span>{data.pronunciation}</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-blue-400 font-semibold">{data.partOfSpeech}</span>
                  </div>
                </div>

                <button
                  onClick={handleSpeakWord}
                  className="p-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 transition-colors"
                  title="朗讀發音"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              {/* Definition */}
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                  <span>釋義 ({targetLang.nativeName})</span>
                </span>
                <p className="text-sm font-semibold text-slate-200 leading-relaxed bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  {data.definition}
                </p>
              </div>

              {/* Nuances / Idioms */}
              {data.nuance && (
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>語境細節與用法特色</span>
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed bg-amber-400/5 border border-amber-400/10 p-2.5 rounded-xl">
                    {data.nuance}
                  </p>
                </div>
              )}

              {/* Example */}
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  <Quote className="w-3.5 h-3.5" />
                  <span>實用例句</span>
                </span>
                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 space-y-1">
                  <p className="text-slate-200 font-medium">{data.exampleOriginal}</p>
                  <p className="text-slate-400 text-[11px]">{data.exampleTranslated}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/70 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
};
