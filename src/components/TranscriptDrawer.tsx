import React, { useState } from 'react';
import {
  X,
  Search,
  Download,
  Copy,
  Check,
  Sparkles,
  BookOpen,
  List,
  Play,
  Share2,
} from 'lucide-react';
import { SubtitleCue, SubtitleSettings, VideoSummary } from '../types';
import { summarizeTranscript } from '../services/geminiService';
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
  const [activeTab, setActiveTab] = useState<'transcript' | 'summary'>('transcript');
  const [summary, setSummary] = useState<VideoSummary | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);

  if (!isOpen) return null;

  const targetLang = SUPPORTED_LANGUAGES.find((l) => l.code === subtitleSettings.targetLanguage) || SUPPORTED_LANGUAGES[0];

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

  // Export SRT
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
    a.download = `${videoTitle.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')}_subtitles.srt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Copy Full Transcript
  const handleCopyTranscript = () => {
    const text = cues
      .map((c) => `[${formatTime(c.startTime)}] ${c.originalText}\n -> ${c.translations[subtitleSettings.targetLanguage] || ''}`)
      .join('\n\n');
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  // Generate AI Summary with Gemini
  const handleGenerateSummary = async () => {
    if (cues.length === 0) return;
    setIsGeneratingSummary(true);
    try {
      const fullText = cues.map((c) => c.originalText).join(' ');
      const result = await summarizeTranscript(fullText, targetLang.nativeName, videoTitle);
      setSummary(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('transcript')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'transcript'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>逐字稿 ({cues.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('summary')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'summary'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>AI 筆記摘要</span>
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
          <div className="p-3 border-b border-slate-800 bg-slate-950/40 space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="搜尋對話原文或翻譯內容..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">目標語言: {targetLang.flag} {targetLang.nativeName}</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleCopyTranscript}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors"
                  title="複製全部逐字稿"
                >
                  {copiedAll ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>複製</span>
                </button>
                <button
                  onClick={handleExportSRT}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-[11px] transition-colors font-medium"
                  title="下載雙語 SRT 字幕檔"
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
                const translated = cue.translations[subtitleSettings.targetLanguage] ||
                  cue.translations['zh-TW'] || cue.originalText;

                return (
                  <div
                    key={cue.id}
                    onClick={() => onSeek(cue.startTime)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-blue-600/15 border-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.2)]'
                        : 'bg-slate-950/40 border-slate-800/80 text-slate-300 hover:bg-slate-800/50 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span className="font-mono text-blue-400 font-semibold flex items-center gap-1">
                        <Play className="w-2.5 h-2.5 fill-blue-400" />
                        {formatTime(cue.startTime)}
                      </span>
                      {isActive && (
                        <span className="bg-blue-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                          播放中
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-300 font-medium leading-relaxed mb-1">
                      {cue.originalText}
                    </div>
                    <div className="text-xs text-amber-300/90 font-semibold leading-relaxed">
                      {translated}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-10 text-xs text-slate-500">
                找不到相符的字幕內容
              </div>
            )}
          </div>
        </>
      ) : (
        /* AI Summary & Learning Notes Tab */
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!summary ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-400/10 text-amber-400 border border-amber-400/20 flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white">智慧影片總結與關鍵詞學習</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                利用 Gemini 3.8 Flash 分析整部影片的對話逐字稿，自動整理出核心大綱與關鍵詞彙。
              </p>
              <button
                onClick={handleGenerateSummary}
                disabled={isGeneratingSummary || cues.length === 0}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md disabled:opacity-50 inline-flex items-center gap-2"
              >
                {isGeneratingSummary ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                    <span>Gemini AI 正在分析全文...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>立即產生 AI 筆記摘要</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4 text-xs animate-in fade-in duration-200">
              {/* Overview */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                <h4 className="font-bold text-blue-400 text-xs flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>核心內容概述</span>
                </h4>
                <p className="text-slate-300 leading-relaxed">{summary.overview}</p>
              </div>

              {/* Takeaways */}
              {summary.takeaways?.length > 0 && (
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <h4 className="font-bold text-emerald-400 text-xs">重點摘要 (Key Takeaways)</h4>
                  <ul className="space-y-1.5 text-slate-300">
                    {summary.takeaways.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Keywords */}
              {summary.keywords?.length > 0 && (
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <h4 className="font-bold text-amber-400 text-xs">影片核心關鍵詞與釋義</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {summary.keywords.map((kw, idx) => (
                      <div key={idx} className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="font-bold text-white text-xs">{kw.word}</span>
                        <div className="text-slate-400 text-[11px] mt-0.5">{kw.translation}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleGenerateSummary}
                disabled={isGeneratingSummary}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>重新生成摘要</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
