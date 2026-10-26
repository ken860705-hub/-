import React from 'react';
import { SAMPLE_VIDEOS } from '../constants/sampleVideos';
import { VideoItem, SubtitleSettings } from '../types';
import { Play, Globe, Sparkles, Clock, CheckCircle } from 'lucide-react';

interface VideoLibraryViewProps {
  onSelectVideo: (video: VideoItem) => void;
  currentVideoId: string;
  subtitleSettings: SubtitleSettings;
}

export const VideoLibraryView: React.FC<VideoLibraryViewProps> = ({
  onSelectVideo,
  currentVideoId,
  subtitleSettings,
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-900/60">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Banner */}
        <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/40 to-slate-900 border border-blue-500/30 rounded-2xl p-5 sm:p-7 relative overflow-hidden shadow-xl">
          <div className="relative z-10 max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>多國語言影音資料庫 • 全球精選</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              探索各國語言影片，享受沉浸式即時字幕翻譯
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              點擊任意影片即可立即開始播放，底部將自動顯示您選擇的語言字幕。亦可隨時在上方網址列輸入任意網路影片網址或上傳本機檔案。
            </p>
          </div>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {SAMPLE_VIDEOS.map((video) => {
            const isCurrent = video.id === currentVideoId;
            return (
              <div
                key={video.id}
                onClick={() => onSelectVideo(video)}
                className={`group rounded-2xl border overflow-hidden cursor-pointer transition-all duration-300 flex flex-col bg-slate-950/60 ${
                  isCurrent
                    ? 'border-blue-500 shadow-[0_0_25px_rgba(37,99,235,0.25)] ring-1 ring-blue-500'
                    : 'border-slate-800/80 hover:border-slate-700 hover:shadow-xl'
                }`}
              >
                {/* Thumbnail Container */}
                <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/30"></div>

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-blue-500 transition-all">
                      <Play className="w-5 h-5 fill-white ml-0.5" />
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur border border-white/10 text-[11px] font-bold text-white flex items-center gap-1">
                      <Globe className="w-3 h-3 text-blue-400" />
                      <span>{video.category}</span>
                    </span>
                  </div>

                  {isCurrent && (
                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-1 rounded-lg bg-blue-600 text-[11px] font-bold text-white flex items-center gap-1 shadow-md">
                        <CheckCircle className="w-3 h-3" />
                        <span>正在播放</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Info Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2">
                      {video.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {video.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-900">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>字幕庫已就緒 ({video.defaultCues.length} 句精準語音段落)</span>
                    </span>
                    <span className="text-blue-400 font-semibold group-hover:underline">
                      立即開啟觀看 →
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
