import React, { useEffect, useState } from 'react';
import {
  X,
  Volume2,
  Stethoscope,
  BookOpen,
  Quote,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { MedicalTermAnalysis, SubtitleSettings } from '../types';
import { explainMedicalTerm } from '../services/geminiService';
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
  const [data, setData] = useState<MedicalTermAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const targetLang =
    SUPPORTED_LANGUAGES.find((l) => l.code === subtitleSettings.targetLanguage) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    if (!isOpen || !word) return;

    let isMounted = true;
    setLoading(true);
    setError(null);
    setData(null);

    explainMedicalTerm(word, contextSentence, targetLang.nativeName, subtitleSettings.specialty)
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
  }, [isOpen, word, contextSentence, subtitleSettings.targetLanguage, subtitleSettings.specialty]);

  if (!isOpen) return null;

  const handleSpeakWord = () => {
    if (!word || !window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-400/10 text-cyan-400 border border-cyan-400/20">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">MeSH & 臨床醫學辭典解析</span>
              <span className="text-[10px] text-slate-400">Gemini 3.8 Flash 醫學知識庫</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {loading && (
            <div className="py-12 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-slate-300 font-medium">正在檢索 MeSH / ICD-10 醫學辭典資料庫...</p>
              <p className="text-[11px] text-slate-500">深入分析「{word}」之臨床定義、解剖層次與用藥指引</p>
            </div>
          )}

          {error && (
            <div className="py-8 text-center text-xs text-rose-400 bg-rose-500/10 p-4 rounded-xl border border-rose-500/20">
              醫學辭典查詢發生暫時性問題，請稍候再試。
            </div>
          )}

          {data && (
            <div className="space-y-4 text-xs">
              {/* Term Title & Badges */}
              <div className="pb-3 border-b border-slate-800">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-white tracking-wide flex items-center gap-2">
                      <span>{data.term || word}</span>
                      <button
                        onClick={handleSpeakWord}
                        className="p-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 transition-colors"
                        title="醫學名詞語音發音"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </h3>
                    <div className="text-sm font-semibold text-cyan-400 mt-1">
                      {data.officialTranslation}
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-800/50 text-[11px] font-bold shrink-0">
                    {data.category}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-slate-400">
                  {data.pronunciation && (
                    <span className="font-mono bg-slate-800/80 px-2 py-0.5 rounded">
                      🗣️ {data.pronunciation}
                    </span>
                  )}
                  {data.etymology && (
                    <span className="text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">
                      🏛️ 詞源: {data.etymology}
                    </span>
                  )}
                  {data.meshOrIcdCode && (
                    <span className="font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      {data.meshOrIcdCode}
                    </span>
                  )}
                </div>
              </div>

              {/* Definition */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                  <span>標準臨床醫學定義 ({targetLang.nativeName})</span>
                </span>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                  {data.definition}
                </p>
              </div>

              {/* Clinical Relevance */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                  <Stethoscope className="w-3.5 h-3.5 text-blue-400" />
                  <span>臨床診斷與手術意義</span>
                </span>
                <p className="text-xs text-slate-300 leading-relaxed bg-blue-950/20 border border-blue-900/30 p-3 rounded-xl">
                  {data.clinicalRelevance}
                </p>
              </div>

              {/* Precautions / Warnings */}
              {data.precautions && (
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>手術 / 用藥關鍵警語與注意事項</span>
                  </span>
                  <p className="text-xs text-amber-200/90 leading-relaxed bg-amber-950/25 border border-amber-800/30 p-3 rounded-xl">
                    {data.precautions}
                  </p>
                </div>
              )}

              {/* Example in Context */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                  <Quote className="w-3.5 h-3.5 text-emerald-400" />
                  <span>臨床實際對話或病例紀錄範例</span>
                </span>
                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-1.5">
                  <p className="text-slate-200 font-medium">{data.exampleOriginal}</p>
                  <p className="text-cyan-300 font-medium text-[11px]">{data.exampleTranslated}</p>
                </div>
              </div>

              {/* PubMed Literature Links */}
              {data.pubmedKeywords && data.pubmedKeywords.length > 0 && (
                <div className="space-y-1 pt-1">
                  <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                    <Search className="w-3.5 h-3.5 text-slate-400" />
                    <span>PubMed 醫學期刊文獻檢索關鍵字</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {data.pubmedKeywords.map((kw, i) => (
                      <a
                        key={i}
                        href={`https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(kw)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 text-[11px] font-mono border border-slate-700 transition-colors"
                      >
                        <span>{kw}</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/80 flex justify-end">
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
