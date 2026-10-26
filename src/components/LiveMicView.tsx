import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Stethoscope, Sparkles, Globe, Radio, ShieldCheck } from 'lucide-react';
import { SubtitleCue, SubtitleSettings } from '../types';
import { SUPPORTED_LANGUAGES } from '../constants/languages';
import { translateSubtitle } from '../services/geminiService';
import { MEDICAL_SPECIALTIES } from '../constants/medicalSpecialties';

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
  const [recognitionLogs, setRecognitionLogs] = useState<
    Array<{ original: string; translated: string; time: string }>
  >([]);
  const [selectedSourceLang, setSelectedSourceLang] = useState('en-US');
  const recognitionRef = useRef<any>(null);

  const targetLang =
    SUPPORTED_LANGUAGES.find((l) => l.code === subtitleSettings.targetLanguage) || SUPPORTED_LANGUAGES[0];

  const currentSpecialty =
    MEDICAL_SPECIALTIES.find((s) => s.id === subtitleSettings.specialty) || MEDICAL_SPECIALTIES[0];

  // Speech Recognition initialization
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

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

          // Translate with Gemini Medical Interpreter
          const translated = await translateSubtitle(
            textToTranslate,
            targetLang.nativeName,
            selectedSourceLang,
            subtitleSettings.specialty
          );

          const now = new Date();
          const timeString = `${now.getHours().toString().padStart(2, '0')}:${now
            .getMinutes()
            .toString()
            .padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

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
          setRecognitionLogs((prev) => [
            { original: textToTranslate, translated, time: timeString },
            ...prev.slice(0, 30),
          ]);
        }
      };

      recognition.onerror = (e: any) => {
        console.error('Clinical speech recognition error:', e.error);
      };

      recognition.onend = () => {
        if (isListening) {
          try {
            recognition.start();
          } catch (e) {
            // Ignore already started
          }
        }
      };

      try {
        recognition.start();
        recognitionRef.current = recognition;
      } catch (err) {
        console.error('Failed to start clinical speech recognition:', err);
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
  }, [isListening, selectedSourceLang, subtitleSettings.targetLanguage, subtitleSettings.specialty]);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-900/60 flex flex-col items-center">
      <div className="w-full max-w-2xl space-y-6">
        {/* Card Header */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-6 text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-semibold border border-cyan-500/20">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>臨床查房與跨國醫病問診即時傳譯</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white">
            臨床問診即時語音傳譯模式
          </h2>

          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
            於晨會查房、病房探視或跨國病患諮詢時開啟收音。系統即時辨識主訴與病徵描述，運用 Gemini 3.8 Flash 以專業醫學術語同步輸出翻譯字幕於畫面下方！
          </p>

          {/* Current Specialty Banner */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300">
            <span className="text-cyan-400 font-bold">當前醫學術語庫：</span>
            <span>{currentSpecialty.icon} {currentSpecialty.name}</span>
          </div>

          {/* Source Language Picker */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="text-xs text-slate-400">醫師/病患發音語言：</span>
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
                    ? 'bg-cyan-600 border-cyan-500 text-white'
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
                  ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse ring-4 ring-rose-500/30'
                  : 'bg-cyan-600 hover:bg-cyan-500 text-white ring-4 ring-cyan-500/20'
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-5 h-5" />
                  <span>停止臨床語音辨識</span>
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5" />
                  <span>開始臨床即時問診辨識與翻譯</span>
                </>
              )}
            </button>
          </div>

          {/* Status Indicator */}
          {isListening && (
            <div className="pt-2 flex items-center justify-center gap-2 text-xs text-emerald-400 animate-pulse font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span>正在監聽臨床對話... (目標語言: {targetLang.flag} {targetLang.nativeName})</span>
            </div>
          )}
        </div>

        {/* Interim Speech Preview */}
        {liveInterim && (
          <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-center animate-pulse">
            <div className="text-[11px] text-cyan-300 font-semibold mb-1">正在辨識語句...</div>
            <div className="text-base font-bold text-white tracking-wide">"{liveInterim}"</div>
          </div>
        )}

        {/* Clinical Dialogue Logs */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300 pb-2 border-b border-slate-800">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>臨床問診對話與醫學術語翻譯記錄</span>
            </span>
            <span className="text-slate-500">{recognitionLogs.length} 則已處理</span>
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto">
            {recognitionLogs.length > 0 ? (
              recognitionLogs.map((log, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span>{log.time}</span>
                    <span className="text-cyan-400 font-semibold">Gemini 3.8 醫學精準翻譯</span>
                  </div>
                  <div className="text-xs text-slate-300 font-medium">{log.original}</div>
                  <div className="text-xs text-amber-300 font-bold">{log.translated}</div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-slate-500">
                尚未開始辨識，點擊上方按鈕即可啟動麥克風即時問診傳譯
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
