import React, { useState } from 'react';
import { UploadCloud, Link as LinkIcon, FileVideo, Sparkles, Check, ArrowRight } from 'lucide-react';
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
      alert('請選擇有效的影片檔案 (如 MP4, WebM, MOV 等)');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const newVideo: VideoItem = {
      id: `local-${Date.now()}`,
      title: file.name.replace(/\.[^/.]+$/, ''),
      category: '本機上傳影片',
      originalLanguage: 'auto',
      videoUrl: objectUrl,
      duration: 0,
      thumbnail: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80',
      description: '從本機裝置載入的自訂影音檔案，支援即時語音識別與字幕自動翻譯。',
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
      title: videoTitle.trim() || '自訂網路影片串流',
      category: '網路影音串流',
      originalLanguage: 'auto',
      videoUrl: urlInput.trim(),
      duration: 0,
      thumbnail: 'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?auto=format&fit=crop&w=800&q=80',
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
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            開啟本機檔案或自訂串流網址
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            無論是電腦硬碟裡的學習影集、手機錄影、或是網路直播與 MP4 連結，皆可自動在下方顯示各國語言翻譯字幕
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
              ? 'border-blue-500 bg-blue-500/10 scale-[1.01]'
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
            <div className="w-16 h-16 rounded-2xl bg-blue-600/10 text-blue-400 border border-blue-500/20 flex items-center justify-center mx-auto">
              <UploadCloud className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm sm:text-base font-bold text-slate-200">
                拖曳影片檔案至此處，或點擊選擇本機影片
              </p>
              <p className="text-xs text-slate-400 mt-1">
                支援 MP4, WebM, MOV, MKV 等所有主流格式（電腦、平板、手機皆可選取本機相簿或檔案庫）
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <div className="flex-1 h-px bg-slate-800"></div>
          <span>或輸入網路串流影片連結</span>
          <div className="flex-1 h-px bg-slate-800"></div>
        </div>

        {/* URL Form */}
        <form onSubmit={handleUrlSubmit} className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">影片標題 (選填)</label>
            <input
              type="text"
              placeholder="例如：日劇第 1 集、英語 TED 演講..."
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">影片網址 (Direct Video URL or YouTube)</label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <LinkIcon className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="https://... 或 https://youtube.com/watch?v=..."
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              <button
                type="submit"
                disabled={!urlInput.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-1.5 shrink-0"
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
