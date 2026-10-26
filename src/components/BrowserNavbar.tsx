import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Home,
  Search,
  Lock,
  Globe,
  Settings,
  FileText,
  Mic,
  MicOff,
  Video,
  UploadCloud,
  X,
  Compass,
} from 'lucide-react';
import { Language, SubtitleSettings } from '../types';
import { SUPPORTED_LANGUAGES } from '../constants/languages';

interface BrowserNavbarProps {
  currentUrl: string;
  onNavigateUrl: (url: string) => void;
  activeTab: 'video' | 'library' | 'upload' | 'live-mic';
  onTabChange: (tab: 'video' | 'library' | 'upload' | 'live-mic') => void;
  videoTitle: string;
  subtitleSettings: SubtitleSettings;
  onUpdateSettings: (settings: Partial<SubtitleSettings>) => void;
  onOpenSettingsModal: () => void;
  onToggleTranscript: () => void;
  isTranscriptOpen: boolean;
  transcriptCount: number;
  isLiveMicActive: boolean;
  onToggleLiveMic: () => void;
  onRefresh: () => void;
}

export const BrowserNavbar: React.FC<BrowserNavbarProps> = ({
  currentUrl,
  onNavigateUrl,
  activeTab,
  onTabChange,
  videoTitle,
  subtitleSettings,
  onUpdateSettings,
  onOpenSettingsModal,
  onToggleTranscript,
  isTranscriptOpen,
  transcriptCount,
  isLiveMicActive,
  onToggleLiveMic,
  onRefresh,
}) => {
  const [inputUrl, setInputUrl] = useState(currentUrl);
  const [showLangDropdown, setShowLangDropdown] = useState(false);

  // Sync input when currentUrl changes
  React.useEffect(() => {
    setInputUrl(currentUrl);
  }, [currentUrl]);

  const handleSubmitUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputUrl.trim()) {
      onNavigateUrl(inputUrl.trim());
      onTabChange('video');
    }
  };

  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.code === subtitleSettings.targetLanguage) || SUPPORTED_LANGUAGES[0];

  return (
    <div className="bg-slate-900 border-b border-slate-800 flex flex-col select-none z-20">
      {/* Top Browser Tab Bar */}
      <div className="flex items-center justify-between px-3 pt-2 bg-slate-950/80 border-b border-slate-800/60 overflow-x-auto">
        <div className="flex items-center gap-1.5 mr-3 hidden sm:flex">
          <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
        </div>

        {/* Tab Items */}
        <div className="flex items-center gap-1 flex-1 overflow-x-auto py-1">
          <button
            onClick={() => onTabChange('video')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-t-lg text-xs font-medium max-w-[220px] truncate transition-all ${
              activeTab === 'video'
                ? 'bg-slate-900 text-blue-400 border-t-2 border-blue-500 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            <Video className="w-3.5 h-3.5 shrink-0 text-blue-400" />
            <span className="truncate">{videoTitle || '影片播放與即時翻譯'}</span>
          </button>

          <button
            onClick={() => onTabChange('library')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-t-lg text-xs font-medium transition-all ${
              activeTab === 'library'
                ? 'bg-slate-900 text-blue-400 border-t-2 border-blue-500 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            <Compass className="w-3.5 h-3.5 shrink-0 text-amber-400" />
            <span className="hidden sm:inline">國際影音庫</span>
            <span className="sm:hidden">探索</span>
          </button>

          <button
            onClick={() => onTabChange('upload')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-t-lg text-xs font-medium transition-all ${
              activeTab === 'upload'
                ? 'bg-slate-900 text-blue-400 border-t-2 border-blue-500 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
            <span className="hidden sm:inline">開啟本機影片</span>
            <span className="sm:hidden">檔案</span>
          </button>

          <button
            onClick={() => onTabChange('live-mic')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-t-lg text-xs font-medium transition-all ${
              activeTab === 'live-mic'
                ? 'bg-slate-900 text-blue-400 border-t-2 border-blue-500 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            <Mic className="w-3.5 h-3.5 shrink-0 text-purple-400" />
            <span className="hidden sm:inline">即時收音翻譯</span>
            <span className="sm:hidden">麥克風</span>
          </button>
        </div>
      </div>

      {/* Main Omnibox Navigation Row */}
      <div className="px-3 py-2 flex items-center gap-2">
        {/* Navigation buttons */}
        <div className="flex items-center gap-1 text-slate-400">
          <button
            onClick={() => onTabChange('library')}
            className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-slate-200 transition-colors"
            title="首頁 / 影片庫"
          >
            <Home className="w-4 h-4" />
          </button>
          <button
            onClick={onRefresh}
            className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-slate-200 transition-colors"
            title="重新載入"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        {/* Address & Search Bar */}
        <form onSubmit={handleSubmitUrl} className="flex-1 relative">
          <div className="flex items-center bg-slate-950/90 border border-slate-700/70 hover:border-blue-500/60 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 rounded-xl px-3 py-1.5 transition-all text-xs sm:text-sm">
            <Lock className="w-3.5 h-3.5 text-emerald-400 mr-2 shrink-0" />
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="輸入影片網址 (如 MP4、WebM 或 YouTube 影片連結)..."
              className="w-full bg-transparent text-slate-100 placeholder-slate-500 focus:outline-none"
            />
            {inputUrl && (
              <button
                type="button"
                onClick={() => setInputUrl('')}
                className="text-slate-500 hover:text-slate-300 mr-1.5 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-2 py-0.5 rounded-md text-xs transition-colors shrink-0 flex items-center gap-1"
            >
              <Search className="w-3 h-3" />
              <span className="hidden sm:inline">前往</span>
            </button>
          </div>
        </form>

        {/* Quick Language Selector */}
        <div className="relative">
          <button
            onClick={() => setShowLangDropdown(!showLangDropdown)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs font-medium text-slate-200 transition-colors"
            title="選擇目標字幕翻譯語言"
          >
            <span className="text-base leading-none">{currentLang.flag}</span>
            <span className="hidden md:inline">{currentLang.nativeName}</span>
            <span className="text-slate-400 text-[10px]">▼</span>
          </button>

          {showLangDropdown && (
            <div className="absolute right-0 mt-2 w-56 max-h-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1 overflow-y-auto z-50">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 border-b border-slate-800 flex items-center justify-between">
                <span>選擇翻譯目標語言</span>
                <Globe className="w-3.5 h-3.5 text-blue-400" />
              </div>
              {SUPPORTED_LANGUAGES.map((lang: Language) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    onUpdateSettings({ targetLanguage: lang.code });
                    setShowLangDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                    subtitleSettings.targetLanguage === lang.code
                      ? 'bg-blue-600/20 text-blue-400 font-semibold'
                      : 'text-slate-200 hover:bg-slate-800/80'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-sm">{lang.flag}</span>
                    <span>{lang.nativeName}</span>
                  </span>
                  <span className="text-slate-500 text-[10px]">{lang.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Transcript Drawer Toggle */}
        <button
          onClick={onToggleTranscript}
          className={`relative p-2 rounded-xl border transition-colors ${
            isTranscriptOpen
              ? 'bg-blue-600/20 border-blue-500 text-blue-400'
              : 'bg-slate-800 hover:bg-slate-700/80 border-slate-700 text-slate-300'
          }`}
          title="開啟逐字稿與 AI 重點總結"
        >
          <FileText className="w-4 h-4" />
          {transcriptCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-blue-600 text-[10px] font-bold text-white px-1.5 py-0.2 rounded-full min-w-4 text-center">
              {transcriptCount}
            </span>
          )}
        </button>

        {/* Live Mic Speech Listen Button */}
        <button
          onClick={onToggleLiveMic}
          className={`p-2 rounded-xl border transition-colors ${
            isLiveMicActive
              ? 'bg-red-600 border-red-500 text-white animate-pulse'
              : 'bg-slate-800 hover:bg-slate-700/80 border-slate-700 text-slate-300'
          }`}
          title={isLiveMicActive ? '停止麥克風即時辨識' : '開啟麥克風/系統音即時語音辨識翻譯'}
        >
          {isLiveMicActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
        </button>

        {/* Subtitle Appearance Settings Modal Button */}
        <button
          onClick={onOpenSettingsModal}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-300 transition-colors"
          title="字幕樣式與雙語偏好設定"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
