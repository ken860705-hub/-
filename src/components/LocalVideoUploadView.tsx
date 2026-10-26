import React, { useState } from 'react';
import { UploadCloud, Link as LinkIcon, Sparkles, ArrowRight, Stethoscope, Shield } from 'lucide-react';
import { VideoItem } from '../types';

interface LocalVideoUploadViewProps {
  onLoadCustomVideo: (video: VideoItem) => void;
}

export const LocalVideoUploadView: React.FC<LocalVideoUploadViewProps> = ({
  onLoadCustomVideo,
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (file: File) => {
    if (!file || !file.type.startsWith('video/')) {
      alert('請選擇有效的影音檔案 (如 MP4, WebM, MOV 等)');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const newVideo: VideoItem = {
      id: `local-${Date.now()}`,
      title: file.name.replace(/\.[^/.]+$/, ''),
      category: '臨床案例/手術錄影',
      specialty: 'surgery',
      originalLanguage: 'auto',
      videoUrl: objectUrl,
      duration: 0,
      thumbnail: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
      description: '從本機載入的手術內視鏡錄影或醫學演講檔案，支援自動識別醫學術語與即時雙語字幕。',
      defaultCues: [],
      isLocalFile: true,
    };

    onLoadCustomVideo(newVideo);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    const newVideo: VideoItem = {
      id: `url-${Date.now()}`,
      title: videoTitle.trim() || '臨床手術/醫學會議串流',
      category: '線上醫學串流',
      specialty: 'general',
      originalLanguage: 'auto',
      videoUrl: urlInput.trim(),
      duration: 0,
      thumbnail: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=800&q=80',
      description: `串流網址: ${urlInput.trim()}`,
      defaultCues: [],
      isCustomUrl: true,
    };

    onLoadCustomVideo(newVideo);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-900/60 flex items-center justify-center">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-semibold border border-cyan-500/20">
            <Shield className="w-3.5 h-3.5" />
            <span>符合 HIPAA / GDPR 臨床影音資料隱私安全規範</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            載入本機手術錄影或臨床病例影片
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
            支援腹腔鏡、關節鏡、達文西手術記錄或海外醫學年會演講影片。系統將在畫面下方自動對齊解剖構造與藥理名詞並生成即時字幕。
          </p>
        </div>

        {/* Drag & Drop Box */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all cursor-pointer relative overflow-hidden ${
            isDragging
              ? 'border-cyan-500 bg-cyan-500/10 scale-[1.01]'
              : 'border-slate-700/80 bg-slate-950/60 hover:border-slate-600 hover:bg-slate-950/80'
          }`}
        >
          <input
            type="file"
            accept="video/*"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          <div className="space-y-4 pointer-events-none">
            <div className="w-16 h-16 rounded-2xl bg-cyan-600/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center mx-auto">
              <UploadCloud className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm sm:text-base font-bold text-slate-200">
                拖曳手術錄影或病例檔案至此處，或點擊選擇本機影片
              </p>
              <p className="text-xs text-slate-400 mt-1">
                支援 MP4, WebM, MOV, MKV（電腦端、手術室 iPad、行動載具皆可選取本機臨床檔案）
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <div className="flex-1 h-px bg-slate-800"></div>
          <span>或輸入線上醫學研討會 / 手術影片網址</span>
          <div className="flex-1 h-px bg-slate-800"></div>
        </div>

        {/* URL Form */}
        <form onSubmit={handleUrlSubmit} className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">病例或手術名稱 (選填)</label>
            <input
              type="text"
              placeholder="例如：達文西心瓣膜修補手術、NEJM 臨床病例討論..."
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">串流網址 (Direct Video URL or YouTube)</label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <LinkIcon className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="https://... 或 https://youtube.com/watch?v=..."
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <button
                type="submit"
                disabled={!urlInput.trim()}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-1.5 shrink-0"
              >
                <span>載入播放</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
