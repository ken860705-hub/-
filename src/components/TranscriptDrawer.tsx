import React, { useState } from 'react';
import {
  X,
  Search,
  Download,
  Copy,
  Check,
  Sparkles,
  ClipboardList,
  List,
  Play,
  FileCheck,
  Stethoscope,
  Scissors,
  HelpCircle,
  ShieldCheck,
} from 'lucide-react';
import { SubtitleCue, SubtitleSettings, ClinicalSoapReport } from '../types';
import { generateClinicalSoapReport } from '../services/geminiService';
import { SUPPORTED_LANGUAGES } from '../constants/languages';

interface TranscriptDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cues: SubtitleCue[];
  currentTime: number;
  onSeek: (time: number) => void;
  subtitleSettings: SubtitleSettings;
  videoTitle: string;
}

export const TranscriptDrawer: React.FC<TranscriptDrawerProps> = ({
  isOpen,
  onClose,
  cues,
  currentTime,
  onSeek,
  subtitleSettings,
  videoTitle,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'transcript' | 'soap'>('transcript');
  const [soapReport, setSoapReport] = useState<ClinicalSoapReport | null>(null);
  const [isGeneratingSoap, setIsGeneratingSoap] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  if (!isOpen) return null;

  const targetLang =
    SUPPORTED_LANGUAGES.find((l) => l.code === subtitleSettings.targetLanguage) || SUPPORTED_LANGUAGES[0];

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const filteredCues = cues.filter((cue) => {
    const q = searchQuery.toLowerCase();
    const orig = cue.originalText.toLowerCase();
    const trans = (cue.translations[subtitleSettings.targetLanguage] || '').toLowerCase();
    return orig.includes(q) || trans.includes(q);
  });

  // Export Medical SRT
  const handleExportSRT = () => {
    let srtContent = '';
    cues.forEach((cue, idx) => {
      const startH = Math.floor(cue.startTime / 3600);
      const startM = Math.floor((cue.startTime % 3600) / 60);
      const startS = Math.floor(cue.startTime % 60);
      const startMs = Math.floor((cue.startTime % 1) * 1000);

      const endH = Math.floor(cue.endTime / 3600);
      const endM = Math.floor((cue.endTime % 3600) / 60);
      const endS = Math.floor(cue.endTime % 60);
      const endMs = Math.floor((cue.endTime % 1) * 1000);

      const pad = (n: number, z = 2) => String(n).padStart(z, '0');
      const timeStr = `${pad(startH)}:${pad(startM)}:${pad(startS)},${pad(startMs, 3)} --> ${pad(endH)}:${pad(endM)}:${pad(endS)},${pad(endMs, 3)}`;

      const trans = cue.translations[subtitleSettings.targetLanguage] || cue.translations['zh-TW'] || '';
      srtContent += `${idx + 1}\n${timeStr}\n${cue.originalText}\n${trans}\n\n`;
    });

    const blob = new Blob([srtContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `[Medical]_${videoTitle.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')}_subtitles.srt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Copy Full Clinical Transcript
  const handleCopyTranscript = () => {
    const text = cues
      .map(
        (c) =>
          `[${formatTime(c.startTime)}] ${c.originalText}\n => [${targetLang.nativeName}] ${
            c.translations[subtitleSettings.targetLanguage] || ''
          }`
      )
      .join('\n\n');
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  // Generate Clinical SOAP & Surgical Protocol with Gemini
  const handleGenerateSoap = async () => {
    if (cues.length === 0) return;
    setIsGeneratingSoap(true);
    setSelectedAnswer(null);
    try {
      const fullText = cues.map((c) => c.originalText).join(' ');
      const result = await generateClinicalSoapReport(
        fullText,
        targetLang.nativeName,
        videoTitle,
        subtitleSettings.specialty
      );
      setSoapReport(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingSoap(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/90">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('transcript')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'transcript'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>臨床逐字稿 ({cues.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('soap')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'soap'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5 text-cyan-300" />
            <span>SOAP 臨床筆記</span>
          </button>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {activeTab === 'transcript' ? (
        <>
          {/* Search & Actions Bar */}
          <div className="p-3 border-b border-slate-800 bg-slate-950/50 space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="搜尋醫學解剖、術式或藥物對話..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px] flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>{targetLang.flag} {targetLang.nativeName} 醫學術語對齊</span>
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleCopyTranscript}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors"
                  title="複製全部醫學逐字稿"
                >
                  {copiedAll ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>複製</span>
                </button>
                <button
                  onClick={handleExportSRT}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 text-[11px] transition-colors font-medium"
                  title="下載雙語醫療 SRT 字幕檔"
                >
                  <Download className="w-3 h-3" />
                  <span>匯出 .SRT</span>
                </button>
              </div>
            </div>
          </div>

          {/* Cues List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {filteredCues.length > 0 ? (
              filteredCues.map((cue) => {
                const isActive = currentTime >= cue.startTime && currentTime <= cue.endTime;
                const translated =
                  cue.translations[subtitleSettings.targetLanguage] ||
                  cue.translations['zh-TW'] ||
                  cue.originalText;

                return (
                  <div
                    key={cue.id}
                    onClick={() => onSeek(cue.startTime)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-cyan-600/15 border-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                        : 'bg-slate-950/40 border-slate-800/80 text-slate-300 hover:bg-slate-800/50 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span className="font-mono text-cyan-400 font-semibold flex items-center gap-1">
                        <Play className="w-2.5 h-2.5 fill-cyan-400" />
                        {formatTime(cue.startTime)}
                      </span>
                      {isActive && (
                        <span className="bg-cyan-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                          手術中
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-300 font-medium leading-relaxed mb-1">
                      {cue.originalText}
                    </div>
                    <div className="text-xs text-amber-300/90 font-semibold leading-relaxed">
                      {translated}
                    </div>

                    {cue.medicalEntities && cue.medicalEntities.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2 pt-1.5 border-t border-slate-800/60">
                        {cue.medicalEntities.map((ent, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-1.5 py-0.2 rounded bg-slate-900 border border-slate-700 text-slate-300"
                          >
                            {ent.term}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-10 text-xs text-slate-500">
                找不到相符的醫學對話內容
              </div>
            )}
          </div>
        </>
      ) : (
        /* Clinical SOAP Note & CME Study Notes Tab */
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!soapReport ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 flex items-center justify-center mx-auto">
                <FileCheck className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white">智慧 SOAP 病歷與手術記錄生成</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                運用 Gemini 3.8 Flash 解析整部臨床手術或問診影片，自動產生結構化 SOAP 病歷記錄、手術關鍵里程碑與 CME 繼續醫學教育考題。
              </p>
              <button
                onClick={handleGenerateSoap}
                disabled={isGeneratingSoap || cues.length === 0}
                className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-md disabled:opacity-50 inline-flex items-center gap-2"
              >
                {isGeneratingSoap ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                    <span>Gemini AI 正在撰寫臨床病歷報告...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>立即產生 SOAP 臨床報告</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4 text-xs animate-in fade-in duration-200">
              {/* Executive Summary */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                <h4 className="font-bold text-cyan-400 text-xs flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5" />
                  <span>臨床總結與病例概述 (Executive Clinical Summary)</span>
                </h4>
                <p className="text-slate-300 leading-relaxed">{soapReport.executiveSummary}</p>
              </div>

              {/* SOAP Note Sections */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                <h4 className="font-bold text-white text-xs flex items-center gap-1.5 border-b border-slate-800 pb-1.5">
                  <ClipboardList className="w-3.5 h-3.5 text-cyan-400" />
                  <span>結構化臨床 SOAP 病歷記錄</span>
                </h4>

                <div className="space-y-2">
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="font-bold text-amber-400 block mb-0.5">S (Subjective 主訴與病史):</span>
                    <p className="text-slate-300 leading-relaxed">{soapReport.soap.subjective}</p>
                  </div>

                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="font-bold text-cyan-400 block mb-0.5">O (Objective 檢查與術中所見):</span>
                    <p className="text-slate-300 leading-relaxed">{soapReport.soap.objective}</p>
                  </div>

                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="font-bold text-rose-400 block mb-0.5">A (Assessment 臨床診斷與評估):</span>
                    <p className="text-slate-300 leading-relaxed">{soapReport.soap.assessment}</p>
                  </div>

                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="font-bold text-emerald-400 block mb-0.5">P (Plan 手術處置與治療計畫):</span>
                    <p className="text-slate-300 leading-relaxed">{soapReport.soap.plan}</p>
                  </div>
                </div>
              </div>

              {/* Surgical Steps */}
              {soapReport.surgicalSteps?.length > 0 && (
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <h4 className="font-bold text-purple-400 text-xs flex items-center gap-1.5">
                    <Scissors className="w-3.5 h-3.5" />
                    <span>關鍵手術與處置步驟里程碑</span>
                  </h4>
                  <ul className="space-y-1.5 text-slate-300">
                    {soapReport.surgicalSteps.map((step, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-purple-500/20 text-purple-300 font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span className="leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Essential Entities */}
              {soapReport.keyEntities?.length > 0 && (
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <h4 className="font-bold text-emerald-400 text-xs">關鍵解剖標誌與藥理實體</h4>
                  <div className="grid grid-cols-1 gap-1.5">
                    {soapReport.keyEntities.map((ent, idx) => (
                      <div key={idx} className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-xs">{ent.term}</span>
                          <span className="text-[10px] text-cyan-400 font-mono">[{ent.category}]</span>
                        </div>
                        <div className="text-slate-400 text-[11px] mt-0.5">{ent.explanation}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CME Board Exam Question */}
              {soapReport.cmeQuestion && (
                <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-800/40 space-y-2.5">
                  <div className="flex items-center gap-1.5 text-cyan-300 font-bold text-xs">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>CME 繼續醫學教育高頻自測試題</span>
                  </div>
                  <p className="text-slate-200 font-medium leading-relaxed">
                    {soapReport.cmeQuestion.question}
                  </p>
                  <div className="space-y-1.5">
                    {soapReport.cmeQuestion.options.map((opt, oIdx) => {
                      const isCorrect = oIdx === soapReport.cmeQuestion.correctOptionIndex;
                      const isSelected = selectedAnswer === oIdx;
                      return (
                        <button
                          key={oIdx}
                          onClick={() => setSelectedAnswer(oIdx)}
                          className={`w-full text-left p-2 rounded-lg text-xs transition-colors flex items-center justify-between ${
                            selectedAnswer !== null
                              ? isCorrect
                                ? 'bg-emerald-950 border border-emerald-500 text-emerald-200'
                                : isSelected
                                ? 'bg-rose-950 border border-rose-500 text-rose-200'
                                : 'bg-slate-900/60 border border-slate-800 text-slate-400'
                              : 'bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300'
                          }`}
                        >
                          <span>{opt}</span>
                          {selectedAnswer !== null && isCorrect && (
                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-2" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {selectedAnswer !== null && (
                    <div className="text-[11px] p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 leading-relaxed">
                      <span className="font-bold text-cyan-400 block mb-0.5">詳解：</span>
                      {soapReport.cmeQuestion.explanation}
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={handleGenerateSoap}
                disabled={isGeneratingSoap}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>重新生成臨床 SOAP 筆記</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
