import React from 'react';
import {
  X,
  Check,
  Globe,
  Type,
  Palette,
  Layout,
  Stethoscope,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { SubtitleSettings, SubtitleFontSize, SubtitleColor, MedicalSpecialty } from '../types';
import { SUPPORTED_LANGUAGES } from '../constants/languages';
import { MEDICAL_SPECIALTIES } from '../constants/medicalSpecialties';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">進階醫療字幕與專科設定</h2>
              <p className="text-xs text-slate-400">客製化醫學術語精準度、專科領域與實體標註</p>
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
        <div className="p-5 space-y-5 overflow-y-auto flex-1 text-xs">
          {/* Medical Specialty Selection */}
          <div>
            <label className="font-bold text-slate-300 block mb-1.5 flex items-center gap-1.5">
              <Stethoscope className="w-4 h-4 text-cyan-400" />
              <span>臨床醫學專科 (Medical Specialty)</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {MEDICAL_SPECIALTIES.map((spec) => (
                <button
                  key={spec.id}
                  onClick={() => onUpdateSettings({ specialty: spec.id })}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    settings.specialty === spec.id
                      ? 'border-cyan-500 bg-cyan-500/15 text-white font-bold shadow-sm'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span>{spec.icon}</span>
                    <span className="truncate text-slate-200">{spec.name}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 line-clamp-1">{spec.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Target Language Selection */}
          <div>
            <label className="font-bold text-slate-300 block mb-1.5 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-blue-400" />
              <span>目標翻譯語言 (Target Language)</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto p-1 bg-slate-950/60 rounded-xl border border-slate-800">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => onUpdateSettings({ targetLanguage: lang.code })}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                    settings.targetLanguage === lang.code
                      ? 'bg-cyan-600 text-white font-semibold shadow-sm'
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

          {/* Medical Entity Highlight & MeSH Badge Toggles */}
          <div className="space-y-2 pt-1 border-t border-slate-800">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div>
                <div className="font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>突出顯示醫學實體標籤 (解剖/藥物/術式)</span>
                </div>
                <div className="text-[11px] text-slate-400">在字幕中自動以不同顏色標籤突出解剖結構、手術術式與藥品</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.highlightMedicalEntities}
                  onChange={(e) => onUpdateSettings({ highlightMedicalEntities: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div>
                <div className="font-bold text-white">雙語字幕對照模式</div>
                <div className="text-[11px] text-slate-400">同時顯示醫學英語/原文與翻譯字幕</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.bilingualMode}
                  onChange={(e) => onUpdateSettings({ bilingualMode: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
              </label>
            </div>
          </div>

          {/* Subtitle Placement Position */}
          <div>
            <label className="font-bold text-slate-300 block mb-1.5 flex items-center gap-1.5">
              <Layout className="w-4 h-4 text-emerald-400" />
              <span>字幕顯示位置 (Position)</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onUpdateSettings({ position: 'bottom-dock' })}
                className={`p-3 rounded-xl border text-left text-xs transition-all ${
                  settings.position === 'bottom-dock'
                    ? 'border-cyan-500 bg-cyan-500/10 text-white font-medium'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="font-bold text-slate-200 mb-0.5">底部專屬字幕欄 (推薦)</div>
                <div className="text-[11px] text-slate-400">獨立於手術畫面下方，完全不遮擋解剖結構</div>
              </button>

              <button
                onClick={() => onUpdateSettings({ position: 'video-overlay' })}
                className={`p-3 rounded-xl border text-left text-xs transition-all ${
                  settings.position === 'video-overlay'
                    ? 'border-cyan-500 bg-cyan-500/10 text-white font-medium'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="font-bold text-slate-200 mb-0.5">影片內部浮動字幕</div>
                <div className="text-[11px] text-slate-400">畫面底部疊加浮動字幕</div>
              </button>
            </div>
          </div>

          {/* Font Size Selector */}
          <div>
            <label className="font-bold text-slate-300 block mb-1.5 flex items-center gap-1.5">
              <Type className="w-4 h-4 text-purple-400" />
              <span>字幕字體大小 (Font Size)</span>
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {fontSizes.map((item) => (
                <button
                  key={item.value}
                  onClick={() => onUpdateSettings({ fontSize: item.value })}
                  className={`py-2 px-1 text-center rounded-xl text-xs font-semibold border transition-all ${
                    settings.fontSize === item.value
                      ? 'bg-cyan-600 border-cyan-500 text-white'
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
            <label className="font-bold text-slate-300 block mb-1.5 flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-amber-400" />
              <span>翻譯字幕顏色 (Color)</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {colors.map((c) => (
                <button
                  key={c.value}
                  onClick={() => onUpdateSettings({ fontColor: c.value })}
                  className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                    settings.fontColor === c.value
                      ? 'border-cyan-500 bg-cyan-500/15 text-white'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className={`w-3.5 h-3.5 rounded-full ${c.bg}`}></span>
                  <span>{c.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors shadow-sm"
          >
            完成並儲存醫療偏好
          </button>
        </div>
      </div>
    </div>
  );
};
