import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Sparkles, Globe, Radio, RefreshCw } from 'lucide-react';
import { SubtitleCue, SubtitleSettings } from '../types';
import { SUPPORTED_LANGUAGES, SOURCE_LANGUAGES } from '../constants/languages';
import { translateSubtitle } from '../services/geminiService';

interface LiveMicViewProps {
  subtitleSettings: SubtitleSettings;
  onNewLiveCue: (cue: SubtitleCue) => void;
  isListening: boolean;
  onToggleListening: () => void;
}

export const LiveMicView: React.FC<LiveMicViewProps> = ({
  subtitleSettings,
  onNewLiveCue,
  isListening,
  onToggleListening,
}) => {
  const [liveInterim, setLiveInterim] = useState('');
  const [recognitionLogs, setRecognitionLogs] = useState<Array<{ original: string; translated: string; time: string }>>([]);
  const [selectedSourceLang, setSelectedSourceLang] = useState('en-US');
  const recognitionRef = useRef<any>(null);

  const targetLang = SUPPORTED_LANGUAGES.find((l) => l.code === subtitleSettings.targetLanguage) || SUPPORTED_LANGUAGES[0];

  // Speech Recognition initialization
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('SpeechRecognition API not supported in this browser.');
      return;
    }

    if (isListening) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = selectedSourceLang;

      recognition.onresult = async (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        setLiveInterim(interim);

        if (final.trim()) {
          const textToTranslate = final.trim();
          setLiveInterim('');

          // Translate with Gemini
          const translated = await translateSubtitle(textToTranslate, targetLang.nativeName, selectedSourceLang);

          const now = new Date();
          const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

          const cue: SubtitleCue = {
            id: `live-${Date.now()}`,
            startTime: Date.now() / 1000,
            endTime: Date.now() / 1000 + 4,
            originalText: textToTranslate,
            translations: {
              [subtitleSettings.targetLanguage]: translated,
            },
          };

          onNewLiveCue(cue);
          setRecognitionLogs((prev) => [{ original: textToTranslate, translated, time: timeString }, ...prev.slice(0, 30)]);
        }
      };

      recognition.onerror = (e: any) => {
        console.error('Speech recognition error:', e.error);
      };

      recognition.onend = () => {
        // Auto restart if still supposed to listen
        if (isListening) {
          try {
            recognition.start();
          } catch (e) {
            // Ignore already started error
          }
        }
      };

      try {
        recognition.start();
        recognitionRef.current = recognition;
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isListening, selectedSourceLang, subtitleSettings.targetLanguage]);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-900/60 flex flex-col items-center">
      <div className="w-full max-w-2xl space-y-6">
        {/* Card Header */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-6 text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-semibold border border-purple-500/20">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>即時語音識別與同聲傳譯</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white">
            即時收音翻譯模式 (Live Audio Translator)
          </h2>

          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
            開啟麥克風或播放周遭其他視訊、講座、會議，系統將即時擷取語音並透過 Gemini AI 同步翻譯，直接呈現在下方字幕欄！
          </p>

          {/* Source Language Picker */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="text-xs text-slate-400">來源發音語言：</span>
            {[
              { code: 'en-US', label: '英語 (English)' },
              { code: 'ja-JP', label: '日語 (日本語)' },
              { code: 'ko-KR', label: '韓語 (한국어)' },
              { code: 'fr-FR', label: '法語 (Français)' },
              { code: 'es-ES', label: '西語 (Español)' },
              { code: 'zh-TW', label: '中文 (國語)' },
            ].map((lang) => (
              <button
                key={lang.code}
                onClick={() => setSelectedSourceLang(lang.code)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-all ${
                  selectedSourceLang === lang.code
                    ? 'bg-purple-600 border-purple-500 text-white'
                    : 'bg-slate-900 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>

          {/* Large Action Button */}
          <div className="pt-4">
            <button
              onClick={onToggleListening}
              className={`px-6 py-3.5 rounded-2xl font-bold text-sm transition-all shadow-xl inline-flex items-center gap-3 ${
                isListening
                  ? 'bg-red-600 hover:bg-red-500 text-white animate-pulse ring-4 ring-red-500/30'
                  : 'bg-purple-600 hover:bg-purple-500 text-white ring-4 ring-purple-500/20'
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-5 h-5" />
                  <span>停止即時收音辨識</span>
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5" />
                  <span>開始即時收音辨識與翻譯</span>
                </>
              )}
            </button>
          </div>

          {/* Listening status indicator */}
          {isListening && (
            <div className="pt-2 flex items-center justify-center gap-2 text-xs text-emerald-400 animate-pulse font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span>正在即時聆聽語音... (目標語言: {targetLang.flag} {targetLang.nativeName})</span>
            </div>
          )}
        </div>

        {/* Interim Speech Preview */}
        {liveInterim && (
          <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 text-center animate-pulse">
            <div className="text-[11px] text-purple-300 font-semibold mb-1">正在辨識當前語句...</div>
            <div className="text-base font-bold text-white tracking-wide">"{liveInterim}"</div>
          </div>
        )}

        {/* Real-time Recognition & Translation Logs */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300 pb-2 border-b border-slate-800">
            <span>即時辨識與翻譯對話記錄</span>
            <span className="text-slate-500">{recognitionLogs.length} 則已處理</span>
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto">
            {recognitionLogs.length > 0 ? (
              recognitionLogs.map((log, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span>{log.time}</span>
                    <span className="text-purple-400 font-semibold">Gemini 3.8 Flash 已翻譯</span>
                  </div>
                  <div className="text-xs text-slate-300 font-medium">{log.original}</div>
                  <div className="text-xs text-amber-300 font-bold">{log.translated}</div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-slate-500">
                尚未開始辨識，點擊上方按鈕即可啟動麥克風即時收音翻譯
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
