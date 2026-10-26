import React from 'react';
import { X, Check, Globe, Type, Palette, Layout, Sparkles, Volume2 } from 'lucide-react';
import { SubtitleSettings, SubtitleFontSize, SubtitleColor, SubtitlePosition } from '../types';
import { SUPPORTED_LANGUAGES, SOURCE_LANGUAGES } from '../constants/languages';

interface SubtitleSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SubtitleSettings;
  onUpdateSettings: (newSettings: Partial<SubtitleSettings>) => void;
}

export const SubtitleSettingsModal: React.FC<SubtitleSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  const fontSizes: { label: string; value: SubtitleFontSize }[] = [
    { label: '小 (SM)', value: 'sm' },
    { label: '標準 (Base)', value: 'base' },
    { label: '大 (LG)', value: 'lg' },
    { label: '特大 (XL)', value: 'xl' },
    { label: '超大 (2XL)', value: '2xl' },
  ];

  const colors: { label: string; value: SubtitleColor; bg: string }[] = [
    { label: '影院黃', value: 'yellow', bg: 'bg-amber-400' },
    { label: '純淨白', value: 'white', bg: 'bg-white' },
    { label: '科技青', value: 'cyan', bg: 'bg-cyan-400' },
    { label: '薄荷綠', value: 'green', bg: 'bg-emerald-400' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">字幕與自動翻譯設定</h2>
              <p className="text-xs text-slate-400">個人化各國語言字幕排版、雙語顯示與發音</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1">
          {/* Target Language Selection */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-blue-400" />
              <span>目標翻譯語言 (Target Language)</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-1 bg-slate-950/60 rounded-xl border border-slate-800">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => onUpdateSettings({ targetLanguage: lang.code })}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                    settings.targetLanguage === lang.code
                      ? 'bg-blue-600 text-white font-semibold shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800/80'
                  }`}
                >
                  <span className="flex items-center gap-1.5 truncate">
                    <span>{lang.flag}</span>
                    <span className="truncate">{lang.nativeName}</span>
                  </span>
                  {settings.targetLanguage === lang.code && <Check className="w-3.5 h-3.5 shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* Bilingual Mode Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div>
              <div className="text-xs font-semibold text-white">雙語字幕對照模式</div>
              <div className="text-[11px] text-slate-400">同時顯示影片原文對話與翻譯字幕</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.bilingualMode}
                onChange={(e) => onUpdateSettings({ bilingualMode: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Subtitle Placement Position */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
              <Layout className="w-4 h-4 text-emerald-400" />
              <span>字幕顯示位置 (Position)</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onUpdateSettings({ position: 'bottom-dock' })}
                className={`p-3 rounded-xl border text-left text-xs transition-all ${
                  settings.position === 'bottom-dock'
                    ? 'border-blue-500 bg-blue-500/10 text-white font-medium'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="font-semibold text-slate-200 mb-0.5">底部專屬字幕欄 (推薦)</div>
                <div className="text-[11px] text-slate-400">獨立於影片下方，不遮擋影片畫面任何細節</div>
              </button>

              <button
                onClick={() => onUpdateSettings({ position: 'video-overlay' })}
                className={`p-3 rounded-xl border text-left text-xs transition-all ${
                  settings.position === 'video-overlay'
                    ? 'border-blue-500 bg-blue-500/10 text-white font-medium'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="font-semibold text-slate-200 mb-0.5">影片內部浮動字幕</div>
                <div className="text-[11px] text-slate-400">如同 YouTube / 電影院沉浸式浮動字幕</div>
              </button>
            </div>
          </div>

          {/* Font Size Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
              <Type className="w-4 h-4 text-purple-400" />
              <span>字幕字體大小 (Font Size)</span>
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {fontSizes.map((item) => (
                <button
                  key={item.value}
                  onClick={() => onUpdateSettings({ fontSize: item.value })}
                  className={`py-2 px-1 text-center rounded-xl text-xs font-medium border transition-all ${
                    settings.fontSize === item.value
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Font Color Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-amber-400" />
              <span>翻譯字幕顏色 (Color)</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {colors.map((c) => (
                <button
                  key={c.value}
                  onClick={() => onUpdateSettings({ fontColor: c.value })}
                  className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                    settings.fontColor === c.value
                      ? 'border-blue-500 bg-blue-500/10 text-white'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className={`w-3.5 h-3.5 rounded-full ${c.bg}`}></span>
                  <span>{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Background Opacity */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1.5">
              <span>字幕底色透明度 (Background Opacity)</span>
              <span className="text-blue-400 font-mono">{settings.bgOpacity}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={settings.bgOpacity}
              onChange={(e) => onUpdateSettings({ bgOpacity: parseInt(e.target.value) })}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          {/* Interactive Learning and TTS */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div>
                <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>點擊單字查詢 AI 詳細釋義</span>
                </div>
                <div className="text-[11px] text-slate-400">點擊原文任意字詞立即呼叫 Gemini 深度解析</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showVocabHints}
                  onChange={(e) => onUpdateSettings({ showVocabHints: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors shadow-sm"
          >
            完成並儲存偏好
          </button>
        </div>
      </div>
    </div>
  );
};
